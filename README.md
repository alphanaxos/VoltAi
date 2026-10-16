# ⚡ VoltAI — AI-Powered Grid Intelligence & Operational Analytics Platform

<div align="center">

![VoltAI Banner](src/assets/voltai-logo.png)

**Next-Generation Power Grid Operations Desk, AI Load Forecasting & Risk Decision Support System**

[![React](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v7.18.4-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![CSS3](https://img.shields.io/badge/Vanilla_CSS-Custom_Design_Tokens-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Architecture](https://img.shields.io/badge/Architecture-Modular_Component_Hierarchy-1F8A70?style=for-the-badge)](https://github.com/)
[![PyPSA & ML Ready](https://img.shields.io/badge/Backend_Ready-PyPSA_|_XGBoost_|_Monte_Carlo-3F78A6?style=for-the-badge)](https://pypsa.org/)

[Live Dashboard Demo](#-dashboard-modules) • [Key Features](#-core-features) • [Project Structure](#-project-directory-structure) • [Getting Started](#-getting-started) • [Routing](#-routing-architecture)

</div>

---

## 📖 Overview

**VoltAI** is an industrial-grade frontend application engineered for power system transmission and distribution operators, energy trading desks, and grid reliability engineers. The platform combines machine-learning load forecasting, PyPSA-based economic dispatch scheduling, and empirical Monte Carlo risk assessment into a unified, high-performance operational cockpit.

Built with **React 19**, **React Router v7**, and a bespoke **Vanilla CSS design system**, VoltAI delivers 60fps data visualizations and complex interactive charts using pure, responsive SVGs without the bundle bloat of third-party charting libraries.

---

## ✨ Core Features

### 🌐 1. Public Grid Intelligence Portal (Landing Page)
The public interface presents the technical and operational capabilities of the VoltAI platform with smooth section navigation and modern visual aesthetics:
* **Hero Section (`Hero.jsx`)**: High-impact introduction highlighting real-time telemetry, model confidence, and quick action launch buttons.
* **Operational Marquee (`Marque.jsx`)**: Continuous ribbon showcasing supported grid protocols (PyPSA, XGBoost, SCADA, IEEE Bus standards, OpenDSS).
* **4-Stage Pipeline Workflow (`Process.jsx`)**: Step-by-step interactive breakdown:
  1. *SCADA & Weather Telemetry Ingestion*
  2. *Gradient-Boosted ML Demand & Solar Forecasting*
  3. *PyPSA Constrained Economic Dispatch Optimization*
  4. *Monte Carlo Uncertainty & Loss-of-Load Risk Quantification*
* **Feature Grid (`Feature.jsx`)**: Deep-dive cards into transmission congestion management, renewable ramp mitigation, and reserve margin planning.
* **Interactive Command Center Preview (`CommandCenter.jsx`)**: Live interactive sandbox previewing grid dynamics directly from the landing page.
* **Technical FAQ (`Faq.jsx`)**: Accordion answers covering PyPSA integration, latency, solver configurations, and data provenance.
* **Conversion CTA & Footer (`Cta.jsx`, `Footer.jsx`)**: Quick navigation, status monitors, and operator access points.

---

### 🎛️ 2. Operations Desk (Dashboard Modules)

The core dashboard (`/dashboard/*`) contains 4 specialized mission-critical modules accessible through a responsive sidebar:

#### 📊 Module 1: System Overview (`/dashboard/overview`)
* **Real-Time Telemetry Cards**: Instant view of active grid load (MW), 24h peak projection, system reserve margin (%), renewable penetration, and ambient weather telemetry (Temperature, Humidity, Wind speed, Solar irradiance).
* **24-Hour Demand & Renewable Forecasting Chart**: High-precision SVG dual-area chart rendering baseline demand curves against ML predictions with interactive hover inspection points.
* **Asset & Generation Status Monitors**: Real-time operating statuses for thermal base-load, combined-cycle gas turbines, and distributed solar installations.
* **Interactive Weather Sandbox**: Editable hourly ambient condition table with automatic recalculation triggers for downstream ML models.

#### ⚡ Module 2: Scenario Analysis & Stress Testing (`/dashboard/scenario`)
* **Multi-Factor "What-If" Engine**: Test grid stability against operational contingencies:
  * *Heatwave Contingency (+5°C demand surge & cooling stress)*
  * *Night Peak Shift (22:00 Fourier harmonics redistribution)*
  * *Rainy Day Attenuation (70% solar irradiance drop & humidity spike)*
  * *Festival / Holiday Industrial Load Modification*
* **Comparative Metric Deltas**: Side-by-side variance analysis showing MW displacement, peak delta percentage, and operational margin impact.
* **Stacked Contingency Dispatch Chart**: Dynamic SVG stacked bar visualization contrasting baseline dispatch vs. stressed contingency generation requirements.

#### ⚙️ Module 3: PyPSA Economic Dispatch (`/dashboard/dispatch`)
* **Least-Cost Unit Commitment**: Integrates PyPSA (Python for Power System Analysis) optimal power flow (OPF) results for 24-hour horizon scheduling.
* **Marginal Cost & Carbon Tracking**: Live calculation of system generation costs ($/MWh), total operating expense (OPEX), and carbon emissions intensity (tCO₂/MWh).
* **Interactive Stacked Dispatch Bar Chart**:
  * Visualizes hourly commitments across **Solar Farm (Renewable)**, **Coal Base (Must-Run)**, and **Gas Peaker (Marginal)**.
  * **Interactive Crosshair & Hover Tooltip**: Instantaneous inspection of exact generation per fuel source, total demand dot indicator, and column highlight band.
* **Generation Mix Donut Chart**: Fuel split proportions and reserve headroom visualization.
* **Full 24-Hour Dispatch Schedule Table**: Comprehensive data table with hour-by-hour demand, generation breakdown, reserve margins, and hourly clearing prices.

#### 🎲 Module 4: Monte Carlo Risk Analysis (`/dashboard/montecarlo`)
* **Uncertainty Quantification**: Empirical residual block-bootstrapping simulating 1,000+ stochastic realizations of weather and load volatility.
* **Grid Reliability KPIs**:
  * **LOLP (Loss of Load Probability %)**
  * **EENS (Expected Energy Not Served MWh)**
  * **Reserve Sufficiency & Maximum P95 Peak Load**
* **Empirical Scenario Quantile Ranges Chart**:
  * Displays 24-hour stochastic spreads: **P05 (Conservative Low)**, **Median (P50 Expected)**, and **P95 (Extreme Stressed Upper Bound)**.
  * **Interactive Quantile Tooltip**: Hover over any hour to inspect exact P05, Median, P95 values and the 90% confidence spread.
  * **Mobile Responsive Horizontal Scroll**: Built-in horizontal scroll container (`.mc-chart-wrap`) ensuring zero chart squishing on mobile devices.
* **Hourly Quantiles Table**: Tabular breakdown of percentile values and reliability risk indicators.

#### 🎚️ Module 5: Demo Data Controls (`/dashboard/demo`)
* Extensible sandbox allowing operators to inject custom mock datasets, switch timeframes, or simulate telemetry drops.

---

## 🎨 UI/UX & Design System

VoltAI utilizes a bespoke, cohesive design system defined via CSS Custom Properties in [`src/index.css`](file:///Users/aniket/Desktop/final%20year%20/frontend/src/index.css):

```css
:root {
  /* Accent Colors */
  --c: #1F8A70;         /* Volt Emerald (Primary Action & Brand) */
  --c2: #3F78A6;        /* Grid Slate Blue (Secondary Accents & Controls) */

  /* Surface & Background Colors */
  --bg: #F9FAF9;        /* Canvas Background */
  --bg2: #F5F5F7;       /* Secondary Panel Fill */
  --bg3: #EFF3F1;       /* Light Accent Surface */
  --card: #FFFFFF;      /* Elevated Card Background */
  --background-color: #EFF3F5;

  /* Borders & Dividers */
  --border: rgba(23, 33, 43, 0.12);
  --border-c: rgba(31, 138, 112, 0.22);

  /* Typography */
  --text: #17212B;
  --text-primary: #1D1D1F;
  --text-secondary: #6E6E73;
  --text-tertiary: #86868B;
  --muted: #7B838B;

  /* Font Families */
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', monospace;
}
```

### Design Highlights:
* **Glassmorphic Topbars & Accents**: Translucent navigation bars with `backdrop-filter: blur(12px)`.
* **Micro-Noise & Subtle Isometric Grid**: Applied globally via pure CSS SVG data URIs (`body::before` noise overlay, `body::after` 115px grid lines).
* **Pure SVG Chart Engine**: Custom mathematical SVG path generators with smooth cubic Bézier curves (`calcCurvePath`), linear gradients, interactive crosshairs, and dynamic HTML tooltips.
* **Persistent Collapsible Navigation**: Sidebar collapses to an icon-only strip on desktop (persisting state in `localStorage`), and converts into a sliding drawer with touch backdrop and keyboard `Escape` dismiss on mobile screens (`<= 900px`).

---

## 📁 Project Directory Structure

```text
frontend/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── assets/                     # Logos, brand badges, and static vector graphics
│   │   ├── favicon.png
│   │   ├── grid.png
│   │   └── voltai-logo.png
│   ├── components/                 # Reusable UI & Feature components
│   │   ├── CommadCentre/           # Interactive live simulation preview
│   │   │   ├── CommandCenter.jsx
│   │   │   └── CommandCenter.css
│   │   ├── CTA/                    # Call-to-action banner
│   │   │   ├── Cta.jsx
│   │   │   └── Cta.css
│   │   ├── DashBoard/              # Operator dashboard sub-views
│   │   │   ├── Analysis/           # Scenario analysis & what-if stress tests
│   │   │   │   ├── Analysis.jsx
│   │   │   │   └── Analysis.css
│   │   │   ├── Monte_Carlo/        # Empirical Monte Carlo risk simulation
│   │   │   │   ├── Monte_carlo.jsx
│   │   │   │   └── Monte_carlo.css
│   │   │   ├── PyPSa/              # PyPSA economic dispatch & generation schedule
│   │   │   │   ├── Pypsa.jsx
│   │   │   │   └── Pypsa.css
│   │   │   └── System_Overview/    # Real-time telemetry & demand forecasting
│   │   │       ├── Syste_OverView.jsx
│   │   │       └── Syste_OverView.css
│   │   ├── FAQ/                    # Expandable FAQ accordion
│   │   │   ├── Faq.jsx
│   │   │   └── Faq.css
│   │   ├── Features/               # Platform capability cards
│   │   │   ├── Feature.jsx
│   │   │   └── Feature.css
│   │   ├── Footer/                 # Global footer
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.css
│   │   ├── Header/                 # Fixed responsive header navbar
│   │   │   ├── Hedder.jsx
│   │   │   └── Header.css
│   │   ├── Hero/                   # Landing page hero banner
│   │   │   ├── Hero.jsx
│   │   │   └── Hero.css
│   │   ├── Marque/                 # Infinite looping technology marquee
│   │   │   ├── Marque.jsx
│   │   │   └── Marque.css
│   │   ├── Process/                # 4-stage engineering pipeline
│   │   │   ├── Process.jsx
│   │   │   └── Process.css
│   │   └── Slider/                 # Sidebar navigation & mobile drawer
│   │       ├── Sidebar.jsx
│   │       └── Sidebar.css
│   ├── pages/                      # Top-level route pages
│   │   ├── DashBoard/              # Dashboard container with sidebar & tab router
│   │   │   ├── DashBoard.jsx
│   │   │   └── Dashboard.css
│   │   └── LandingPage/            # Landing page container with smooth scroll
│   │       ├── LandingPage.jsx
│   │       └── LandingPage.css
│   ├── App.css                     # Root layout styles
│   ├── App.js                      # React Router route definitions
│   ├── App.test.js                 # Unit tests
│   ├── index.css                   # Global styles, fonts, CSS variables & reset
│   ├── index.js                    # Application entry point
│   ├── reportWebVitals.js          # Web vitals telemetry reporter
│   └── setupTests.js               # Jest DOM setup
├── package.json                    # Dependencies and npm scripts
└── README.md                       # Documentation
```

---

## 🚦 Routing Architecture

VoltAI uses **React Router v7** with clean, RESTful path-based routing. Old hash navigation (`#montecarlo`) has been upgraded to clean subpath URLs:

| Path | Component | Description |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Main landing page and technical overview |
| `/grid-intelligence` | `LandingPage.jsx` | Smooth scrolls to Hero & Intelligence section |
| `/working` | `LandingPage.jsx` | Smooth scrolls to the 4-Stage Workflow |
| `/features` | `LandingPage.jsx` | Smooth scrolls to Platform Capabilities |
| `/operations` | `LandingPage.jsx` | Smooth scrolls to Command Center preview |
| `/faq` | `LandingPage.jsx` | Smooth scrolls to Technical FAQ |
| `/dashboard` | `DashBoard.jsx` | Redirects to active tab (defaults to `/dashboard/overview`) |
| `/dashboard/overview` | `Syste_OverView.jsx`| Real-time grid telemetry & demand forecasting |
| `/dashboard/scenario` | `Analysis.jsx` | What-if contingency stress testing |
| `/dashboard/dispatch` | `Pypsa.jsx` | PyPSA economic dispatch schedule & cost metrics |
| `/dashboard/montecarlo`| `Monte_carlo.jsx`| Monte Carlo risk analysis & quantile spreads |
| `/dashboard/demo` | `DashBoard.jsx` | Demo data controls sandbox |

> **State Persistence**: The active tab and sidebar collapsed state are automatically synchronized with the browser's `localStorage` (`dash-active-tab` and `sb-collapsed`).

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* **Node.js**: `v18.0.0` or higher (Node 20+ LTS recommended)
* **npm**: `v9.0.0` or higher (bundled with Node)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/voltai-power-grid.git
   cd "final year /frontend"
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and navigate to:
   * **Landing Page**: [http://localhost:3000](http://localhost:3000)
   * **Dashboard**: [http://localhost:3000/dashboard/overview](http://localhost:3000/dashboard/overview)

---

## 📜 Available NPM Scripts

In the project directory, you can run:

| Command | Action |
| :--- | :--- |
| `npm start` | Runs the application in development mode with Hot Module Replacement (HMR) at `http://localhost:3000`. |
| `npm run build` | Bundles and minifies the code for production into the `build/` directory with hash-versioned assets. |
| `npm test` | Launches the interactive Jest test runner. |
| `npm run eject` | Copies all build scripts and configurations (webpack, Babel, ESLint) directly into the project. *(Note: One-way operation!)* |

---

## 🔌 Backend Integration & API Extension Guide

Every dashboard view is architected with modular prop interfaces and realistic default fallbacks. Connecting live FastAPI, Flask, or Node backends is straightforward:

### Connecting System Overview (`Syste_OverView.jsx`)
```jsx
<Syste_OverView
  telemetry={{
    demandMw: 2150.8,
    timestamp: '2025-05-18 14:00:00',
    temperatureC: 28.4,
    humidityPct: 55,
  }}
  onRefresh={async () => {
    const res = await fetch('/api/v1/telemetry/latest');
    return await res.json();
  }}
  onGenerate={async (weatherRows) => {
    const res = await fetch('/api/v1/forecast/xgboost', {
      method: 'POST',
      body: JSON.stringify({ weather: weatherRows }),
    });
    return await res.json();
  }}
/>
```

### Connecting PyPSA Economic Dispatch (`Pypsa.jsx`)
```jsx
// Simply link the solver endpoint:
const runPypsaOptimization = async (gasMultiplier, coalAvailable) => {
  const response = await fetch('/api/v1/pypsa/solve-dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gasMultiplier, coalAvailable }),
  });
  return await response.json(); // Returns 24h schedule: { hour, coal, gas, solar, cost }
};
```

### Connecting Monte Carlo Risk (`Monte_carlo.jsx`)
```jsx
const fetchMonteCarloSimulations = async (runs, bootstrapBlock) => {
  const response = await fetch(`/api/v1/risk/monte-carlo?runs=${runs}&block=${bootstrapBlock}`);
  return await response.json(); // Returns quantiles: { p05, p50, p95, lolp, eens }
};
```

---

## 💻 Browser Compatibility & Performance

* **Chrome / Chromium**: Version 90+ (Full Support)
* **Firefox**: Version 88+ (Full Support)
* **Safari**: Version 14+ (Full Support)
* **Edge**: Version 90+ (Full Support)
* **Mobile Browsers**: iOS Safari, Android Chrome (Full responsive support with mobile navigation drawer and horizontal table/chart scrolling).

---

## 🛡️ License & Academic Project Notice

Developed as a Final Year Engineering Capstone Project focusing on **AI Applications in Power Systems & Renewable Energy Integration**.

Licensed under the [MIT License](LICENSE).
