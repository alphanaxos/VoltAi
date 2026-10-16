import React from 'react'
import './Process.css'

function Process() {
    return (
        <div>
            <div className="process-section reveal">
                <div className="process-header">
                    <div>
                        <div className="section-tag">How it works</div>
                        <h2 className="section-title">Plan, monitor,<br/>respond.</h2>
                    </div>
                    <p className="section-desc">VoltAI brings forecasting, dispatch signals, and operational context into one workspace
                        so teams can make confident decisions faster.</p>
                </div>

                <div className="process-grid">
                    <div className="process-card reveal d1">
                        <div className="process-num">01</div>
                        <div className="process-icon">
                            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                            </svg>
                        </div>
                        <div className="process-name">Connect</div>
                        <p className="process-desc">Bring in meter, weather, asset, and market data through secure integrations that fit
                            the systems your team already uses.</p>
                    </div>
                    <div className="process-card reveal d2">
                        <div className="process-num">02</div>
                        <div className="process-icon">
                            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                            </svg>
                        </div>
                        <div className="process-name">Understand</div>
                        <p className="process-desc">Turn incoming signals into clear forecasts, risk flags, and plain-language context for
                            planners and operators.</p>
                    </div>
                    <div className="process-card reveal d3">
                        <div className="process-num">03</div>
                        <div className="process-icon">
                            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                    stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
                            </svg>
                        </div>
                        <div className="process-name">Coordinate</div>
                        <p className="process-desc">Share recommended actions for dispatch, storage, curtailment, and maintenance without
                            taking control away from the team.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Process;
