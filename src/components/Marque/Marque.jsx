import React from 'react'
import './Marque.css'

function Marque() {
    return (
        <div>
            <div className="marquee-section">
                <div className="marquee-track">
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Demand Forecasting <span>99% Accuracy</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Real-time Optimization <span>2.4ms</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Renewable Integration <span>140+ Sources</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Fault Prediction <span>48h Advance</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Carbon Reduction <span>31% Less</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Operator Reviews <span>Daily</span>
                    </div>
                    
                    {/* <!-- duplicate for seamless loop --> */}
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Demand Forecasting <span>99% Accuracy</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Real-time Optimization <span>2.4ms</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Renewable Integration <span>140+ Sources</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Fault Prediction <span>48h Advance</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Carbon Reduction <span>31% Less</span>
                    </div>
                    <div className="marquee-item">
                        <div className="marquee-sep"></div> Operator Reviews <span>Daily</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Marque;
