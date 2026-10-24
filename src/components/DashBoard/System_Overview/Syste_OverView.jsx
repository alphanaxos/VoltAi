import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Syste_OverView.css';
import useForecast24h from '../../../hooks/useForecast24h';
import ThemedDatePicker from './ThemedDatePicker';

/* =====================================================================
   Defaults (demo data). Replace by passing props:
     <Syste_OverView
        telemetry={{ demandMw, timestamp, provenance, temperatureC, humidityPct }}
        series={[{ t: '2024-01-08T00:00:00', mw: 1980.2 }, ...]}   // hourly demand
        onRefresh={async () => { ...reload telemetry + series... }}
        onGenerate={async (weatherRows) => [mw0, mw1, ... mw23]}  // XGBoost call
     />
   ===================================================================== */

const DEFAULT_TELEMETRY = {
    demandMw: 2089.4,
    timestamp: '2024-12-31 23:00:00',
    provenance: 'Historical Record',
    temperatureC: 22.4,
    humidityPct: 69,
};

const FIELDS = [
    { key: 'temp', label: 'Temp (°C)', step: 0.1, min: -10, max: 60 },
    { key: 'humidity', label: 'Humidity (%)', step: 1, min: 0, max: 100 },
    { key: 'wind', label: 'Wind (m/s)', step: 0.1, min: 0, max: 60 },
    { key: 'solar', label: 'Solar (W/m²)', step: 1, min: 0, max: 1400 },
];

/* ---------- helpers ---------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const fmtDay = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const fmtStamp = (d) => `${fmtDay(d)}, ${d.getFullYear()} ${pad(d.getHours())}:00`;
const fmtFullDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};
const fmtNum = (n, digits = 1) =>
    Number(n).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function mulberry32(seed) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function makeDemoSeries() {
    const rand = mulberry32(2024);
    const out = [];
    for (let i = 0; i < 168; i += 1) {
        const day = Math.floor(i / 24);
        const hour = i % 24;
        const daily = 150 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
        const weekend = day >= 5 ? -230 : 0;
        const noise = (rand() - 0.5) * 160;
        out.push({ t: new Date(2024, 0, 8 + day, hour), mw: Math.round((1900 + daily + weekend + noise) * 10) / 10 });
    }
    return out;
}

function niceScale(min, max, count = 5) {
    const range = max - min || 1;
    const rough = range / (count - 1);
    const pow = 10 ** Math.floor(Math.log10(rough));
    const frac = rough / pow;
    const step = (frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10) * pow;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { lo, hi, ticks };
}

/* ---------- small icons ---------- */
function Svg({ children, size = 20, ...rest }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...rest}
        >
            {children}
        </svg>
    );
}

const ClockIcon = () => (
    <Svg>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </Svg>
);
const ChevronIcon = () => (
    <Svg size={18} className="so-chevron">
        <path d="m6 9 6 6 6-6" />
    </Svg>
);
const InfoIcon = () => (
    <Svg size={16}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
    </Svg>
);
const RefreshIcon = ({ spinning }) => (
    <Svg size={16} className={spinning ? 'so-spin' : ''}>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
    </Svg>
);

function Hint({ text }) {
    return (
        <span className="so-hint" tabIndex={0} role="img" aria-label={text} data-tip={text}>
            <Svg size={13}>
                <circle cx="12" cy="12" r="9.5" />
                <path d="M9.6 9.2a2.5 2.5 0 0 1 4.9.8c0 1.7-2.5 2.2-2.5 3.7" />
                <path d="M12 17h.01" />
            </Svg>
        </span>
    );
}

/* =====================================================================
   Line chart
   ===================================================================== */
function LineChart({ points, xTicks, yLabel, xLabel, gradId, label, unit = 'MW', compact = false }) {
    const wrapRef = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const [hover, setHover] = useState(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return undefined;
        const update = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const isMobile = size.w < 520;

    const geo = useMemo(() => {
        const { w, h } = size;
        if (!w || !h || points.length < 2) return null;
        const leftMargin = yLabel ? (w < 520 ? 70 : 74) : (w < 520 ? 46 : 54);
        const m = { top: 12, right: 14, bottom: 54, left: leftMargin };
        const iw = w - m.left - m.right;
        const ih = h - m.top - m.bottom;
        const vals = points.map((p) => p.value);
        const scale = niceScale(Math.min(...vals), Math.max(...vals));
        const x = (i) => m.left + (i / (points.length - 1)) * iw;
        const y = (v) => m.top + ih - ((v - scale.lo) / (scale.hi - scale.lo)) * ih;
        const base = m.top + ih;
        const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join('');
        const area = `${line}L${x(points.length - 1).toFixed(1)} ${base}L${x(0).toFixed(1)} ${base}Z`;
        return { m, iw, ih, scale, x, y, base, line, area };
    }, [size, points, yLabel]);

    const onMove = (e) => {
        if (!geo) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const idx = Math.round(((e.clientX - rect.left) / geo.iw) * (points.length - 1));
        setHover(Math.max(0, Math.min(points.length - 1, idx)));
    };

    let visibleTicks = xTicks;
    if (geo && xTicks.length > 1) {
        const px = ((xTicks[1].index - xTicks[0].index) / (points.length - 1)) * geo.iw;
        const skip = Math.max(1, Math.ceil(56 / px));
        visibleTicks = xTicks.filter((_, i) => i % skip === 0);
    }

    const hp = hover !== null ? points[hover] : null;

    return (
        <div className={`so-chart ${compact ? 'compact' : ''}`} ref={wrapRef}>
            {geo && (
                <>
                    <svg width={size.w} height={size.h} role="img" aria-label={label}>
                        <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" style={{ stopColor: 'var(--c)', stopOpacity: 0.22 }} />
                                <stop offset="100%" style={{ stopColor: 'var(--c)', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>

                        {geo.scale.ticks.map((tv) => (
                            <g key={tv}>
                                <line className="so-grid" x1={geo.m.left} x2={size.w - geo.m.right} y1={geo.y(tv)} y2={geo.y(tv)} />
                                <text className="so-axis-text" x={geo.m.left - 8} y={geo.y(tv) + 3} textAnchor="end">
                                    {fmtNum(tv, 0)}
                                </text>
                            </g>
                        ))}

                        <path d={geo.area} fill={`url(#${gradId})`} />
                        <path className="so-line" d={geo.line} />

                        {visibleTicks.map((tk) => (
                            <g key={tk.index}>
                                <text className="so-axis-text" x={geo.x(tk.index)} y={geo.base + 16} textAnchor="middle">
                                    {tk.label}
                                </text>
                                {tk.sub && (
                                    <text className="so-axis-text" x={geo.x(tk.index)} y={geo.base + 29} textAnchor="middle">
                                        {tk.sub}
                                    </text>
                                )}
                            </g>
                        ))}

                        <text
                            className="so-axis-title"
                            transform={`translate(${isMobile ? 12 : 14} ${geo.m.top + geo.ih / 2}) rotate(-90)`}
                            textAnchor="middle"
                        >
                            {yLabel}
                        </text>
                        <text className="so-axis-title" x={geo.m.left + geo.iw / 2} y={size.h - 4} textAnchor="middle">
                            {xLabel}
                        </text>

                        {hp && (
                            <g>
                                <line className="so-guide" x1={geo.x(hover)} x2={geo.x(hover)} y1={geo.m.top} y2={geo.base} />
                                <circle className="so-dot" cx={geo.x(hover)} cy={geo.y(hp.value)} r="4" />
                            </g>
                        )}

                        <rect
                            x={geo.m.left}
                            y={geo.m.top}
                            width={geo.iw}
                            height={geo.ih}
                            fill="transparent"
                            style={{ touchAction: 'pan-y' }}
                            onPointerMove={onMove}
                            onPointerDown={onMove}
                            onPointerLeave={() => setHover(null)}
                        />
                    </svg>

                    {hp && (
                        <div className={`so-tip ${geo.x(hover) > size.w * 0.62 ? 'flip' : ''}`} style={{ left: geo.x(hover) }}>
                            <strong>
                                {fmtNum(hp.value)} {unit}
                            </strong>
                            <span>{hp.label}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* =====================================================================
   Main component
   ===================================================================== */
function Syste_OverView({ telemetry, series, onGenerate, onRefresh }) {
    const t = { ...DEFAULT_TELEMETRY, ...telemetry };
    const [datePart, timePart] = String(t.timestamp).split(' ');

    /* ----- refresh state ----- */
    const [refreshing, setRefreshing] = useState(false);
    const [refreshMsg, setRefreshMsg] = useState(null);

    const handleRefresh = async () => {
        setRefreshMsg(null);
        if (!onRefresh) {
            setRefreshMsg({ type: 'info', text: 'No refresh handler connected. Pass an onRefresh prop.' });
            // Auto-clear info message after 3s
            setTimeout(() => setRefreshMsg(null), 3000);
            return;
        }
        setRefreshing(true);
        try {
            await onRefresh();
        } catch (err) {
            setRefreshMsg({ type: 'error', text: (err && err.message) || 'Refresh failed. Please try again.' });
        } finally {
            setRefreshing(false);
        }
    };

    /* ----- demand chart data ----- */
    const demand = useMemo(() => (series && series.length > 1 ? series : makeDemoSeries()), [series]);

    const demandPoints = useMemo(
        () => demand.map((d) => ({ label: fmtStamp(new Date(d.t)), value: d.mw })),
        [demand]
    );

    const demandTicks = useMemo(() => {
        const ticks = [];
        demand.forEach((d, i) => {
            const dt = new Date(d.t);
            if (dt.getHours() === 0) {
                ticks.push({ index: i, label: fmtDay(dt), sub: ticks.length === 0 ? String(dt.getFullYear()) : undefined });
            }
        });
        if (ticks.length < 2) {
            const n = demand.length;
            return [0, 1, 2, 3, 4, 5].map((k) => {
                const index = Math.round((k / 5) * (n - 1));
                return { index, label: fmtDay(new Date(demand[index].t)) };
            });
        }
        return ticks;
    }, [demand]);

    /* ----- live forecast hook ----- */
    const {
        selectedDate, setSelectedDate,
        calendarOverrides,
        festivalInfo,
        loading: fetchingLive,
        fetchLiveData,
        generateForecast,
        setError: setHookError,
    } = useForecast24h();

    const [dataSource, setDataSource] = useState('none');
    const [liveDefaults, setLiveDefaults] = useState(null);

    /* ----- forecast dropdown ----- */
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [forecast, setForecast] = useState(null);
    const [message, setMessage] = useState(null);

    const defaults = liveDefaults || [];
    const isEdited = (i, key) => Boolean(rows && defaults[i] && String(rows[i][key]) !== String(defaults[i][key]));
    const editedCount = rows ? rows.reduce((n, _, i) => n + FIELDS.filter((f) => isEdited(i, f.key)).length, 0) : 0;

    const setCell = (i, key, value) => {
        if (!rows) return;
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
    };

    const clampCell = (i, f, value) => {
        if (!rows) return;
        let finalVal = Number(value);
        if (value === '' || Number.isNaN(finalVal)) {
            finalVal = defaults[i] ? defaults[i][f.key] : 0;
        } else {
            finalVal = Math.min(f.max, Math.max(f.min, finalVal));
        }
        const updated = rows.map((r, idx) => (idx === i ? { ...r, [f.key]: finalVal } : r));
        setRows(updated);
        if (String(rows[i][f.key]) !== String(finalVal)) {
            runPrediction(updated, calendarOverrides);
        }
    };

    /* Auto-predict helper */
    const runPrediction = async (weatherRows, calOverrides) => {
        if (!weatherRows || weatherRows.length !== 24) return;
        setGenerating(true);
        setMessage(null);
        try {
            const result = await generateForecast(weatherRows, calOverrides || calendarOverrides);
            if (result && result.predictions) {
                setForecast(
                    result.predictions.map((p) => ({
                        hour: p.hour,
                        mw: p.predicted_load_mw,
                    }))
                );
            } else {
                throw new Error('Unexpected response format from prediction API.');
            }
        } catch (err) {
            setMessage({ type: 'error', text: (err && err.message) || 'Forecast prediction failed.' });
        } finally {
            setGenerating(false);
        }
    };

    /* Auto-fetch live weather + solar + festival data whenever a date is selected, then automatically generate forecast */
    const handleDateChange = async (newDate) => {
        setSelectedDate(newDate);
        if (!newDate) {
            setRows(null);
            setLiveDefaults(null);
            setForecast(null);
            setDataSource('none');
            return;
        }
        setMessage(null);
        setHookError(null);
        setForecast(null);

        // Step 1: Fetch live weather, solar, and festival data
        const result = await fetchLiveData(newDate);
        if (result && result.rows) {
            setRows(result.rows);
            setLiveDefaults(result.rows.map((r) => ({ ...r })));
            setDataSource('live');

            // Step 2: Auto-generate the 24-hour load prediction immediately
            await runPrediction(result.rows, result.calendar);
        }
    };

    const forecastPoints = useMemo(
        () => (forecast ? forecast.map((f) => ({ label: `Hour ${pad(f.hour)}:00`, value: f.mw })) : []),
        [forecast]
    );
    const forecastTicks = useMemo(
        () => (forecast ? forecast.map((f, i) => ({ index: i, label: `${pad(f.hour)}:00` })) : []),
        [forecast]
    );
    const forecastStats = useMemo(() => {
        if (!forecast || !forecast.length) return null;
        const vals = forecast.map((f) => f.mw);
        const peak = forecast[vals.indexOf(Math.max(...vals))];
        const low = forecast[vals.indexOf(Math.min(...vals))];
        return {
            peak: { mw: peak.mw, hour: peak.hour },
            low: { mw: low.mw, hour: low.hour },
            avg: vals.reduce((a, b) => a + b, 0) / vals.length,
        };
    }, [forecast]);

    return (
        <div className="so">
            {/* ===== Top-right refresh button ===== */}
            <div className="so-topbar">
                {refreshMsg && <span className={`so-msg ${refreshMsg.type}`}>{refreshMsg.text}</span>}
                <button
                    type="button"
                    className="so-btn refresh"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    aria-label="Refresh telemetry and demand data"
                    title="Refresh data"
                >
                    <RefreshIcon spinning={refreshing} />
                    <span className="so-btn-label">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
                </button>
            </div>

            <section className="so-kpis" aria-label="Latest telemetry">
                <article className="so-kpi primary">
                    <div className="so-kpi-label">
                        Latest Grid Demand <Hint text="Most recent electrical demand recorded on the grid." />
                    </div>
                    <p className="so-kpi-value">
                        {fmtNum(t.demandMw)}
                        <span className="so-kpi-unit">MW</span>
                    </p>
                </article>

                <article className="so-kpi">
                    <div className="so-kpi-label">
                        Observation Timestamp <Hint text="Time of the latest telemetry reading." />
                    </div>
                    <p className="so-kpi-value">{datePart}</p>
                    {timePart && <p className="so-kpi-sub">{timePart} IST</p>}
                </article>

                <article className="so-kpi">
                    <div className="so-kpi-label">
                        Data Provenance <Hint text="Shows whether the reading comes from stored history or a live feed." />
                    </div>
                    <p className="so-kpi-value">{t.provenance}</p>
                </article>

                <article className="so-kpi">
                    <div className="so-kpi-label">Ambient Temperature</div>
                    <p className="so-kpi-value">
                        {fmtNum(t.temperatureC)}
                        <span className="so-kpi-unit">°C</span>
                    </p>
                    {t.humidityPct != null && <span className="so-badge">{t.humidityPct}% Humidity</span>}
                </article>
            </section>

            <section className="so-card so-chart-card">
                <h2 className="so-card-title">Historical Demand Profile (Past 7 Days)</h2>
                <p className="so-card-sub">Historical Grid Electrical Demand (MW)</p>
                <LineChart
                    points={demandPoints}
                    xTicks={demandTicks}
                    yLabel="Electrical Demand (MW)"
                    xLabel="Observation Timestamp (Asia/Kolkata)"
                    gradId="so-grad-demand"
                    label="Line chart of grid electrical demand in megawatts over the past 7 days"
                />
            </section>

            {/* ============ Forecast dropdown ============ */}
            <section className={`so-card so-collapse-card ${open ? 'open' : ''}`}>
                <button
                    type="button"
                    id="so-forecast-trigger"
                    className="so-collapse-trigger"
                    aria-expanded={open}
                    aria-controls="so-forecast-panel"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span className="so-title-icon small">
                        <ClockIcon />
                    </span>
                    <span className="so-trigger-text">
                        <span className="so-trigger-title">Day-Ahead 24-Hour Recursive Load Forecast</span>
                        <span className="so-trigger-sub">Edit the weather inputs and run the XGBoost forecast</span>
                    </span>
                    <ChevronIcon />
                </button>

                <div
                    id="so-forecast-panel"
                    role="region"
                    aria-labelledby="so-forecast-trigger"
                    aria-hidden={!open}
                    className={`so-collapse ${open ? 'open' : ''}`}
                >
                    <div className="so-collapse-inner">
                        <div className="so-forecast">

                            <div className="so-notice">
                                <InfoIcon />
                                <p>
                                    {selectedDate && dataSource === 'live' ? (
                                        <>
                                            <strong>Live Weather Data:</strong> Values below were fetched in real-time from{' '}
                                            <b>OpenWeatherMap</b> and <b>Open-Meteo</b> for <b>{selectedDate}</b>. You can review or edit them before re-generating.
                                        </>
                                    ) : (
                                        <>
                                            <strong>Live Data Sources:</strong> Weather forecast is fetched in real-time from <b>OpenWeatherMap</b>, solar irradiance from <b>Open-Meteo</b>, and calendar/festival data from <b>Tathaastu API</b> for Bengaluru (Asia/Kolkata). Select a date to begin.
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* ---- Themed Date picker with Auto-Fetch ---- */}
                            <div className="so-date-row">
                                <ThemedDatePicker
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    label="Forecast Date"
                                    disabled={fetchingLive || generating}
                                    loading={fetchingLive || generating}
                                />
                            </div>

                            {festivalInfo && (
                                <div className="so-calendar-summary">
                                    <span className={`so-badge-pill ${festivalInfo.isWeekend ? 'weekend' : 'weekday'}`}>
                                        <span className="so-badge-dot" />
                                        {festivalInfo.isWeekend ? 'Weekend' : 'Weekday'}
                                    </span>
                                    {festivalInfo.isFestival && (
                                        <span className="so-badge-pill festival">
                                            Festival: <strong>{festivalInfo.names.join(', ')}</strong>
                                        </span>
                                    )}
                                    {festivalInfo.isHoliday && (
                                        <span className="so-badge-pill holiday">
                                            Public Holiday
                                        </span>
                                    )}
                                    {!festivalInfo.isFestival && !festivalInfo.isHoliday && (
                                        <span className="so-badge-pill standard">
                                            Regular Operating Day
                                        </span>
                                    )}
                                </div>
                            )}

                            {!rows ? (
                                <div className="so-table-placeholder">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                        <circle cx="12" cy="15" r="1.5" />
                                    </svg>
                                    <h4>No Forecast Date Selected</h4>
                                    <p>Select a date above or click a quick chip (Today, Tomorrow) to automatically load live weather data and generate the load prediction.</p>
                                </div>
                            ) : (
                                <div className="so-table-block">
                                    <div className="so-table-head">
                                        <span className="so-table-title">View / Edit 24-Hour Weather Forecast Inputs ({selectedDate})</span>
                                        <span className="so-table-tools">
                                            {editedCount > 0 && <span className="so-table-meta">{editedCount} edited</span>}
                                            <button
                                                type="button"
                                                className="so-link-btn"
                                                onClick={() => {
                                                    if (!liveDefaults) return;
                                                    const resetRows = liveDefaults.map((r) => ({ ...r }));
                                                    setRows(resetRows);
                                                    runPrediction(resetRows, calendarOverrides);
                                                }}
                                                disabled={editedCount === 0}
                                            >
                                                Reset inputs
                                            </button>
                                        </span>
                                    </div>

                                    <div className="so-table-wrap" tabIndex={0}>
                                        <table className="so-table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Hour (0-23)</th>
                                                    {FIELDS.map((f) => (
                                                        <th scope="col" key={f.key}>
                                                            {f.label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((r, i) => (
                                                    <tr key={r.hour}>
                                                        <th scope="row" className="so-hour">
                                                            {r.hour}
                                                        </th>
                                                        {FIELDS.map((f) => (
                                                            <td key={f.key}>
                                                                <input
                                                                    className={`so-cell ${isEdited(i, f.key) ? 'edited' : ''}`}
                                                                    type="number"
                                                                    inputMode="decimal"
                                                                    step={f.step}
                                                                    min={f.min}
                                                                    max={f.max}
                                                                    value={r[f.key]}
                                                                    aria-label={`${f.label} at hour ${r.hour}`}
                                                                    onChange={(e) => setCell(i, f.key, e.target.value)}
                                                                    onBlur={(e) => clampCell(i, f, e.target.value)}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {(generating || message) && (
                                        <div className="so-predict-status">
                                            {generating && (
                                                <div className="so-predict-loading">
                                                    <span className="tdp-spinner" aria-hidden="true" />
                                                    <span className="so-predict-text">
                                                        Predicting 24-hour demand for <strong>{fmtFullDate(selectedDate)}</strong>…
                                                    </span>
                                                </div>
                                            )}
                                            {message && (
                                                <div className={`so-status-alert ${message.type}`}>
                                                    <span className="so-alert-dot" />
                                                    <span>{message.text}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {forecast && forecastStats && (
                                <div className="so-result">
                                    <div className="so-result-header">
                                        <div className="so-result-title-row">
                                            <h3 className="so-result-title">Day-ahead load forecast</h3>
                                            <span className="so-badge-pill weekday">
                                                Forecast Date: <strong>{fmtFullDate(selectedDate)}</strong>
                                            </span>
                                        </div>
                                        <p className="so-card-sub">
                                            Predicted electrical demand (MW) across 24 hours for <strong>{fmtFullDate(selectedDate)}</strong> (00:00 – 23:00 IST)
                                        </p>
                                    </div>

                                    <div className="so-stats">
                                        <div>
                                            <span>Peak</span>
                                            <strong>{fmtNum(forecastStats.peak.mw)} MW</strong>
                                            <em>at {pad(forecastStats.peak.hour)}:00</em>
                                        </div>
                                        <div>
                                            <span>Lowest</span>
                                            <strong>{fmtNum(forecastStats.low.mw)} MW</strong>
                                            <em>at {pad(forecastStats.low.hour)}:00</em>
                                        </div>
                                        <div>
                                            <span>Average</span>
                                            <strong>{fmtNum(forecastStats.avg)} MW</strong>
                                            <em>over 24 hours</em>
                                        </div>
                                    </div>

                                    <LineChart
                                        compact
                                        points={forecastPoints}
                                        xTicks={forecastTicks}
                                        yLabel="Predicted Demand (MW)"
                                        xLabel={`Hour of day (${fmtFullDate(selectedDate)})`}
                                        gradId="so-grad-forecast"
                                        label={`Line chart of the 24-hour day-ahead load forecast for ${fmtFullDate(selectedDate)} in megawatts`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Syste_OverView;