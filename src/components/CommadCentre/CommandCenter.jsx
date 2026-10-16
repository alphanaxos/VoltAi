import React from 'react'
import './CommandCenter.css'

function CommandCenter() {
    return (
        <div className="command-section reveal">
            <div className="command-inner">
                <div className="command-header">
                    <div className="command-title-area">
                        <div className="section-tag">Live Operations</div>
                        <h2 className="section-title">Operations<br />Overview</h2>
                    </div>
                    <div className="command-controls">
                        <button className="time-btn">6H</button>
                        <button className="time-btn active">24H</button>
                        <button className="time-btn">7D</button>
                        <div className="live-badge">LIVE</div>
                    </div>
                </div>

                <div className="command-grid">
                    {/* <!-- Chart panel --> */}
                    <div className="cmd-panel cmd-panel-wide">
                        <div className="cmd-panel-title">
                            <span>Energy Output - MW</span>
                            <span>Operations Desk</span>
                        </div>
                        <div className="cmd-chart">
                            <svg className="chart-svg" viewBox="0 0 600 160" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#1f8a70" stop-opacity="0.12" />
                                        <stop offset="100%" stop-color="#1f8a70" stop-opacity="0" />
                                    </linearGradient>
                                </defs>
                                <line x1="0" y1="40" x2="600" y2="40" className="chart-grid-line" />
                                <line x1="0" y1="80" x2="600" y2="80" className="chart-grid-line" />
                                <line x1="0" y1="120" x2="600" y2="120" className="chart-grid-line" />
                                {/* <!-- Fill area --> */}
                                <path
                                    d="M0,100 C30,90 60,70 90,75 S150,85 180,70 S240,45 270,55 S330,80 360,65 S420,40 450,50 S510,60 540,45 L600,40 L600,160 L0,160 Z"
                                    className="chart-path-fill" />
                                {/* <!-- Main line --> */}
                                <path
                                    d="M0,100 C30,90 60,70 90,75 S150,85 180,70 S240,45 270,55 S330,80 360,65 S420,40 450,50 S510,60 540,45 L600,40"
                                    className="chart-path-main" />
                                {/* <!-- Secondary line (predicted) --> */}
                                <path
                                    d="M0,115 C30,108 60,95 90,98 S150,108 180,95 S240,72 270,80 S330,100 360,88 S420,68 450,74 S510,82 540,70 L600,65"
                                    className="chart-path-secondary" />
                                {/* <!-- Tooltip dot --> */}
                                <circle cx="450" cy="50" r="3" fill="#1f8a70" />
                                <circle cx="450" cy="50" r="7" fill="none" stroke="#1f8a70" stroke-opacity="0.25" stroke-width="1" />
                                <rect x="435" y="22" width="70" height="20" fill="rgba(31,138,112,0.08)" stroke="rgba(31,138,112,0.2)"
                                    stroke-width="0.5" rx="1" />
                                <text x="470" y="35" fill="#1f8a70" font-family="DM Mono" font-size="9" text-anchor="middle"
                                    letter-spacing="0.5">14.2 GW</text>
                            </svg>
                        </div>
                        <div className="metrics-row">
                            <div className="metric-cell">
                                <div className="metric-val">14.2 <span className="metric-unit">GW</span></div>
                                <div className="metric-lbl">Current Output</div>
                                <div className="metric-delta">↑ 2.1% efficiency</div>
                            </div>
                            <div className="metric-cell">
                                <div className="metric-val">99.8 <span className="metric-unit">%</span></div>
                                <div className="metric-lbl">Grid Stability</div>
                                <div className="metric-delta">↑ 0.3% from avg</div>
                            </div>
                            <div className="metric-cell">
                                <div className="metric-val">2.4 <span className="metric-unit">ms</span></div>
                                <div className="metric-lbl">Response Time</div>
                                <div className="metric-delta">Nominal range</div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Nodes + System --> */}
                    <div className="command-side-stack">
                        <div className="cmd-panel cmd-panel-flex">
                            <div className="cmd-panel-title">Active Nodes <span>140</span></div>
                            <div className="node-list">
                                <div className="node-item">
                                    <div className="node-indicator ok"></div>
                                    <div className="node-name">Sector Alpha</div>
                                    <div className="node-load">
                                        <div className="node-load-fill load-72"></div>
                                    </div>
                                    <div className="node-status ok">Stable</div>
                                </div>
                                <div className="node-item">
                                    <div className="node-indicator ok"></div>
                                    <div className="node-name">Grid Beta</div>
                                    <div className="node-load">
                                        <div className="node-load-fill load-58"></div>
                                    </div>
                                    <div className="node-status ok">Stable</div>
                                </div>
                                <div className="node-item">
                                    <div className="node-indicator ok node-indicator-balancing"></div>
                                    <div className="node-name">Nordic Link</div>
                                    <div className="node-load">
                                        <div className="node-load-fill load-88"></div>
                                    </div>
                                    <div className="node-status ok node-status-balancing">Balancing</div>
                                </div>
                                <div className="node-item">
                                    <div className="node-indicator warn"></div>
                                    <div className="node-name">Pacific Sub</div>
                                    <div className="node-load">
                                        <div className="node-load-fill high load-94"></div>
                                    </div>
                                    <div className="node-status warn">Warning</div>
                                </div>
                                <div className="node-item">
                                    <div className="node-indicator ok"></div>
                                    <div className="node-name">Euro West</div>
                                    <div className="node-load">
                                        <div className="node-load-fill load-45"></div>
                                    </div>
                                    <div className="node-status ok">Stable</div>
                                </div>
                            </div>
                        </div>

                        <div className="cmd-panel">
                            <div className="cmd-panel-title">System Health</div>
                            <div className="system-panel">
                                <div className="sys-ring-wrap">
                                    <div className="sys-ring">
                                        <svg width="110" height="110" viewBox="0 0 110 110">
                                            <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" />
                                            <circle cx="55" cy="55" r="44" fill="none" stroke="#1f8a70" stroke-width="8"
                                                stroke-dasharray="246 276" stroke-linecap="square" />
                                        </svg>
                                        <div className="sys-ring-text">
                                            <div className="sys-ring-pct">89%</div>
                                            <div className="sys-ring-lbl">Optimal</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="sys-metrics">
                                    <div className="sys-row"><span className="sys-key">CPU Load</span><span className="sys-val">24%</span></div>
                                    <div className="sys-row"><span className="sys-key">Memory</span><span className="sys-val">6.2 GB</span></div>
                                    <div className="sys-row"><span className="sys-key">Uptime</span><span className="sys-val">99.97%</span></div>
                                    <div className="sys-row"><span className="sys-key">Forecast Model</span><span className="sys-val">v4.2.1</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommandCenter;
