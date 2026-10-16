import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Monte_carlo.css';

/* 
   Defaults + demo fallback (matches your screenshots)
    */

const DEFAULT_KPIS = {
    lolp: 0.0,               // %
    eens: 0.0,               // MWh
    reserveSufficiency: 100.0, // %
    expectedCostMean: 152954.12,
    bestCaseMin: 145243.77,
    medianP50: 153204.04,
    p95Worst: 158329.14,
    peakDemandP95: 2365.3,   // MW
};

/* Rows in the same order as the screenshot (top → bottom) */
const DEFAULT_QUANTILES = [
    { key: 'unserved_energy',  label: 'Unserved energy (MWh)', p05: 0,      p50: 0,      p95: 0,      unit: '' },
    { key: 'solar_usage',      label: 'Solar usage (MWh)',     p05: 0,      p50: 0,      p95: 0,      unit: '' },
    { key: 'gas_usage',        label: 'Gas usage (MWh)',       p05: 0,      p50: 0,      p95: 0,      unit: '' },
    { key: 'coal_usage',       label: 'Coal usage (MWh)',      p05: 33000,  p50: 34000,  p95: 35000,  unit: '' },
    { key: 'dispatch_cost',    label: 'Dispatch cost (₹)',     p05: 145244, p50: 153204, p95: 158329, unit: '₹' },
    { key: 'demand_peak',      label: 'Demand peak (MW)',      p05: 0,      p50: 0,      p95: 0,      unit: '' },
];

const DISPATCH_ENGINES = [
    { value: 'merit_order',   label: 'merit_order' },
    { value: 'pypsa',    label: 'pypsa' },
];

/* ---------- helpers ---------- */
const fmtInt   = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtNum   = (n, d = 2) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtINR   = (n) => `₹${fmtNum(n, 2)}`;
const fmtPct   = (n, d = 2) => `${fmtNum(n, d)}%`;

/* Compact number for axis ticks (20k, 40k, 60k, …) */
const fmtAxis = (v) => {
    if (v === 0) return '0';
    const abs = Math.abs(v);
    if (abs >= 1e6) return `${(v / 1e6).toFixed(abs % 1e6 === 0 ? 0 : 1)}M`;
    if (abs >= 1e3) return `${(v / 1e3).toFixed(abs % 1e3 === 0 ? 0 : 1)}k`;
    return String(v);
};

/* ---------- icons ---------- */
function Svg({ children, size = 16, ...rest }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
            {children}
        </svg>
    );
}
const ChevronIcon = () => <Svg size={16} className="mc-chevron"><path d="m6 9 6 6 6-6" /></Svg>;
const InfoIcon    = () => <Svg size={14}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>;
const CheckIcon   = () => <Svg size={14}><path d="M20 6 9 17l-5-5" /></Svg>;
const MinusIcon   = () => <Svg size={14}><path d="M5 12h14" /></Svg>;
const PlusIcon    = () => <Svg size={14}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>;
const DiceIcon    = () => (
    <Svg size={20}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8" cy="8" r="1.2" fill="currentColor" />
        <circle cx="16" cy="8" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        <circle cx="8" cy="16" r="1.2" fill="currentColor" />
        <circle cx="16" cy="16" r="1.2" fill="currentColor" />
    </Svg>
);
const TableIcon   = () => <Svg size={14}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M9 4v16" /></Svg>;

/* 
   Quantile Legend Component
*/
function QuantileLegend() {
    return (
        <div className="mc-legend">
            <div className="mc-legend-item">
                <span className="mc-legend-dot p05"></span>
                <span className="mc-legend-text">P05 (Left)</span>
            </div>
            <div className="mc-legend-item">
                <span className="mc-legend-dot median"></span>
                <span className="mc-legend-text">Median (Centre)</span>
            </div>
            <div className="mc-legend-item">
                <span className="mc-legend-dot p95"></span>
                <span className="mc-legend-text">P95 (Right)</span>
            </div>
            <div className="mc-legend-item">
                <span className="mc-legend-line"></span>
                <span className="mc-legend-text">90% Range Span</span>
            </div>
        </div>
    );
}

/* 
   Quantile range chart (P05 — Median — P95)
   Pure SVG, horizontal lanes, log-friendly axis.
*/
function QuantileRangeChart({ rows }) {
    const wrapRef = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const [hoverRow, setHoverRow] = useState(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return undefined;
        const update = () => {
            const w = Math.max(el.clientWidth, 580);
            const h = el.clientHeight || 340;
            setSize((p) => (p.w === w && p.h === h ? p : { w, h }));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const geo = useMemo(() => {
        const { w, h } = size;
        if (!w || !h || !rows.length) return null;

        const m = { top: 18, right: 26, bottom: 40, left: 160 };
        const iw = w - m.left - m.right;
        const ih = h - m.top - m.bottom;

        const maxVal = Math.max(
            1,
            ...rows.flatMap((r) => [r.p05, r.p50, r.p95])
        );
        // round up to a nice number for the top of the axis
        const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
        const niceMax = Math.ceil(maxVal / magnitude) * magnitude;
        const range = niceMax || 1;

        const n = rows.length;
        const laneH = ih / n;
        const y = (i) => m.top + laneH * i + laneH / 2;
        const x = (v) => m.left + (v / range) * iw;

        // 6 evenly spaced ticks
        const ticks = 6;
        const xticks = Array.from({ length: ticks + 1 }, (_, i) => (range * i) / ticks);

        return { m, iw, ih, laneH, x, y, xticks, n };
    }, [size, rows]);

    const hr = hoverRow !== null && rows[hoverRow] ? rows[hoverRow] : null;

    return (
        <div className="mc-chart-wrap">
            <div className="mc-chart" ref={wrapRef} onPointerLeave={() => setHoverRow(null)}>
                {geo && (
                    <>
                        <svg width={size.w} height={size.h} role="img" aria-label="Empirical scenario quantile ranges">
                            {/* vertical grid lines */}
                            {geo.xticks.map((tv, i) => (
                                <g key={i}>
                                    <line
                                        className="mc-grid"
                                        x1={geo.x(tv)}
                                        x2={geo.x(tv)}
                                        y1={geo.m.top - 4}
                                        y2={geo.m.top + geo.ih + 4}
                                    />
                                    <text className="mc-axis-text" x={geo.x(tv)} y={geo.m.top + geo.ih + 20} textAnchor="middle">
                                        {fmtAxis(tv)}
                                    </text>
                                </g>
                            ))}

                            {/* lane rows */}
                            {rows.map((r, i) => {
                                const cy = geo.y(i);
                                const x0 = geo.x(r.p05);
                                const x1 = geo.x(r.p95);
                                const xm = geo.x(r.p50);
                                const isHov = hoverRow === i;
                                const isSpread = r.p95 > r.p05;

                                return (
                                    <g key={r.key} className={`mc-lane-group ${isHov ? 'active' : ''}`}>
                                        {/* lane hover highlight */}
                                        {isHov && (
                                            <rect
                                                className="mc-lane-hover"
                                                x={geo.m.left - 8}
                                                y={geo.m.top + geo.laneH * i + 1}
                                                width={geo.iw + 16}
                                                height={geo.laneH - 2}
                                                rx="4"
                                            />
                                        )}

                                        {/* lane separator */}
                                        <line
                                            className="mc-lane"
                                            x1={geo.m.left}
                                            x2={size.w - geo.m.right}
                                            y1={geo.m.top + geo.laneH * (i + 1)}
                                            y2={geo.m.top + geo.laneH * (i + 1)}
                                        />

                                        {/* label */}
                                        <text className={`mc-lane-label ${isHov ? 'active' : ''}`} x={geo.m.left - 12} y={cy + 4} textAnchor="end">
                                            {r.label}
                                        </text>

                                        {/* range bar */}
                                        {isSpread && (
                                            <line className="mc-range" x1={x0} x2={x1} y1={cy} y2={cy} />
                                        )}

                                        {/* dots: p05 (left), median (center), p95 (right) */}
                                        {isSpread ? (
                                            <>
                                                <circle className="mc-dot p05" cx={x0} cy={cy} r="4" />
                                                <circle className="mc-dot p95" cx={x1} cy={cy} r="4" />
                                                <circle className="mc-dot median" cx={xm} cy={cy} r="5" />
                                            </>
                                        ) : (
                                            <circle className="mc-dot point" cx={xm} cy={cy} r="4.5" />
                                        )}

                                        {/* hover capture rect for the lane */}
                                        <rect
                                            x={0}
                                            y={geo.m.top + geo.laneH * i}
                                            width={size.w}
                                            height={geo.laneH}
                                            fill="transparent"
                                            style={{ cursor: 'pointer' }}
                                            onPointerEnter={() => setHoverRow(i)}
                                        />
                                    </g>
                                );
                            })}

                            {/* axis title */}
                            <text
                                className="mc-axis-title"
                                x={geo.m.left + geo.iw / 2}
                                y={size.h - 4}
                                textAnchor="middle"
                            >
                                Metric Value
                            </text>
                        </svg>

                        {/* Interactive Tooltip */}
                        {hr && (
                            <div
                                className={`mc-tip ${geo.x(hr.p50) > size.w * 0.62 ? 'flip' : ''}`}
                                style={{
                                    left: `${Math.min(size.w - 180, Math.max(geo.m.left + 20, geo.x(hr.p50)))}px`,
                                    top: `${geo.y(hoverRow)}px`,
                                }}
                            >
                                <div className="mc-tip-head">
                                    <strong>{hr.label}</strong>
                                </div>
                                <div className="mc-tip-body">
                                    <div className="mc-tip-row">
                                        <span className="mc-tip-dot p05"></span>
                                        <span className="mc-tip-name">P05 (Left):</span>
                                        <span className="mc-tip-val">
                                            {hr.unit === '₹' ? fmtINR(hr.p05) : `${fmtNum(hr.p05, 1)} ${hr.unit}`}
                                        </span>
                                    </div>
                                    <div className="mc-tip-row">
                                        <span className="mc-tip-dot median"></span>
                                        <span className="mc-tip-name">Median (Centre):</span>
                                        <span className="mc-tip-val">
                                            {hr.unit === '₹' ? fmtINR(hr.p50) : `${fmtNum(hr.p50, 1)} ${hr.unit}`}
                                        </span>
                                    </div>
                                    <div className="mc-tip-row">
                                        <span className="mc-tip-dot p95"></span>
                                        <span className="mc-tip-name">P95 (Right):</span>
                                        <span className="mc-tip-val">
                                            {hr.unit === '₹' ? fmtINR(hr.p95) : `${fmtNum(hr.p95, 1)} ${hr.unit}`}
                                        </span>
                                    </div>
                                    {hr.p95 > hr.p05 && (
                                        <div className="mc-tip-range">
                                            <span>90% Range Spread:</span>
                                            <strong>
                                                {hr.unit === '₹' ? fmtINR(hr.p95 - hr.p05) : `${fmtNum(hr.p95 - hr.p05, 1)} ${hr.unit}`}
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/* 
   Main component
    */
function Monte_carlo({ onRunSimulation }) {
    /* ----- config state ----- */
    const [nSimulations, setNSimulations] = useState(100);
    const [seed, setSeed] = useState(42);
    const [engine, setEngine] = useState('merit_order');
    const [clipTail, setClipTail] = useState(true);

    /* ----- results state ----- */
    const [kpis, setKpis] = useState(null);
    const [quantiles, setQuantiles] = useState(null);
    const [message, setMessage] = useState(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState(null);
    const [tableOpen, setTableOpen] = useState(false);

    /* ----- run simulation ----- */
    const handleRun = async () => {
        setError(null);
        setMessage(null);
        setRunning(true);
        try {
            let result;
            if (onRunSimulation) {
                result = await onRunSimulation({
                    nSimulations: Number(nSimulations),
                    seed: Number(seed),
                    engine,
                    clipTail,
                });
            } else {
                await new Promise((r) => setTimeout(r, 450));
                const n = Number(nSimulations) || 10;
                result = {
                    message: `Evaluated ${n} Monte Carlo scenarios successfully!`,
                    kpis: DEFAULT_KPIS,
                    quantiles: DEFAULT_QUANTILES,
                };
            }
            setKpis(result.kpis);
            setQuantiles(result.quantiles);
            setMessage(result.message);
        } catch (err) {
            setError((err && err.message) || 'Simulation failed. Please try again.');
        } finally {
            setRunning(false);
        }
    };

    const bumpSeed = (dir) => setSeed((v) => Number(v) + dir);

    /* seed input must accept any integer >= 0 */
    const onSeedChange = (v) => {
        if (v === '') {
            setSeed('');
            return;
        }
        const n = Number(v);
        if (!Number.isNaN(n) && n >= 0) setSeed(Math.floor(n));
    };

    /* nSimulations is bound to the range slider */
    const onSliderChange = (e) => setNSimulations(Number(e.target.value));

    return (
        <div className="mc">
            {/* ============ CONFIG GRID ============ */}
            <section className="mc-config">
                {/* -- left column -- */}
                <div className="mc-col">
                    <div className="mc-field">
                        <div className="mc-field-head">
                            <label className="mc-field-label" htmlFor="mc-sims">Number of Simulations</label>
                            <span className="mc-slider-badge">{nSimulations}</span>
                        </div>
                        <input
                            id="mc-sims"
                            className="mc-slider"
                            type="range"
                            min="10"
                            max="1000"
                            step="10"
                            value={nSimulations}
                            onChange={onSliderChange}
                            style={{ '--pct': `${((nSimulations - 10) / (1000 - 10)) * 100}%` }}
                            aria-valuemin="10"
                            aria-valuemax="1000"
                            aria-valuenow={nSimulations}
                        />
                    </div>

                    <div className="mc-field">
                        <label className="mc-field-label" htmlFor="mc-seed">Reproducibility Seed</label>
                        <div className="mc-stepper">
                            <button type="button" className="mc-step-btn" onClick={() => bumpSeed(-1)} aria-label="Decrease seed">
                                <MinusIcon />
                            </button>
                            <input
                                id="mc-seed"
                                className="mc-step-input"
                                type="number"
                                step="1"
                                min="0"
                                value={seed}
                                onChange={(e) => onSeedChange(e.target.value)}
                                onBlur={(e) => onSeedChange(e.target.value === '' ? 0 : e.target.value)}
                            />
                            <button type="button" className="mc-step-btn" onClick={() => bumpSeed(1)} aria-label="Increase seed">
                                <PlusIcon />
                            </button>
                        </div>
                    </div>
                </div>

                {/* -- right column -- */}
                <div className="mc-col">
                    <div className="mc-field">
                        <div className="mc-field-head">
                            <label className="mc-field-label" htmlFor="mc-engine">Dispatch Engine</label>
                            <span className="mc-hint" title="Solver used to dispatch the simulated 24h scenarios."><InfoIcon /></span>
                        </div>
                        <div className="mc-select-wrap">
                            <select
                                id="mc-engine"
                                className="mc-select"
                                value={engine}
                                onChange={(e) => setEngine(e.target.value)}
                            >
                                {DISPATCH_ENGINES.map((e) => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                    </div>

                    <label className="mc-check">
                        <input
                            type="checkbox"
                            checked={clipTail}
                            onChange={(e) => setClipTail(e.target.checked)}
                        />
                        <span className="mc-check-box" />
                        <span className="mc-check-text">Enable Residual Tail Clipping (P05–P95)</span>
                    </label>
                </div>
            </section>

            {/* ============ RUN BUTTON ============ */}
            <div className="mc-actions">
                <button
                    type="button"
                    className="mc-btn primary"
                    onClick={handleRun}
                    disabled={running}
                >
                    {running ? 'Running…' : 'Run Monte Carlo Risk Simulation'}
                </button>
                {error && <span className="mc-msg error">{error}</span>}
            </div>

            {/* ============ SUCCESS BANNER ============ */}
            {message && (
                <div className="mc-banner">
                    <span className="mc-banner-icon"><CheckIcon /></span>
                    <span>{message}</span>
                </div>
            )}

            {/* ============ KPI GRID ============ */}
            {kpis && (
                <section className="mc-kpis" aria-label="Monte Carlo risk metrics">
                    <div className="mc-kpi primary">
                        <div className="mc-kpi-label">
                            Loss of Load Probability (LOLP)
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtPct(kpis.lolp, 2)}</div>
                    </div>
                    <div className="mc-kpi">
                        <div className="mc-kpi-label">
                            Expected Unserved Energy (EENS)
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtNum(kpis.eens, 2)} <span className="mc-kpi-unit">MWh</span></div>
                    </div>
                    <div className="mc-kpi">
                        <div className="mc-kpi-label">
                            Reserve Sufficiency
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtPct(kpis.reserveSufficiency, 2)}</div>
                    </div>
                    <div className="mc-kpi">
                        <div className="mc-kpi-label">
                            Expected Cost (Mean)
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtINR(kpis.expectedCostMean)}</div>
                    </div>

                    <div className="mc-kpi">
                        <div className="mc-kpi-label">
                            Best-Case Cost (Min)
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtINR(kpis.bestCaseMin)}</div>
                    </div>
                    <div className="mc-kpi">
                        <div className="mc-kpi-label">
                            Median Cost (P50)
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtINR(kpis.medianP50)}</div>
                    </div>
                    <div className="mc-kpi">
                        <div className="mc-kpi-label">
                            P95 Worst-Case Cost
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtINR(kpis.p95Worst)}</div>
                    </div>
                    <div className="mc-kpi">
                        <div className="mc-kpi-label">
                            Peak Demand P95
                            <span className="mc-hint"><InfoIcon /></span>
                        </div>
                        <div className="mc-kpi-value">{fmtNum(kpis.peakDemandP95, 1)} <span className="mc-kpi-unit">MW</span></div>
                    </div>
                </section>
            )}

            {/* ============ QUANTILE CHART ============ */}
            {quantiles && (
                <section className="mc-card mc-chart-card">
                    <div className="mc-chart-head">
                        <div>
                            <h2 className="mc-card-title">Empirical Scenario Quantile Ranges</h2>
                            <p className="mc-card-sub">Empirical Scenario Quantile Ranges (P05 — Median P50 — P95)</p>
                        </div>
                        <QuantileLegend />
                    </div>
                    <QuantileRangeChart rows={quantiles} />
                </section>
            )}

            {/* ============ DETAILED TABLE (collapsible) ============ */}
            {quantiles && (
                <section className={`mc-card mc-table-card ${tableOpen ? 'open' : ''}`}>
                    <button
                        type="button"
                        className="mc-table-trigger"
                        aria-expanded={tableOpen}
                        onClick={() => setTableOpen((o) => !o)}
                    >
                        <span className="mc-table-trigger-icon"><TableIcon /></span>
                        <span className="mc-table-trigger-text">Detailed Empirical Quantiles Table</span>
                        <ChevronIcon />
                    </button>

                    <div className={`mc-collapse ${tableOpen ? 'open' : ''}`}>
                        <div className="mc-collapse-inner">
                            <div className="mc-table-wrap">
                                <table className="mc-table">
                                    <thead>
                                        <tr>
                                            <th>metric</th>
                                            <th>P05</th>
                                            <th>Median (P50)</th>
                                            <th>P95</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quantiles.map((r) => (
                                            <tr key={r.key}>
                                                <td>{r.label}</td>
                                                <td className="num">{fmtNum(r.p05, 2)}</td>
                                                <td className="num">{fmtNum(r.p50, 2)}</td>
                                                <td className="num">{fmtNum(r.p95, 2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ============ INTERPRETATION NOTE ============ */}
            {quantiles && (
                <aside className="mc-note">
                    <span className="mc-note-icon"><InfoIcon /></span>
                    <p>
                        <strong>Interpretation Note:</strong> Probabilistic risk metrics evaluated via residual
                        bootstrapping from the stacked out-of-fold ensemble. Tail clipping applied between 5th and
                        95th empirical percentiles. Reported quantiles represent empirical scenario bounds across
                        simulated trajectories and must not be interpreted as statistically calibrated prediction
                        intervals.
                    </p>
                </aside>
            )}
        </div>
    );
}

export default Monte_carlo;