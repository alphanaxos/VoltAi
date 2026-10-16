import React, { useEffect } from 'react';

import Header from '../../components/Header/Hedder';
import Hero from '../../components/Hero/Hero';
import Marque from '../../components/Marque/Marque';
import Process from '../../components/Process/Process';
import Feature from '../../components/Features/Feature';
import CommandCenter from '../../components/CommadCentre/CommandCenter';
import Faq from '../../components/FAQ/Faq';
import Cta from '../../components/CTA/Cta';
import Footer from '../../components/Footer/Footer';

import './LandingPage.css';

function LandingPage() {
  useEffect(() => {
    // If user opens URL with path like /grid-intelligence, /working, or hash
    const cleanPath = window.location.pathname.replace(/^\/+/, '').split('/')[0];
    const hash = window.location.hash.replace(/^#/, '');
    const targetId = cleanPath || hash;

    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          const headerOffset = 72;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 150);
      }
    }
  }, []);

  return (
    <div id="top">
      <Header />

      <main>
        <section id="grid-intelligence">
          <Hero />
        </section>

        <Marque />

        <section id="working">
          <Process />
        </section>

        <section id="features">
          <Feature />
        </section>

        <section id="operations">
          <CommandCenter />
        </section>

        <section id="faq">
          <Faq />
        </section>

        <Cta />
        <Footer />
      </main>
    </div>
  );
}

export default LandingPage;