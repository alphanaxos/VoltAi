import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Pypsa.css';

/* 
   Defaults (demo) — reproduce the screenshots.
   Replace via onSolve() prop.
    */

const FLEET = [
    { key: 'coal', label: 'Coal (1,500 MW, 40% min stable, ₹3.5/unit)', color: 'var(--c2)' },
    { key: 'gas', label: 'Gas Peaker (800 MW, ₹6.0/unit)', color: '#E8A33D' },
    { key: 'solar', label: 'Solar (400 MW nameplate, ₹0.0/unit)', color: '#F4C542' },
];

const FLEET_CAPS = { coal: 1500, gas: 800, solar: 400 };

/* ---------- demo hourly schedule (matches your screenshot) ---------- */
const DEMAND = [
    1650, 1580, 1520, 1490, 1510, 1600, 1780, 1950, 2100, 2180, 2260, 2290,
    2270, 2240, 2180, 2110, 2050, 2140, 2290, 2230, 2140, 1980, 1790, 1720,
];
const SOLAR_PROFILE = [0, 0, 0, 0, 0, 0, 45.64, 124.92, 200, 269.61, 332.55, 387.75, 400, 400, 400, 390, 340, 260, 155, 75, 20, 0, 0, 0];

function buildDemoHours() {
    const start = new Date('2025-01-01T00:00:00');
    return DEMAND.map((demand_mw, hour) => {
        const solar_mw = SOLAR_PROFILE[hour];
        // coal base at 1500 unless load is very low
        const coal_mw = demand_mw < 1500 ? Math.max(600, demand_mw - solar_mw * 0.6) : 1500;
        const remaining = Math.max(0, demand_mw - coal_mw - solar_mw);
        const gas_mw = Math.min(FLEET_CAPS.gas, remaining);
        const unserved_mw = Math.max(0, demand_mw - coal_mw - solar_mw - gas_mw);
        const hourly_cost = coal_mw * 3.5 + gas_mw * 6.0;
        const ts = new Date(start.getTime() + hour * 3600 * 1000);
        return {
            hour,
            timestamp: ts.toISOString().replace('.000Z', ''),
            demand_mw,
            coal_mw: Math.round(coal_mw * 100) / 100,
            gas_mw: Math.round(gas_mw * 100) / 100,
            solar_mw: Math.round(solar_mw * 100) / 100,
            unserved_mw: Math.round(unserved_mw * 100) / 100,
            hourly_cost: Math.round(hourly_cost * 100) / 100,
        };
    });
}

function buildDemoSummary(hours) {
    const totalCost = hours.reduce((s, h) => s + h.hourly_cost, 0);
    const totalEnergy = hours.reduce((s, h) => s + h.demand_mw, 0);
    const peakDemand = Math.max(...hours.map((h) => h.demand_mw));
    const unserved = hours.reduce((s, h) => s + h.unserved_mw, 0);
    const totalCoal = hours.reduce((s, h) => s + h.coal_mw, 0);
    const totalGas = hours.reduce((s, h) => s + h.gas_mw, 0);
    const totalSolar = hours.reduce((s, h) => s + h.solar_mw, 0);
    const totalDisp = totalCoal + totalGas + totalSolar;
    return {
        totalCost,
        totalEnergy,
        peakDemand,
        unserved,
        mix: {
            coal: totalDisp ? (totalCoal / totalDisp) * 100 : 0,
            gas: totalDisp ? (totalGas / totalDisp) * 100 : 0,
            solar: totalDisp ? (totalSolar / totalDisp) * 100 : 0,
        },
    };
}

/* ---------- helpers ---------- */
const fmtNum = (n, d = 1) =>
    Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = (n) => Number(n).toLocaleString('en-IN');
const fmtINR = (n) => `₹${fmtInt(Math.round(n))}`;
const pad = (n) => String(n).padStart(2, '0');

/* ---------- icons ---------- */
function Svg({ children, size = 16, ...rest }) {
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
const ChevronIcon = () => <Svg size={16} className="py-chevron"><path d="m6 9 6 6 6-6" /></Svg>;
const BoltIcon = () => <Svg size={15}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></Svg>;
const InfoIcon = () => <Svg size={14}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>;
const CheckIcon = () => <Svg size={16}><path d="M20 6 9 17l-5-5" /></Svg>;
const MinusIcon = () => <Svg size={14}><path d="M5 12h14" /></Svg>;
const PlusIcon = () => <Svg size={14}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>;
const GearIcon = () => (
    <Svg size={20}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
);

/* 
   Stacked dispatch bar chart — 24 hours
    */
function DispatchBarChart({ hours }) {
    const wrapRef = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const [hover, setHover] = useState(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return undefined;
        const update = () => setSize((p) => (p.w === el.clientWidth && p.h === el.clientHeight ? p : { w: el.clientWidth, h: el.clientHeight }));
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const isMobile = size.w < 520;

    const geo = useMemo(() => {
        const { w, h } = size;
        if (!w || !h || !hours.length) return null;
        const leftMargin = w < 520 ? 64 : 68;
        const m = { top: 24, right: 16, bottom: 40, left: leftMargin };
        const iw = w - m.left - m.right;
        const ih = h - m.top - m.bottom;

        const maxY = Math.max(...hours.map((x) => x.demand_mw));
        const top = Math.ceil((maxY * 1.08) / 200) * 200;
        const range = top || 1;
        const n = hours.length;
        const slot = iw / n;
        const barW = Math.min(34, slot * 0.7);

        const x = (i) => m.left + slot * i + slot / 2;
        const y = (v) => m.top + ih - (v / range) * ih;
        const base = m.top + ih;
        const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((range / 4) * i));

        // baseline demand polyline points
        const demandPts = hours.map((hh, i) => `${x(i).toFixed(1)},${y(hh.demand_mw).toFixed(1)}`).join(' ');

        return { m, iw, ih, x, y, base, barW, yTicks, demandPts, n, slot };
    }, [size, hours]);

    const onMove = (e) => {
        if (!geo || !hours.length) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const idx = Math.floor(relX / geo.slot);
        setHover(Math.max(0, Math.min(hours.length - 1, idx)));
    };

    const hp = hover !== null && hours[hover] ? hours[hover] : null;

    return (
        <div className="py-chart" ref={wrapRef}>
            {geo && (
                <>
                    <svg width={size.w} height={size.h} role="img" aria-label="24-hour economic generation dispatch schedule">
                        {geo.yTicks.map((tv) => (
                            <g key={tv}>
                                <line className="py-grid" x1={geo.m.left} x2={size.w - geo.m.right} y1={geo.y(tv)} y2={geo.y(tv)} />
                                <text className="py-axis-text" x={geo.m.left - 8} y={geo.y(tv) + 3} textAnchor="end">{tv}</text>
                            </g>
                        ))}

                        {/* Hover column background highlight */}
                        {hover !== null && (
                            <rect
                                className="py-hover-band"
                                x={geo.x(hover) - geo.slot / 2}
                                y={geo.m.top}
                                width={geo.slot}
                                height={geo.ih}
                            />
                        )}

                        {hours.map((h, i) => {
                            const cx = geo.x(i);
                            const bx = cx - geo.barW / 2;
                            // stack bottom-up: coal -> gas -> solar
                            const coal = h.coal_mw;
                            const gas = h.gas_mw;
                            const solar = h.solar_mw;

                            const cY = geo.y(coal);
                            const gY = geo.y(coal + gas);
                            const sY = geo.y(coal + gas + solar);

                            const isHov = hover === i;

                            return (
                                <g key={h.hour} className={`py-bar-group ${isHov ? 'is-hover' : ''}`}>
                                    <rect className="py-bar coal" x={bx} y={cY} width={geo.barW} height={geo.base - cY} rx="1" />
                                    {gas > 0 && (
                                        <rect className="py-bar gas" x={bx} y={gY} width={geo.barW} height={cY - gY} />
                                    )}
                                    {solar > 0 && (
                                        <rect className="py-bar solar" x={bx} y={sY} width={geo.barW} height={gY - sY} />
                                    )}
                                </g>
                            );
                        })}

                        {/* Grid demand overlay */}
                        <polyline className="py-demand-line" points={geo.demandPts} />

                        {/* Demand point dot on hover */}
                        {hp && (
                            <circle
                                className="py-demand-dot"
                                cx={geo.x(hover)}
                                cy={geo.y(hp.demand_mw)}
                                r="4.5"
                            />
                        )}

                        {hours.map((h, i) => (
                            (i % 2 === 0) && (
                                <text key={`x-${h.hour}`} className={`py-axis-text ${hover === i ? 'active' : ''}`} x={geo.x(i)} y={geo.base + 16} textAnchor="middle">
                                    {h.hour}
                                </text>
                            )
                        ))}

                        <text className="py-axis-title" transform={`translate(${isMobile ? 12 : 14} ${geo.m.top + geo.ih / 2}) rotate(-90)`} textAnchor="middle">
                            Power (MW)
                        </text>
                        <text className="py-axis-title" x={geo.m.left + geo.iw / 2} y={size.h - 4} textAnchor="middle">
                            Hour (0 to 23)
                        </text>

                        {/* Transparent capture rect for mouse/touch tracking */}
                        <rect
                            x={geo.m.left}
                            y={geo.m.top}
                            width={geo.iw}
                            height={geo.ih}
                            fill="transparent"
                            style={{ touchAction: 'pan-y', cursor: 'crosshair' }}
                            onPointerMove={onMove}
                            onPointerDown={onMove}
                            onPointerLeave={() => setHover(null)}
                        />
                    </svg>

                    {hp && (
                        <div
                            className={`py-tip ${geo.x(hover) > size.w * 0.62 ? 'flip' : ''}`}
                            style={{ left: `${geo.x(hover)}px` }}
                        >
                            <div className="py-tip-head">
                                <strong>Hour {hp.hour}:00</strong>
                                <span className="py-tip-demand">Demand: {fmtNum(hp.demand_mw, 1)} MW</span>
                            </div>
                            <div className="py-tip-body">
                                <div className="py-tip-row">
                                    <span className="py-tip-dot coal"></span>
                                    <span className="py-tip-name">Coal:</span>
                                    <span className="py-tip-val">{fmtNum(hp.coal_mw, 1)} MW</span>
                                </div>
                                <div className="py-tip-row">
                                    <span className="py-tip-dot gas"></span>
                                    <span className="py-tip-name">Gas:</span>
                                    <span className="py-tip-val">{fmtNum(hp.gas_mw, 1)} MW</span>
                                </div>
                                <div className="py-tip-row">
                                    <span className="py-tip-dot solar"></span>
                                    <span className="py-tip-name">Solar:</span>
                                    <span className="py-tip-val">{fmtNum(hp.solar_mw, 1)} MW</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* 
   Donut chart — 24-hour energy generation mix
    */
function EnergyMixDonut({ mix }) {
    const R = 78;
    const r = 48;
    const cx = 110;
    const cy = 110;

    const segments = [
        { key: 'coal', label: 'Coal Fleet', value: mix.coal, color: '#7B8CA3' },
        { key: 'solar', label: 'Solar Farm', value: mix.solar, color: '#F4C542' },
        { key: 'gas', label: 'Gas Peaker', value: mix.gas, color: '#E8A33D' },
    ];

    // Build SVG path arcs
    let angle = -Math.PI / 2; // start at top
    const arcs = segments.map((s) => {
        const frac = (s.value || 0) / 100;
        const a0 = angle;
        const a1 = angle + frac * Math.PI * 2;
        angle = a1;
        const large = a1 - a0 > Math.PI ? 1 : 0;

        const x0o = cx + R * Math.cos(a0), y0o = cy + R * Math.sin(a0);
        const x1o = cx + R * Math.cos(a1), y1o = cy + R * Math.sin(a1);
        const x0i = cx + r * Math.cos(a0), y0i = cy + r * Math.sin(a0);
        const x1i = cx + r * Math.cos(a1), y1i = cy + r * Math.sin(a1);
        const d = `M${x0o} ${y0o} A${R} ${R} 0 ${large} 1 ${x1o} ${y1o} L${x1i} ${y1i} A${r} ${r} 0 ${large} 0 ${x0i} ${y0i} Z`;

        // label anchor at mid-angle, offset outward
        const am = (a0 + a1) / 2;
        const lx = cx + ((R + r) / 2) * Math.cos(am);
        const ly = cy + ((R + r) / 2) * Math.sin(am);

        return { ...s, d, lx, ly, pct: s.value };
    });

    return (
        <div className="py-donut">
            <svg viewBox="0 0 220 220" role="img" aria-label="24-hour energy generation mix donut chart">
                {arcs.map((a) => (
                    <path key={a.key} d={a.d} fill={a.color} stroke="var(--card)" strokeWidth="1" />
                ))}
                {arcs.map((a) => (
                    a.pct > 5 && (
                        <text key={`l-${a.key}`} className="py-donut-label" x={a.lx} y={a.ly + 3} textAnchor="middle">
                            {a.label}
                        </text>
                    )
                ))}
                {arcs.map((a) => (
                    a.pct > 5 && (
                        <text key={`p-${a.key}`} className="py-donut-pct" x={a.lx} y={a.ly + 15} textAnchor="middle">
                            {a.pct.toFixed(1)}%
                        </text>
                    )
                ))}
            </svg>
        </div>
    );
}

/* 
   Legend row for the dispatch bar chart
    */
function BarLegend() {
    const items = [
        { label: 'Grid Demand (MW)', type: 'line' },
        { label: 'Gas (₹6.0)', type: 'swatch', color: '#E8A33D' },
        { label: 'Coal (₹3.5)', type: 'swatch', color: '#7B8CA3' },
        { label: 'Solar (₹0.0)', type: 'swatch', color: '#F4C542' },
    ];
    return (
        <ul className="py-legend">
            {items.map((it) => (
                <li key={it.label}>
                    {it.type === 'line'
                        ? <span className="py-legend-line" />
                        : <span className="py-legend-swatch" style={{ background: it.color }} />}
                    <span>{it.label}</span>
                </li>
            ))}
        </ul>
    );
}

function DonutLegend({ mix }) {
    const items = [
        { label: 'Coal Fleet', value: mix.coal, color: '#7B8CA3' },
        { label: 'Solar Farm', value: mix.solar, color: '#F4C542' },
        { label: 'Gas Peaker', value: mix.gas, color: '#E8A33D' },
    ];
    return (
        <ul className="py-donut-legend">
            {items.map((it) => (
                <li key={it.label}>
                    <span className="py-legend-swatch" style={{ background: it.color }} />
                    <span className="py-donut-legend-label">{it.label}</span>
                    <span className="py-donut-legend-pct">{it.value.toFixed(1)}%</span>
                </li>
            ))}
        </ul>
    );
}

/* 
   Main component
    */
function Pypsa({ onSolve }) {
    /* --- optimization config --- */
    const [useExplicit, setUseExplicit] = useState(true);
    const [includeLoadShedding, setIncludeLoadShedding] = useState(true);
    const [loadSheddingPenalty, setLoadSheddingPenalty] = useState(100);
    const [panelOpen, setPanelOpen] = useState(true);

    /* --- result state --- */
    const [hours, setHours] = useState(null);
    const [summary, setSummary] = useState(null);
    const [status, setStatus] = useState(null); // 'optimal' | 'infeasible' | null
    const [solving, setSolving] = useState(false);
    const [error, setError] = useState(null);

    /* --- run solver --- */
    const handleSolve = async () => {
        setError(null);
        setSolving(true);
        try {
            let result;
            if (onSolve) {
                result = await onSolve({
                    demandSource: useExplicit ? 'explicit_profile' : 'phase4_recursive',
                    includeLoadShedding,
                    loadSheddingPenalty: Number(loadSheddingPenalty),
                });
            } else {
                // demo fallback
                await new Promise((r) => setTimeout(r, 400));
                const h = buildDemoHours();
                result = { status: 'optimal', hours: h, summary: buildDemoSummary(h) };
            }
            setHours(result.hours);
            setSummary(result.summary);
            setStatus(result.status || 'optimal');
        } catch (err) {
            setError((err && err.message) || 'Solver failed. Please try again.');
            setStatus(null);
        } finally {
            setSolving(false);
        }
    };

    /* --- penalty stepper helpers --- */
    const bumpPenalty = (dir) => setLoadSheddingPenalty((v) => Math.max(0, Number(v) + dir * 10));

    return (
        <div className="py">
            {/* ============ DEMAND INPUT SOURCE ============ */}
            <section className="py-card py-source-card">
                <span className="py-field-label">Demand Input Source</span>
                <div className="py-radio-row" role="radiogroup" aria-label="Demand input source">
                    <label className={`py-radio ${useExplicit ? 'on' : ''}`}>
                        <input
                            type="radio"
                            name="demand-source"
                            checked={useExplicit}
                            onChange={() => setUseExplicit(true)}
                        />
                        <span className="py-radio-dot" />
                        <span>Use Explicit 24-Hour Profile</span>
                    </label>
                    <label className={`py-radio ${!useExplicit ? 'on' : ''}`}>
                        <input
                            type="radio"
                            name="demand-source"
                            checked={!useExplicit}
                            onChange={() => setUseExplicit(false)}
                        />
                        <span className="py-radio-dot" />
                        <span>Consume Phase 4 24h Recursive Forecast</span>
                    </label>
                </div>
            </section>

            {/* ============ OPTIMIZATION PARAMETERS (collapsible) ============ */}
            <section className={`py-card py-opt-card ${panelOpen ? 'open' : ''}`}>
                <button
                    type="button"
                    className="py-opt-trigger"
                    aria-expanded={panelOpen}
                    onClick={() => setPanelOpen((o) => !o)}
                >
                    <ChevronIcon />
                    <span>Optimization Parameters</span>
                </button>

                <div className={`py-collapse ${panelOpen ? 'open' : ''}`}>
                    <div className="py-collapse-inner">
                        <div className="py-opt-body">
                            <label className="py-check">
                                <input
                                    type="checkbox"
                                    checked={includeLoadShedding}
                                    onChange={(e) => setIncludeLoadShedding(e.target.checked)}
                                />
                                <span className="py-check-box" />
                                <span className="py-check-text">
                                    Include Unserved Energy Generator (Load Shedding)
                                </span>
                                <span className="py-hint" title="If enabled, unmet demand is served by a virtual generator at the specified penalty cost.">
                                    <InfoIcon />
                                </span>
                            </label>

                            <div className="py-field">
                                <label className="py-field-label" htmlFor="py-penalty">Load Shedding Penalty (₹/MWh)</label>
                                <div className="py-stepper">
                                    <button type="button" className="py-step-btn" onClick={() => bumpPenalty(-1)} aria-label="Decrease penalty"><MinusIcon /></button>
                                    <input
                                        id="py-penalty"
                                        className="py-step-input"
                                        type="number"
                                        step="10"
                                        min="0"
                                        value={loadSheddingPenalty}
                                        onChange={(e) => setLoadSheddingPenalty(e.target.value)}
                                        onBlur={(e) => setLoadSheddingPenalty(Math.max(0, Number(e.target.value) || 0))}
                                    />
                                    <button type="button" className="py-step-btn" onClick={() => bumpPenalty(1)} aria-label="Increase penalty"><PlusIcon /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ SOLVE BUTTON ============ */}
            <div className="py-actions">
                <button type="button" className="py-btn primary" onClick={handleSolve} disabled={solving}>
                    <BoltIcon />
                    {solving ? 'Solving…' : 'Solve Dispatch Optimization'}
                </button>
                {error && <span className="py-msg error">{error}</span>}
            </div>


            {/* ============ KPI ROW ============ */}
            {summary && (
                <section className="py-kpis" aria-label="Optimization summary">
                    <div className="py-kpi primary">
                        <div className="py-kpi-label">
                            Total 24h Cost
                            <span className="py-hint"><InfoIcon /></span>
                        </div>
                        <div className="py-kpi-value">{fmtINR(summary.totalCost)}</div>
                    </div>
                    <div className="py-kpi">
                        <div className="py-kpi-label">
                            Total Energy Dispatched
                            <span className="py-hint"><InfoIcon /></span>
                        </div>
                        <div className="py-kpi-value">{fmtNum(summary.totalEnergy, 1)} <span className="py-kpi-unit">MWh</span></div>
                    </div>
                    <div className="py-kpi">
                        <div className="py-kpi-label">
                            Peak Demand
                            <span className="py-hint"><InfoIcon /></span>
                        </div>
                        <div className="py-kpi-value">{fmtNum(summary.peakDemand, 1)} <span className="py-kpi-unit">MW</span></div>
                    </div>
                    <div className="py-kpi">
                        <div className="py-kpi-label">Unserved Energy</div>
                        <div className="py-kpi-value">{fmtNum(summary.unserved, 1)} <span className="py-kpi-unit">MWh</span></div>
                        <span className="py-badge">↑ {summary.mix.solar.toFixed(1)}% Solar</span>
                    </div>
                </section>
            )}

            {/* ============ CHARTS ROW ============ */}
            {hours && summary && (
                <section className="py-charts-row">
                    <div className="py-card py-chart-card">
                        <div className="py-chart-head">
                            <h2 className="py-card-title">24-Hour Economic Generation Dispatch Schedule</h2>
                            <BarLegend />
                        </div>
                        <DispatchBarChart hours={hours} />
                    </div>

                    <div className="py-card py-donut-card">
                        <h2 className="py-card-title">24-Hour Energy Generation Mix (MWh)</h2>
                        <EnergyMixDonut mix={summary.mix} />
                        <DonutLegend mix={summary.mix} />
                    </div>
                </section>
            )}

            {/* ============ DETAILED TABLE ============ */}
            {hours && (
                <section className="py-card py-table-card">
                    <h2 className="py-card-title">Detailed 24-Hour Dispatch Schedule Table</h2>
                    <div className="py-table-wrap">
                        <table className="py-table">
                            <thead>
                                <tr>
                                    <th>hour</th>
                                    <th>timestamp</th>
                                    <th>demand_mw</th>
                                    <th>coal_mw</th>
                                    <th>gas_mw</th>
                                    <th>solar_mw</th>
                                    <th>unserved_mw</th>
                                    <th>hourly_cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hours.map((h) => (
                                    <tr key={h.hour}>
                                        <td>{h.hour}</td>
                                        <td className="mono">{h.timestamp}</td>
                                        <td className="num">{fmtNum(h.demand_mw, 1)}</td>
                                        <td className="num">{fmtNum(h.coal_mw, 1)}</td>
                                        <td className="num">{fmtNum(h.gas_mw, 1)}</td>
                                        <td className="num">{fmtNum(h.solar_mw, 1)}</td>
                                        <td className="num">{fmtNum(h.unserved_mw, 1)}</td>
                                        <td className="num">{fmtNum(h.hourly_cost, 2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

export default Pypsa;