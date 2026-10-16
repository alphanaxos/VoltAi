import React from 'react';
import { Link } from 'react-router-dom';
import './Cta.css';

function Cta() {
    return (
        <div className="cta-section reveal">
            <div className="cta-inner">
                <div>
                    <h2 className="cta-title">Ready for a clearer<br />operations desk?</h2>
                    <p className="cta-sub">See how VoltAI can fit into your current workflows, data systems, and operator routines.</p>
                </div>
                <div className="cta-actions">
                    <Link to="/dashboard" className="btn-large no-wrap">
                        Go to Dashboard
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Cta;
