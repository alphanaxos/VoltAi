
import React, { useState } from "react";
import "./Faq.css";

function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    {
      question: "What is a grid node in VoltAI?",
      answer:
        "A node is an individual connection point within the power grid — a substation, transformer, or distributed energy resource. VoltAI groups these points so operators can monitor status, compare performance, and coordinate action across the network.",
    },
    {
      question: "Which countries and grid standards does VoltAI support?",
      answer:
        "VoltAI is currently deployed across 34 countries and supports major grid standards including IEC 61850, IEEE C37.118, and ENTSO-E CGMES. Regional expansion is ongoing — contact us for your specific jurisdiction.",
    },
    {
      question: "How does decentralized renewable integration work?",
      answer:
        "VoltAI tracks each renewable source as a variable supply point, then helps teams plan storage, curtailment, and load-shifting decisions with better context.",
    },
    {
      question: "What security and compliance certifications does VoltAI hold?",
      answer:
        "VoltAI is certified under NERC CIP, ISO 27001, and SOC 2 Type II. Data in transit is encrypted using TLS 1.3, and grid commands require multi-party authorization. A full security whitepaper is available on request.",
    },
  ];

  const toggleFaq = (index) => {
    setActiveIndex((currentIndex) =>
      currentIndex === index ? null : index
    );
  };

  return (
    <section className="faq-section reveal">
      <div className="faq-left">
        <div className="section-tag">FAQ</div>

        <h2 className="section-title faq-title">
          Common
          <br />
          questions.
        </h2>

        <p className="section-desc faq-desc">
          Have more questions? Our team can walk through your region,
          grid standards, and rollout needs.
        </p>

        <a href="/contact" className="btn-outline contact-support">
          Contact Support

          <svg
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7v10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </a>
      </div>

      <div className="faq-list">
        {faqData.map((faq, index) => {
          const isOpen = activeIndex === index;

          return (
            <div
              className={`faq-item ${isOpen ? "is-open" : ""}`}
              key={faq.question}
            >
              <button
                type="button"
                className={`faq-q ${isOpen ? "open" : ""}`}
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                <span>{faq.question}</span>

                <span className="faq-arrow">
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5v14M5 12l7 7 7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                className={`faq-a ${isOpen ? "open" : ""}`}
                aria-hidden={!isOpen}
              >
                <div className="faq-a-inner">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Faq;
