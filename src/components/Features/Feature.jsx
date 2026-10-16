import React from 'react'
import './Feature.css'

function Feature() {
  return (
    <div className="features-section">

      <div className="features-row reveal">
        <div className="feature-visual">
          {/* <!-- Animated demand chart --> */}
          <div className="feature-visual-inner demand-visual-inner">
            <div className="demand-chart-shell">
              <div className="demand-chart-header">
                <span>Demand Forecast — 72h</span>
                <div className="demand-accuracy-badge">
                  <span className="demand-acc-num">99% Accuracy</span>
                  <span className="demand-live">LIVE</span>
                </div>
              </div>

              <svg className="demand-forecast-svg" width="100%" viewBox="0 0 480 220" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1f8a70" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#1f8a70" stop-opacity="0.01" />
                  </linearGradient>
                  <linearGradient id="predictFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3f78a6" stop-opacity="0.10" />
                    <stop offset="100%" stop-color="#3f78a6" stop-opacity="0" />
                  </linearGradient>
                  <filter id="demandGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <clipPath id="chartClip">
                    <rect x="0" y="0" width="480" height="205" />
                  </clipPath>
                </defs>

                {/* <!-- Horizontal grid lines --> */}
                <line x1="0" y1="40" x2="480" y2="40" stroke="rgba(23,33,43,0.06)" stroke-width="1" />
                <line x1="0" y1="80" x2="480" y2="80" stroke="rgba(23,33,43,0.06)" stroke-width="1" />
                <line x1="0" y1="120" x2="480" y2="120" stroke="rgba(23,33,43,0.06)" stroke-width="1" />
                <line x1="0" y1="160" x2="480" y2="160" stroke="rgba(23,33,43,0.06)" stroke-width="1" />
                {/* <!-- Vertical grid lines --> */}
                <line x1="96" y1="0" x2="96" y2="205" stroke="rgba(23,33,43,0.045)" stroke-width="1" />
                <line x1="192" y1="0" x2="192" y2="205" stroke="rgba(23,33,43,0.045)" stroke-width="1" />
                <line x1="288" y1="0" x2="288" y2="205" stroke="rgba(23,33,43,0.045)" stroke-width="1" />
                <line x1="384" y1="0" x2="384" y2="205" stroke="rgba(23,33,43,0.045)" stroke-width="1" />

                {/* <!-- Actual demand area (Bengaluru dual-peak: rises morning, peaks ~15:30, dips, peaks again post-23h) --> */}
                <path clip-path="url(#chartClip)"
                  d="M0,175 C16,172 30,165 50,152 C70,138 82,120 100,108 C118,96 128,90 148,80 C162,73 172,65 192,58 C208,52 220,62 238,75 C256,88 268,98 284,92 C292,88 294,82 300,76"
                  fill="url(#demandFill)" />
                {/* <!-- extend area to bottom --> */}
                <path clip-path="url(#chartClip)"
                  d="M0,175 C16,172 30,165 50,152 C70,138 82,120 100,108 C118,96 128,90 148,80 C162,73 172,65 192,58 C208,52 220,62 238,75 C256,88 268,98 284,92 C292,88 294,82 300,76 L300,205 L0,205 Z"
                  fill="url(#demandFill)" opacity="0.6" />

                {/* <!-- Actual demand line --> */}
                <path
                  d="M0,175 C16,172 30,165 50,152 C70,138 82,120 100,108 C118,96 128,90 148,80 C162,73 172,65 192,58 C208,52 220,62 238,75 C256,88 268,98 284,92 C292,88 294,82 300,76"
                  fill="none" stroke="#1f8a70" stroke-width="2.2" stroke-linecap="round" filter="url(#demandGlow)" class="demand-line-draw" />

                {/* <!-- NOW vertical divider --> */}
                <line x1="300" y1="10" x2="300" y2="205" stroke="rgba(23,33,43,0.12)" stroke-width="1" stroke-dasharray="3 4" />
                <text x="304" y="22" font-family="DM Mono, monospace" font-size="8" fill="rgba(23,33,43,0.35)" letter-spacing="1">NOW</text>

                {/* <!-- Forecast area (from NOW onward) --> */}
                <path clip-path="url(#chartClip)"
                  d="M300,76 C316,70 330,64 350,56 C368,50 390,46 420,42 C444,40 462,38 480,36 L480,205 L300,205 Z"
                  fill="url(#predictFill)" />

                {/* <!-- Forecast line --> */}
                <path
                  d="M300,76 C316,70 330,64 350,56 C368,50 390,46 420,42 C444,40 462,38 480,36"
                  fill="none" stroke="#3f78a6" stroke-width="1.6" stroke-dasharray="5 4" stroke-linecap="round" opacity="0.75" />

                {/* <!-- Pulsing NOW dot --> */}
                <circle cx="300" cy="76" r="5" fill="#1f8a70" filter="url(#demandGlow)" />
                <circle cx="300" cy="76" r="11" fill="none" stroke="#1f8a70" stroke-width="1.2" opacity="0.3" class="pulse-ring" />

                {/* <!-- X-axis labels --> */}
                <g font-family="DM Mono, monospace" font-size="8.5" fill="rgba(23,33,43,0.38)">
                  <text x="0" y="218">00h</text>
                  <text x="88" y="218">06h</text>
                  <text x="184" y="218">12h</text>
                  <text x="280" y="218">18h</text>
                  <text x="376" y="218">24h</text>
                </g>
              </svg>

              <div className="demand-chart-legend">
                <div className="demand-legend-item"><span className="demand-legend-line demand-legend-actual"></span>Actual</div>
                <div className="demand-legend-item"><span className="demand-legend-line demand-legend-forecast"></span>Forecast</div>
              </div>
            </div>
          </div>
        </div>

        <div className="feature-content">
          <div className="feature-meta">Feature 01</div>
          <h3 className="feature-title">Demand<br/>Forecasting</h3>
          <p className="feature-desc">Forecast expected load using weather, usage patterns, events, and historical grid
            behavior, then compare those forecasts with what operators are seeing in the field.</p>
          <ul className="feature-bullets">
            <li>72-hour rolling demand prediction window</li>
            <li>Weather, market, and local event inputs</li>
            <li>Model refreshes as new readings arrive</li>
            <li>Early warnings for unusual demand changes</li>
          </ul>
        </div>
      </div>

      <div className="features-row reveal">
        <div className="feature-content">
          <div className="feature-meta">Feature 02</div>
          <h3 className="feature-title">Renewable<br/>Integration</h3>
          <p className="feature-desc">Track solar, wind, and storage availability alongside demand so operators can see where
            clean supply is available and where flexibility is needed.</p>
          <ul className="feature-bullets">
            <li>Dynamic curtailment and storage coordination</li>
            <li>ISO/IEC 61850 compliant integration</li>
          </ul>
        </div>

        <div className="feature-visual">
          <div className="feature-visual-inner">
            <div className="energy-mix-shell" id="energyMix">
              {/* <!-- Header bar --> */}
              <div className="em-header">
                <div className="em-header-left">
                  <span className="em-dot"></span>
                  <span className="en-title">LIVE ENERGY MIX</span>
                </div>
                <div className="em-stats">
                  <span className="en-stat-item"><span className="en-stat-val">18.5</span> GWh TOTAL</span>
                  <span className="en-stat-divider"></span>
                  <span className="en-stat-item"><span className="en-stat-val">36.2</span>% RENEWABLE</span>
                </div>
              </div>

              {/* <!-- SVG Pie Chart Canvas --> */}
              <svg className="em-svg" viewBox="0 0 560 300" preserveAspectRatio="xMidYMid meet">
                {/* <!-- Defs for glow --> */}
                <defs>
                  <filter id="glowMix">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* <!-- Background ring --> */}
                <circle cx="280" cy="140" r="80" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="30" />

                <g transform="rotate(-90 280 140)">
                  {/* <!-- Segments --> */}
                  <circle cx="280" cy="140" r="80" fill="none" stroke="#64748B" stroke-width="30" stroke-dasharray="193 503" stroke-dashoffset="0" class="em-slice" />
                  <circle cx="280" cy="140" r="80" fill="none" stroke="#F97316" stroke-width="30" stroke-dasharray="109 503" stroke-dashoffset="-195" class="em-slice" />
                  <circle cx="280" cy="140" r="80" fill="none" stroke="#F4C86A" stroke-width="30" stroke-dasharray="85 503" stroke-dashoffset="-306" class="em-slice" />
                  <circle cx="280" cy="140" r="80" fill="none" stroke="#00D4FF" stroke-width="30" stroke-dasharray="66 503" stroke-dashoffset="-393" class="em-slice" />
                  <circle cx="280" cy="140" r="80" fill="none" stroke="#3B82F6" stroke-width="30" stroke-dasharray="25 503" stroke-dashoffset="-461" class="em-slice" />
                  <circle cx="280" cy="140" r="80" fill="none" stroke="#8B5CF6" stroke-width="30" stroke-dasharray="13 503" stroke-dashoffset="-488" class="em-slice" />
                </g>

                {/* <!-- Center Label --> */}
                <text x="280" y="136" font-family="var(--font-display)" font-size="22" font-weight="700" fill="#000" text-anchor="middle">18.5</text>
                <text x="280" y="156" font-family="var(--font-mono)" font-size="9" fill="rgba(0,0,0,0.5)" text-anchor="middle" letter-spacing="0.1em">GWh TOTAL</text>

                {/* <!-- Pointers and Labels --> */}
                <g className="em-labels">
                  {/* <!-- Right side --> */}
                  <g className="em-label-group">
                    <polyline points="269,46 269,40 440,40" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
                    <circle cx="269" cy="46" r="3" fill="#8B5CF6" />
                    <text x="440" y="32" font-family="var(--font-mono)" font-size="9" fill="#8B5CF6" text-anchor="start">NUCLEAR</text>
                    <text x="440" y="52" font-family="var(--font-display)" font-size="14" fill="#000" text-anchor="start">500 MWh <tspan font-family="var(--font-mono)" font-size="9" fill="rgba(0,0,0,0.4)">(2.8%)</tspan></text>
                  </g>
                  <g className="em-label-group">
                    <polyline points="370,108 390,110 440,110" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
                    <circle cx="370" cy="108" r="3" fill="#64748B" />
                    <text x="440" y="102" font-family="var(--font-mono)" font-size="9" fill="#64748B" text-anchor="start">COAL</text>
                    <text x="440" y="122" font-family="var(--font-display)" font-size="14" fill="#000" text-anchor="start">7,200 MWh <tspan font-family="var(--font-mono)" font-size="9" fill="rgba(0,0,0,0.4)">(38.9%)</tspan></text>
                  </g>
                  <g className="em-label-group">
                    <polyline points="280,235 300,200 440,200" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
                    <circle cx="280" cy="235" r="3" fill="#F97316" />
                    <text x="440" y="192" font-family="var(--font-mono)" font-size="9" fill="#F97316" text-anchor="start">NATURAL GAS</text>
                    <text x="440" y="212" font-family="var(--font-display)" font-size="14" fill="#000" text-anchor="start">4,100 MWh <tspan font-family="var(--font-mono)" font-size="9" fill="rgba(0,0,0,0.4)">(22.1%)</tspan></text>
                  </g>

                  {/* <!-- Left side --> */}
                  <g className="em-label-group">
                    <polyline points="243,53 220,40 120,40" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
                    <circle cx="243" cy="53" r="3" fill="#3B82F6" />
                    <text x="120" y="32" font-family="var(--font-mono)" font-size="9" fill="#3B82F6" text-anchor="end">HYDRO</text>
                    <text x="120" y="52" font-family="var(--font-display)" font-size="14" fill="#000" text-anchor="end"><tspan font-family="var(--font-mono)" font-size="9" fill="rgba(0,0,0,0.4)">(5.4%) </tspan> 1,000 MWh</text>
                  </g>
                  <g className="em-label-group">
                    <polyline points="201,87 180,110 120,110" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
                    <circle cx="201" cy="87" r="3" fill="#00D4FF" />
                    <text x="120" y="102" font-family="var(--font-mono)" font-size="9" fill="#00D4FF" text-anchor="end">WIND</text>
                    <text x="120" y="122" font-family="var(--font-display)" font-size="14" fill="#000" text-anchor="end"><tspan font-family="var(--font-mono)" font-size="9" fill="rgba(0,0,0,0.4)">(13.5%) </tspan> 2,500 MWh</text>
                  </g>
                  <g className="em-label-group">
                    <polyline points="191,172 170,200 120,200" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
                    <circle cx="191" cy="172" r="3" fill="#F4C86A" />
                    <text x="120" y="192" font-family="var(--font-mono)" font-size="9" fill="#F4C86A" text-anchor="end">SOLAR</text>
                    <text x="120" y="212" font-family="var(--font-display)" font-size="14" fill="#000" text-anchor="end"><tspan font-family="var(--font-mono)" font-size="9" fill="rgba(0,0,0,0.4)">(17.3%) </tspan> 3,200 MWh</text>
                  </g>
                </g>
              </svg>

              {/* <!-- Bottom status row --> */}
              <div className="em-footer">
                <div className="en-source"><span className="em-dot em-dot-fossil"></span><span>Fossil</span><strong>61.0%</strong></div>
                <div className="en-source"><span className="em-dot em-dot-renewable"></span><span>Renewable</span><strong>36.2%</strong></div>
                <div className="en-source"><span className="em-dot em-dot-nuclear"></span><span>Nuclear</span><strong>2.8%</strong></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

export default Feature;
