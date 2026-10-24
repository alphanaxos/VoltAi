import React, { useState, useRef, useEffect, useMemo } from 'react';
import './ThemedDatePicker.css';

/**
 * Format a YYYY-MM-DD string into a clean readable date
 * e.g., "Sat, 24 Oct 2026"
 */
function formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function toYMD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ThemedDatePicker({
    value,
    onChange,
    id = 'so-themed-date-picker',
    label = 'Forecast Date',
    disabled = false,
    loading = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Initial view month/year based on value or today
    const initialDate = useMemo(() => {
        if (value) {
            const [y, m, d] = value.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        return new Date();
    }, [value]);

    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    // Sync view year/month when value changes externally
    useEffect(() => {
        if (value) {
            const [y, m] = value.split('-').map(Number);
            setViewYear(y);
            setViewMonth(m - 1);
        }
    }, [value]);

    // Close on click outside or Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Quick preset helpers
    const today = useMemo(() => new Date(), []);
    const todayStr = useMemo(() => toYMD(today), [today]);

    const tomorrowStr = useMemo(() => {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return toYMD(d);
    }, [today]);

    const dayAfterTomorrowStr = useMemo(() => {
        const d = new Date(today);
        d.setDate(d.getDate() + 2);
        return toYMD(d);
    }, [today]);

    const day3Str = useMemo(() => {
        const d = new Date(today);
        d.setDate(d.getDate() + 3);
        return toYMD(d);
    }, [today]);

    // Navigate months
    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const jumpToToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        onChange(todayStr);
        setIsOpen(false);
    };

    // Build the calendar matrix
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const cells = [];

        // Previous month days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const prevMonthDate = new Date(viewYear, viewMonth - 1, d);
            cells.push({
                dateStr: toYMD(prevMonthDate),
                dayNum: d,
                isCurrentMonth: false,
                isPrev: true,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(viewYear, viewMonth, d);
            cells.push({
                dateStr: toYMD(dateObj),
                dayNum: d,
                isCurrentMonth: true,
            });
        }

        // Next month trailing days to complete 6 full rows (42 cells) or 5 rows (35 cells)
        const targetTotal = cells.length > 35 ? 42 : 35;
        let nextDay = 1;
        while (cells.length < targetTotal) {
            const nextMonthDate = new Date(viewYear, viewMonth + 1, nextDay);
            cells.push({
                dateStr: toYMD(nextMonthDate),
                dayNum: nextDay,
                isCurrentMonth: false,
                isNext: true,
            });
            nextDay++;
        }

        return cells;
    }, [viewYear, viewMonth]);

    const handleSelectDate = (dateStr) => {
        onChange(dateStr);
        setIsOpen(false);
    };

    return (
        <div className="tdp-wrapper" ref={containerRef}>
            {label && (
                <label className="tdp-label" htmlFor={id}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {label}
                </label>
            )}

            <div className="tdp-input-container">
                <button
                    type="button"
                    id={id}
                    className={`tdp-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''} ${loading ? 'loading' : ''}`}
                    onClick={() => !disabled && !loading && setIsOpen((prev) => !prev)}
                    disabled={disabled || loading}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                    aria-label={value ? `Selected date: ${formatDisplayDate(value)}` : 'Select forecast date'}
                >
                    <span className="tdp-trigger-icon">
                        {loading ? (
                            <span className="tdp-spinner" aria-hidden="true" />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        )}
                    </span>

                    <span className="tdp-trigger-text">
                        {loading
                            ? 'Fetching live weather data…'
                            : value
                            ? formatDisplayDate(value)
                            : 'Select forecast date…'}
                    </span>

                    <span className="tdp-trigger-arrow">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </span>
                </button>

                {/* Quick select chips for fastest UX */}
                <div className="tdp-chips">
                    <button
                        type="button"
                        className={`tdp-chip ${value === todayStr ? 'active' : ''}`}
                        onClick={() => !loading && onChange(todayStr)}
                        disabled={loading}
                        title="Today"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        className={`tdp-chip ${value === tomorrowStr ? 'active' : ''}`}
                        onClick={() => !loading && onChange(tomorrowStr)}
                        disabled={loading}
                        title="Tomorrow"
                    >
                        Tomorrow
                    </button>
                    <button
                        type="button"
                        className={`tdp-chip ${value === dayAfterTomorrowStr ? 'active' : ''}`}
                        onClick={() => !loading && onChange(dayAfterTomorrowStr)}
                        disabled={loading}
                        title="Day after tomorrow"
                    >
                        +2 Days
                    </button>
                    <button
                        type="button"
                        className={`tdp-chip ${value === day3Str ? 'active' : ''}`}
                        onClick={() => !loading && onChange(day3Str)}
                        disabled={loading}
                        title="3 days ahead"
                    >
                        +3 Days
                    </button>
                </div>
            </div>

            {/* Calendar Popover */}
            {isOpen && (
                <div className="tdp-popover" role="dialog" aria-modal="true" aria-label="Choose forecast date">
                    {/* Popover Header */}
                    <div className="tdp-header">
                        <div className="tdp-header-title">
                            <span className="tdp-month">{MONTH_NAMES[viewMonth]}</span>
                            <span className="tdp-year">{viewYear}</span>
                        </div>
                        <div className="tdp-nav-btns">
                            <button
                                type="button"
                                className="tdp-nav-btn"
                                onClick={prevMonth}
                                aria-label="Previous month"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="tdp-nav-btn"
                                onClick={nextMonth}
                                aria-label="Next month"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Weekday labels */}
                    <div className="tdp-weekdays">
                        {WEEKDAYS.map((w, idx) => (
                            <span key={w} className={`tdp-weekday ${idx === 0 || idx === 6 ? 'weekend' : ''}`}>
                                {w}
                            </span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="tdp-grid">
                        {calendarDays.map((cell) => {
                            const isSelected = value === cell.dateStr;
                            const isToday = cell.dateStr === todayStr;

                            // Calculate if date is within 5-day OWM forecast window
                            const [cy, cm, cd] = cell.dateStr.split('-').map(Number);
                            const cellDate = new Date(cy, cm - 1, cd);
                            const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            const diffDays = Math.round((cellDate - todayMidnight) / 86400000);
                            const isLiveForecastable = diffDays >= 0 && diffDays <= 4;

                            return (
                                <button
                                    key={cell.dateStr}
                                    type="button"
                                    className={[
                                        'tdp-day',
                                        !cell.isCurrentMonth ? 'other-month' : '',
                                        isSelected ? 'selected' : '',
                                        isToday ? 'today' : '',
                                        isLiveForecastable ? 'live-ready' : '',
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => handleSelectDate(cell.dateStr)}
                                    title={`${cell.dateStr}${isLiveForecastable ? ' (Live 5-day forecast available)' : ''}`}
                                >
                                    <span className="tdp-day-number">{cell.dayNum}</span>
                                    {isLiveForecastable && !isSelected && (
                                        <span className="tdp-live-dot" title="Live weather forecast ready" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer with Info and Actions */}
                    <div className="tdp-footer">
                        <div className="tdp-legend">
                            <span className="tdp-legend-dot" />
                            <span className="tdp-legend-text">Live 5-day weather window</span>
                        </div>
                        <div className="tdp-footer-actions">
                            <button type="button" className="tdp-btn-ghost" onClick={jumpToToday}>
                                Today
                            </button>
                            <button type="button" className="tdp-btn-primary" onClick={() => setIsOpen(false)}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
