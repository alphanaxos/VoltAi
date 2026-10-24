import { useState, useCallback } from 'react';
import {
    fetchWeatherForecast,
    fetchSolarRadiation,
    fetchFestivalsWithNeighbors,
    interpolateWeatherHourly,
    buildCalendarOverrides,
    buildForecastPayload,
    validatePayload,
    submitForecast,
} from '../services/forecastService';

/**
 * useForecast24h
 *
 * Custom React hook that drives the full forecast workflow:
 *   Select date → fetch APIs → combine 24-hour data → validate → predict
 *
 * Returns state values and action callbacks for the System Overview UI.
 */
export default function useForecast24h() {
    const [selectedDate, setSelectedDate] = useState('');
    const [calendarOverrides, setCalendarOverrides] = useState(null);
    const [festivalInfo, setFestivalInfo] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [apiStatus, setApiStatus] = useState(null);

    /**
     * Fetch live weather, solar radiation, and festival data for the given
     * YYYY-MM-DD date.  Returns { rows, calendar } on success, or null.
     */
    const fetchLiveData = useCallback(async (dateStr) => {
        if (!dateStr) {
            setError('Please select a forecast date.');
            return null;
        }

        setLoading(true);
        setError(null);
        setApiStatus(null);
        setForecast(null);

        const status = { weather: 'pending', solar: 'pending', festival: 'pending' };

        try {
            // Fire all three API calls in parallel
            const [weatherResult, solarResult, festivalResult] = await Promise.allSettled([
                fetchWeatherForecast(),
                fetchSolarRadiation(dateStr),
                fetchFestivalsWithNeighbors(dateStr),
            ]);

            /* --- Weather --- */
            let hourlyWeather = null;
            if (weatherResult.status === 'fulfilled' && weatherResult.value?.list) {
                hourlyWeather = interpolateWeatherHourly(weatherResult.value.list, dateStr);
                const available = hourlyWeather.filter(Boolean).length;
                status.weather =
                    available < 24
                        ? `partial (${available}/24 hours — date may be outside the 5-day forecast window)`
                        : 'ok';
            } else {
                status.weather = `failed: ${weatherResult.reason?.message || 'Unknown error'}`;
            }

            /* --- Solar radiation --- */
            let hourlySolar = null;
            if (
                solarResult.status === 'fulfilled' &&
                solarResult.value?.hourly?.shortwave_radiation
            ) {
                hourlySolar = solarResult.value.hourly.shortwave_radiation;
                status.solar = hourlySolar.length === 24 ? 'ok' : `ok (${hourlySolar.length} hrs)`;
            } else {
                status.solar = `failed: ${solarResult.reason?.message || 'Unknown error'}`;
            }

            /* --- Festivals --- */
            let festivalBundle = null;
            if (festivalResult.status === 'fulfilled') {
                festivalBundle = festivalResult.value;
                const cnt = festivalBundle.target?.count ?? 0;
                status.festival =
                    cnt > 0
                        ? `ok (${cnt} festival${cnt > 1 ? 's' : ''} found)`
                        : 'ok (no festivals)';
            } else {
                status.festival = `failed: ${festivalResult.reason?.message || 'CORS / network error'}`;
            }

            setApiStatus(status);

            // Weather is mandatory
            if (!hourlyWeather || hourlyWeather.filter(Boolean).length === 0) {
                throw new Error(
                    'Weather data is required but unavailable. The selected date may be outside the 5-day forecast window, or the OpenWeatherMap API is unreachable.'
                );
            }

            /* --- Combine into 24 table rows --- */
            const rows = Array.from({ length: 24 }, (_, h) => {
                const w = hourlyWeather[h];
                return {
                    hour: h,
                    temp: w ? w.temperature : 0,
                    humidity: w ? w.humidity : 0,
                    wind: w ? w.wind_speed : 0,
                    solar: hourlySolar ? (hourlySolar[h] ?? 0) : 0,
                };
            });

            /* --- Calendar overrides --- */
            const calendar = buildCalendarOverrides(dateStr, festivalBundle);

            /* --- Festival display info --- */
            const names =
                festivalBundle?.target?.festivals?.map((f) => f.display_name || f.name) || [];
            setFestivalInfo({
                names,
                isWeekend: calendar[0]?.is_weekend === 1,
                isHoliday: calendar[0]?.is_holiday === 1,
                isFestival: calendar[0]?.is_festival === 1,
            });

            setCalendarOverrides(calendar);
            setLoading(false);

            return { rows, calendar };
        } catch (err) {
            setError(err.message || 'Failed to fetch live data.');
            setLoading(false);
            return null;
        }
    }, []);

    /**
     * Frame the payload from the (possibly user-edited) weather table rows
     * and the calendar overrides, validate, and submit to /forecast/24h.
     *
     * @param {Array} rows          24 weather-row objects { temp, humidity, wind, solar }
     * @param {Array} calOverrides  optional — defaults to the hook's calendarOverrides
     */
    const generateForecast = useCallback(
        async (rows, calOverrides) => {
            const calendar = calOverrides || calendarOverrides;

            if (!rows || rows.length !== 24) {
                throw new Error('Weather data must contain exactly 24 hourly rows.');
            }
            if (!calendar || calendar.length !== 24) {
                throw new Error(
                    'Calendar overrides not available. Select a date and fetch live data first.'
                );
            }

            setSubmitting(true);
            setError(null);

            try {
                const payload = buildForecastPayload(rows, calendar);
                const validation = validatePayload(payload);

                if (!validation.valid) {
                    throw new Error(
                        `Payload validation failed:\n• ${validation.errors.join('\n• ')}`
                    );
                }

                const result = await submitForecast(payload);
                setForecast(result);
                setSubmitting(false);
                return result;
            } catch (err) {
                setError(err.message || 'Forecast generation failed.');
                setSubmitting(false);
                throw err;
            }
        },
        [calendarOverrides]
    );

    return {
        selectedDate,
        setSelectedDate,
        calendarOverrides,
        festivalInfo,
        forecast,
        loading,
        submitting,
        error,
        apiStatus,
        fetchLiveData,
        generateForecast,
        setError,
        setForecast,
    };
}
