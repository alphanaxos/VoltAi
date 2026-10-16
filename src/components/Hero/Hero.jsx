import React from 'react'
import './Hero.css'

function Hero() {
    return (
        <div className="hero">
            <div class="hero-bg-orb"></div>
            <div class="hero-bg-orb-2"></div>

            {/* Left part */}
            <div className="hero-left">
                <div className="status-pill">
                    <span className="status-dot"></span>
                    Built for utility teams
                </div>

                <h1 className='hero-headline'>
                    Smarter<br />
                    Energy<br />
                    <span className="accent">Operations.</span>
                </h1>

                <p className="hero-sub">
                    Practical software for forecasting demand, coordinating renewable supply, and helping operators act before
                    small issues become outages.
                </p>


                {/* Hero Action */}

                <div className="hero-actions">
                    <a
                        href="/working"
                        className="btn-outline"
                        onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById('working');
                            if (el) {
                                const headerOffset = 72;
                                const offsetPosition = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                                window.history.pushState(null, '', '/working');
                            }
                        }}
                    >
                        View platform
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                    </a>
                </div>

                <div class="hero-stats">
                    <div>
                        <span class="hero-stat-num">99.8%</span>
                        <span class="hero-stat-label">Grid Efficiency</span>
                    </div>
                    <div>
                        <span class="hero-stat-num">2.4ms</span>
                        <span class="hero-stat-label">Response Latency</span>
                    </div>
                    <div>
                        <span class="hero-stat-num">140+</span>
                        <span class="hero-stat-label">Active Nodes</span>
                    </div>
                </div>
            </div>

            {/* Right part */}
            <div class="hero-right">
                <div class="operations-preview">
                    <div class="preview-topbar">
                        <div>
                            <span class="preview-kicker">Today</span>
                            <strong>Grid operations</strong>
                        </div>
                        <span class="preview-badge">Stable</span>
                    </div>

                    <div class="preview-body">
                        <div class="preview-map">
                            <svg viewBox="0 0 380 220" width="100%" height="100%" role="img" aria-label="Demand forecast chart">
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#1f8a70" stop-opacity="0.22" />
                                        <stop offset="100%" stop-color="#1f8a70" stop-opacity="0.01" />
                                    </linearGradient>
                                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stop-color="#3f78a6" stop-opacity="0.14" />
                                        <stop offset="100%" stop-color="#3f78a6" stop-opacity="0.01" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                </defs>

                                {/* <!-- Grid lines --> */}
                                <line x1="0" y1="55" x2="380" y2="55" stroke="rgba(31,45,53,0.06)" stroke-width="1" />
                                <line x1="0" y1="100" x2="380" y2="100" stroke="rgba(31,45,53,0.06)" stroke-width="1" />
                                <line x1="0" y1="145" x2="380" y2="145" stroke="rgba(31,45,53,0.06)" stroke-width="1" />
                                <line x1="0" y1="190" x2="380" y2="190" stroke="rgba(31,45,53,0.06)" stroke-width="1" />
                                <line x1="63" y1="10" x2="63" y2="200" stroke="rgba(31,45,53,0.05)" stroke-width="1" />
                                <line x1="126" y1="10" x2="126" y2="200" stroke="rgba(31,45,53,0.05)" stroke-width="1" />
                                <line x1="190" y1="10" x2="190" y2="200" stroke="rgba(31,45,53,0.05)" stroke-width="1" />
                                <line x1="253" y1="10" x2="253" y2="200" stroke="rgba(31,45,53,0.05)" stroke-width="1" />
                                <line x1="316" y1="10" x2="316" y2="200" stroke="rgba(31,45,53,0.05)" stroke-width="1" />

                                {/* <!-- Actual demand area fill (Bengaluru dual-peak pattern) --> */}
                                <path d="M10,170 C30,168 45,162 63,148 C80,134 90,118 110,106 C128,95 138,90 155,82 C168,75 175,68 190,65 C205,61 215,70 230,80 C248,92 258,100 270,96 C282,90 290,82 300,72 C312,60 322,52 340,50 C355,48 365,52 375,56 L375,200 L10,200 Z"
                                    fill="url(#areaGrad)" />

                                {/* <!-- Actual demand line --> */}
                                <path d="M10,170 C30,168 45,162 63,148 C80,134 90,118 110,106 C128,95 138,90 155,82 C168,75 175,68 190,65 C205,61 215,70 230,80 C248,92 258,100 270,96 C282,90 290,82 300,72 C312,60 322,52 340,50 C355,48 365,52 375,56"
                                    fill="none" stroke="#1f8a70" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)" class="chart-draw" />

                                {/* <!-- Forecast line (dashed) --> */}
                                <path d="M190,65 C205,58 215,62 230,68 C248,76 260,84 275,78 C290,72 305,60 325,48 C340,40 360,38 375,42"
                                    fill="none" stroke="#3f78a6" stroke-width="1.8" stroke-dasharray="5,4" stroke-linecap="round" opacity="0.7" />

                                {/* <!-- X-axis hour labels --> */}
                                <g font-family="DM Mono, monospace" font-size="8" fill="rgba(23,33,43,0.38)" letter-spacing="0.5">
                                    <text x="10" y="215">00h</text>
                                    <text x="58" y="215">04h</text>
                                    <text x="121" y="215">08h</text>
                                    <text x="184" y="215">12h</text>
                                    <text x="247" y="215">16h</text>
                                    <text x="310" y="215">20h</text>
                                    <text x="360" y="215">24h</text>
                                </g>

                                {/* <!-- Y-axis labels --> */}
                                <g font-family="DM Mono, monospace" font-size="8" fill="rgba(23,33,43,0.38)">
                                    <text x="0" y="58" text-anchor="start">8GW</text>
                                    <text x="0" y="103" text-anchor="start">6GW</text>
                                    <text x="0" y="148" text-anchor="start">4GW</text>
                                    <text x="0" y="193" text-anchor="start">2GW</text>
                                </g>

                                {/* <!-- Peak annotation dot — evening peak (15:30 / Bengaluru pattern) --> */}
                                <circle cx="190" cy="65" r="5" fill="#1f8a70" filter="url(#glow)" class="pulse-dot" />
                                <circle cx="190" cy="65" r="10" fill="none" stroke="#1f8a70" stroke-width="1.2" opacity="0.4" class="pulse-ring" />

                                {/* <!-- Late-night peak --> */}
                                <circle cx="340" cy="50" r="4" fill="#3f78a6" />

                                {/* <!-- Tooltip box at peak --> */}
                                <rect x="196" y="38" width="82" height="30" rx="8" fill="white" stroke="rgba(31,45,53,0.10)" stroke-width="1" />
                                <text x="204" y="51" font-family="DM Mono, monospace" font-size="7.5" fill="rgba(23,33,43,0.5)">PEAK LOAD</text>
                                <text x="204" y="63" font-family="DM Sans, sans-serif" font-size="11" font-weight="700" fill="#17212b">8,300 MW</text>

                                {/* <!-- Legend --> */}
                                <line x1="12" y1="14" x2="28" y2="14" stroke="#1f8a70" stroke-width="2.5" stroke-linecap="round" />
                                <text x="32" y="18" font-family="DM Mono, monospace" font-size="8" fill="rgba(23,33,43,0.55)">Actual</text>
                                <line x1="78" y1="14" x2="94" y2="14" stroke="#3f78a6" stroke-width="1.8" stroke-dasharray="4,3" />
                                <text x="98" y="18" font-family="DM Mono, monospace" font-size="8" fill="rgba(23,33,43,0.55)">Forecast</text>
                            </svg>
                        </div>

                        <div class="preview-side">
                            <div class="preview-stat">
                                <span>Forecast load</span>
                                <strong>14.2 GW</strong>
                            </div>
                            <div class="preview-stat">
                                <span>Renewable share</span>
                                <strong>41%</strong>
                            </div>
                            <div class="preview-stat">
                                <span>Open alerts</span>
                                <strong>3</strong>
                            </div>
                        </div>
                    </div>

                    {/* Hourly bar chart - load distribution */}
                    <div class="preview-chart">
                        <div class="chart-label-row">
                            <span class="chart-title">Hourly load distribution</span>
                            <span class="chart-legend"><span class="legend-dot teal"></span>Renewable &nbsp;<span class="legend-dot blue"></span>Conventional</span>
                        </div>
                        <div class="chart-bars">
                            <span class="chart-bar bar-1"></span>
                            <span class="chart-bar bar-2"></span>
                            <span class="chart-bar bar-3"></span>
                            <span class="chart-bar bar-4"></span>
                            <span class="chart-bar bar-5"></span>
                            <span class="chart-bar bar-6"></span>
                            <span class="chart-bar bar-7"></span>
                            <span class="chart-bar bar-8"></span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default Hero;
