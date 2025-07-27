// src/components/Welcome.tsx

import React from 'react';

interface WelcomeProps {
  onNavigate?: (tab: 'linear' | 'area' | 'mass_volume' | 'methodology') => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="transparency-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <header>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🫀 Cardiac Scaling Analysis Laboratory</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--pico-muted-color)', marginBottom: '2rem' }}>
            Discover how different scaling approaches dramatically affect cardiac measurement interpretation
          </p>
        </header>

        <div className="insight-warning" style={{ marginBottom: '2rem' }}>
          <h3>🔍 The Hidden Problem</h3>
          <p>
            Current clinical practice assumes <strong>all</strong> cardiac measurements scale the same way with body size. 
            But should a 1-dimensional wall thickness really scale like a 3-dimensional heart mass?
          </p>
        </div>
      </section>

      {/* Value Propositions */}
      <section>
        <h2>🚀 What You'll Discover</h2>
        
        <div className="metrics-grid">
          <article className="insight-info">
            <header>
              <h3>📐 Geometric Limitations</h3>
            </header>
            <p>
              See why traditional BSA indexing overcorrects linear measurements like wall thickness, 
              making large patients appear to have smaller hearts than they actually do.
            </p>
            <p><strong>Explore:</strong> Linear Measurements tab</p>
          </article>

          <article className="insight-success">
            <header>
              <h3>🎯 The One That Works</h3>
            </header>
            <p>
              Discover that area measurements are the only cardiac parameters where traditional 
              BSA indexing is geometrically correct - BSA^1.0 = BSA^1.0!
            </p>
            <p><strong>Explore:</strong> Area Measurements tab</p>
          </article>

          <article className="insight-warning">
            <header>
              <h3>🤔 The Height Mystery</h3>
            </header>
            <p>
              Investigate why heart mass doesn't follow Height^3.0 as pure geometry predicts. 
              Compare Height^1.6 vs Height^2.7 empirical findings.
            </p>
            <p><strong>Explore:</strong> Mass & Volume tab</p>
          </article>

          <article className="insight-info">
            <header>
              <h3>🔬 Universal Biology</h3>
            </header>
            <p>
              Test whether cardiac measurements scale universally across sexes when properly 
              normalized to lean body mass. Spoiler: they do!
            </p>
            <p><strong>All tabs:</strong> Compare ratiometric vs biological scaling</p>
          </article>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="insight-success">
          <h2>🎯 Ready to Explore?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Start with <strong>Linear Measurements</strong> to see the most dramatic differences, 
            or jump to <strong>Mass & Volume</strong> to explore the height exponent mystery.
          </p>
          
          <div className="button-group" style={{ justifyContent: 'center' }}>
            <button 
              onClick={() => onNavigate?.('linear')}
              style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
            >
              📐 Start with Linear
            </button>
            <button 
              onClick={() => onNavigate?.('mass_volume')}
              style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
            >
              📦 Explore Mass & Volume
            </button>
            <button 
              onClick={() => onNavigate?.('methodology')}
              className="secondary" 
              style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
            >
              🔬 See Methodology
            </button>
          </div>
        </div>
      </section>

      {/* Important Disclaimers */}
      <section style={{ borderTop: '1px solid var(--pico-border-color)', paddingTop: '2rem' }}>
        <div className="insight-danger">
          <h3>⚠️ Important Disclaimers</h3>
          <div className="metrics-grid">
            <div>
              <h4>🚨 Not for Clinical Use</h4>
              <p>
                This tool is for <strong>educational exploration only</strong>. All data is derivative 
                from published literature. Do not use for patient care or clinical decisions.
              </p>
            </div>
            <div>
              <h4>📚 Educational Purpose</h4>
              <p>
                We're demonstrating geometric scaling principles and the Dewey methodology. 
                This is an interactive textbook, not a clinical calculator.
              </p>
            </div>
          </div>
        </div>

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            📖 Data Sources & Validation
          </summary>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--pico-code-background-color)', borderRadius: 'var(--pico-border-radius)' }}>
            <h4>Primary Data Sources</h4>
            <ul style={{ fontSize: '0.9rem' }}>
              <li>
                <strong>Strom JB, et al.</strong> Reference Values for Indexed Echocardiographic Chamber Sizes 
                in Older Adults: The Multi-Ethnic Study of Atherosclerosis. 
                <em>J Am Heart Assoc.</em> 2024;13:e034029.
              </li>
              <li>
                <strong>Dewey FE, et al.</strong> Does size matter? Clinical applications of scaling cardiac 
                size and function for body size. <em>Circulation.</em> 2008;117:2279-2287.
              </li>
            </ul>
            
            <h4>Validation Approach</h4>
            <p style={{ fontSize: '0.9rem' }}>
              All coefficients are back-calculated from published reference data using the canonical 
              reference populations (178cm♂, 164cm♀, BMI 24) with selected BSA/LBM formulas. 
              Results are validated against published literature values where available.
            </p>
          </div>
        </details>
      </section>
    </div>
  );
};

export default Welcome;