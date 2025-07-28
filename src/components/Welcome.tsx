// src/components/Welcome.tsx

import React from 'react';

interface WelcomeProps {
  onNavigate?: (tab: 'welcome' | 'linear' | 'area' | 'mass_volume' | 'methodology') => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <div>
      {/* Hero Quote */}
      <section className="transparency-panel" style={{ textAlign: 'center', padding: '2rem' }}>
        <blockquote style={{ fontSize: '1.25rem', fontStyle: 'italic', margin: '0 0 1rem 0' }}>
          "Reliance on parameters ratiometrically scaled to BSA for clinical decision making should be discouraged."
        </blockquote>
        <footer>
          <cite style={{ fontSize: '1rem', color: 'var(--pico-muted-color)' }}>
            — Dewey et al., Circulation (2008)
          </cite>
        </footer>
      </section>

      {/* Purpose */}
      <section className="insight-info">
        <p style={{ fontSize: '1.1rem', textAlign: 'center' }}>
          This site uses comprehensive cardiac measurement data published by <strong>Strom et al.</strong> as a vehicle 
          to explore the scaling theory and strategies described by <strong>Dewey et al.</strong> and <strong>Gutgesell & Rembold</strong>.
        </p>
      </section>

      {/* Quick Theory Explanation */}
      <section className="transparency-panel">
        <header>
          <h3>🔬 The Core Concept</h3>
        </header>
        
        <div className="metrics-grid">
          <article className="insight-warning">
            <h4>❌ The Problem</h4>
            <p>
              Current practice uses <strong>BSA ratiometric scaling for ALL measurements</strong>, 
              but this is only geometrically correct for area measurements.
            </p>
          </article>

          <article className="insight-success">
            <h4>✅ The Solution</h4>
            <p>
              Different measurement types need different scaling approaches based on their 
              <strong>geometric dimensionality</strong> (1D, 2D, or 3D).
            </p>
          </article>
        </div>

        <div className="chart-container">
          <table>
            <thead>
              <tr>
                <th>Measurement Type</th>
                <th>Current Practice</th>
                <th>Geometric Theory</th>
                <th>Problem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Linear (1D)</strong><br/>Wall thickness, diameters</td>
                <td>÷ BSA (2D)</td>
                <td>Height^1.0 or BSA^0.5</td>
                <td>Overcorrection</td>
              </tr>
              <tr style={{ backgroundColor: 'var(--pico-ins-color)', opacity: 0.1 }}>
                <td><strong>Area (2D)</strong><br/>Chamber areas, valve areas</td>
                <td>÷ BSA (2D)</td>
                <td>BSA^1.0</td>
                <td><span style={{ color: 'var(--cardiac-success)' }}>None - this works!</span></td>
              </tr>
              <tr>
                <td><strong>Mass/Volume (3D)</strong><br/>Heart mass, chamber volumes</td>
                <td>÷ BSA (2D)</td>
                <td>LBM^1.0 or BSA^1.5</td>
                <td>Undercorrection</td>
              </tr>
            </tbody>
          </table>
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

      {/* Citations */}
      <section>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            📚 Key References
          </summary>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--pico-code-background-color)', borderRadius: 'var(--pico-border-radius)' }}>
            <h4>Primary Data Source</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Strom JB, Zhao Y, Farrell A, et al.</strong> Reference Values for Indexed Echocardiographic 
              Chamber Sizes in Older Adults: The Multi-Ethnic Study of Atherosclerosis. 
              <em>J Am Heart Assoc.</em> 2024;13:e034029. 
              <a href="https://doi.org/10.1161/JAHA.124.034029" target="_blank" rel="noopener noreferrer">
                doi:10.1161/JAHA.124.034029
              </a>
            </p>

            <h4>Scaling Theory</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Dewey FE, Rosenthal D, Murphy DJ Jr, Froelicher VF, Ashley EA.</strong> Does size matter? 
              Clinical applications of scaling cardiac size and function for body size. 
              <em>Circulation.</em> 2008;117:2279-2287. 
              <a href="https://doi.org/10.1161/CIRCULATIONAHA.107.736785" target="_blank" rel="noopener noreferrer">
                doi:10.1161/CIRCULATIONAHA.107.736785
              </a>
            </p>

            <p style={{ fontSize: '0.9rem' }}>
              <strong>Gutgesell HP, Rembold CM.</strong> Growth of the human heart relative to body surface area. 
              <em>Am J Cardiol.</em> 1990;65:662-668. 
              <a href="https://doi.org/10.1016/0002-9149(90)91048-B" target="_blank" rel="noopener noreferrer">
                doi:10.1016/0002-9149(90)91048-B
              </a>
            </p>
          </div>
        </details>
      </section>

      {/* Important Disclaimers - Brief */}
      <section className="insight-danger">
        <h3>⚠️ Educational Use Only</h3>
        <p>
          This tool is for <strong>educational exploration</strong> of scaling principles. 
          All data is derivative from published literature. <strong>Not for clinical use</strong> 
          or patient care decisions.
        </p>
      </section>
    </div>
  );
};

export default Welcome;

const Introduction: React.FC = () => {
  return (
    <div>
      {/* Hero Quote */}
      <section className="transparency-panel" style={{ textAlign: 'center', padding: '2rem' }}>
        <blockquote style={{ fontSize: '1.25rem', fontStyle: 'italic', margin: '0 0 1rem 0' }}>
          "Reliance on parameters ratiometrically scaled to BSA for clinical decision making should be discouraged."
        </blockquote>
        <footer>
          <cite style={{ fontSize: '1rem', color: 'var(--pico-muted-color)' }}>
            — Dewey et al., Circulation (2008)
          </cite>
        </footer>
      </section>

      {/* Purpose */}
      <section className="insight-info">
        <p style={{ fontSize: '1.1rem', textAlign: 'center' }}>
          This site uses comprehensive cardiac measurement data published by <strong>Strom et al.</strong> as a vehicle 
          to explore the scaling theory and strategies described by <strong>Dewey et al.</strong> and <strong>Gutgesell & Rembold</strong>.
        </p>
      </section>

      {/* Quick Theory Explanation */}
      <section className="transparency-panel">
        <header>
          <h3>🔬 The Core Concept</h3>
        </header>
        
        <div className="metrics-grid">
          <article className="insight-warning">
            <h4>❌ The Problem</h4>
            <p>
              Current practice uses <strong>BSA ratiometric scaling for ALL measurements</strong>, 
              but this is only geometrically correct for area measurements.
            </p>
          </article>

          <article className="insight-success">
            <h4>✅ The Solution</h4>
            <p>
              Different measurement types need different scaling approaches based on their 
              <strong>geometric dimensionality</strong> (1D, 2D, or 3D).
            </p>
          </article>
        </div>

        <div className="chart-container">
          <table>
            <thead>
              <tr>
                <th>Measurement Type</th>
                <th>Current Practice</th>
                <th>Geometric Theory</th>
                <th>Problem</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Linear (1D)</strong><br/>Wall thickness, diameters</td>
                <td>÷ BSA (2D)</td>
                <td>Height^1.0 or BSA^0.5</td>
                <td>Overcorrection</td>
              </tr>
              <tr style={{ backgroundColor: 'var(--pico-ins-color)', opacity: 0.1 }}>
                <td><strong>Area (2D)</strong><br/>Chamber areas, valve areas</td>
                <td>÷ BSA (2D)</td>
                <td>BSA^1.0</td>
                <td><span style={{ color: 'var(--cardiac-success)' }}>None - this works!</span></td>
              </tr>
              <tr>
                <td><strong>Mass/Volume (3D)</strong><br/>Heart mass, chamber volumes</td>
                <td>÷ BSA (2D)</td>
                <td>LBM^1.0 or BSA^1.5</td>
                <td>Undercorrection</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Citations */}
      <section>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            📚 Key References
          </summary>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--pico-code-background-color)', borderRadius: 'var(--pico-border-radius)' }}>
            <h4>Primary Data Source</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Strom JB, Zhao Y, Farrell A, et al.</strong> Reference Values for Indexed Echocardiographic 
              Chamber Sizes in Older Adults: The Multi-Ethnic Study of Atherosclerosis. 
              <em>J Am Heart Assoc.</em> 2024;13:e034029. 
              <a href="https://doi.org/10.1161/JAHA.124.034029" target="_blank" rel="noopener noreferrer">
                doi:10.1161/JAHA.124.034029
              </a>
            </p>

            <h4>Scaling Theory</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Dewey FE, Rosenthal D, Murphy DJ Jr, Froelicher VF, Ashley EA.</strong> Does size matter? 
              Clinical applications of scaling cardiac size and function for body size. 
              <em>Circulation.</em> 2008;117:2279-2287. 
              <a href="https://doi.org/10.1161/CIRCULATIONAHA.107.736785" target="_blank" rel="noopener noreferrer">
                doi:10.1161/CIRCULATIONAHA.107.736785
              </a>
            </p>

            <p style={{ fontSize: '0.9rem' }}>
              <strong>Gutgesell HP, Rembold CM.</strong> Growth of the human heart relative to body surface area. 
              <em>Am J Cardiol.</em> 1990;65:662-668. 
              <a href="https://doi.org/10.1016/0002-9149(90)91048-B" target="_blank" rel="noopener noreferrer">
                doi:10.1016/0002-9149(90)91048-B
              </a>
            </p>
          </div>
        </details>
      </section>

      {/* Important Disclaimers - Brief */}
      <section className="insight-danger">
        <h3>⚠️ Educational Use Only</h3>
        <p>
          This tool is for <strong>educational exploration</strong> of scaling principles. 
          All data is derivative from published literature. <strong>Not for clinical use</strong> 
          or patient care decisions.
        </p>
      </section>
    </div>
  );
};

export default Introduction;