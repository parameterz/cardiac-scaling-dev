// src/App.tsx
import React, { useState } from "react";

// Import your cardiac scaling component
import RatiometricVsBiological from "./components/cardiacScaling/RatiometricVsBiological";

function App() {
  const [activeTab, setActiveTab] = useState<"intro" | "scaling">("intro");

  return (
    <div>
      {/* Header with navigation */}
      <header className="container">
        <hgroup>
          <h1>🫀 Cardiac Scaling Analysis Laboratory</h1>
          <p>
            Interactive tools for exploring universal biological scaling
            relationships
          </p>
        </hgroup>

        {/* Tab Navigation using Pico CSS */}
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "intro" ? "active" : ""}`}
            onClick={() => setActiveTab("intro")}
          >
            Introduction
          </button>
          <button
            className={`tab-button ${activeTab === "scaling" ? "active" : ""}`}
            onClick={() => setActiveTab("scaling")}
          >
            Scaling Comparison
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container">
        {activeTab === "intro" && (
          <section>
            <article>
              <header>
                <h2>🎉 Cardiac Scaling Analysis</h2>
              </header>

              <p>
                This laboratory provides interactive tools for exploring the
                transition from traditional ratiometric scaling to universal
                biological relationships in cardiac measurements.
              </p>

              <h3>What You'll Discover</h3>
              <ul>
                <li>
                  <strong>Ratiometric vs. Allometric Scaling:</strong> Compare
                  traditional BSA indexing with lean body mass (LBM) based
                  universal scaling laws
                </li>
                <li>
                  <strong>Universal Coefficients:</strong> See how male and
                  female scaling coefficients converge when proper biological
                  variables are used
                </li>
                <li>
                  <strong>Formula Transparency:</strong> Complete step-by-step
                  calculations using the "Dewey methodology" for coefficient
                  derivation
                </li>
                <li>
                  <strong>Clinical Relevance:</strong> Based on the Multi-Ethnic
                  Study of Atherosclerosis (MESA) reference data
                </li>
              </ul>

              <h3>Scientific Foundation</h3>
              <blockquote>
                <p>
                "[A] theoretical argument against indiscriminate use of
                ratiometric approaches in cardiovascular scaling is drawn from
                the theory of similarity, which states that relative geometries
                determine in part the relationships between body size variables.
                For instance, the LV mass index, which scales a 3-dimensional
                variable (LV mass) to a 2-dimensional variable (BSA) via simple
                division, is incompatible with the geometric relationship
                between the 2 variables. Because ventricular mass is related to
                the major dimension (ie, radius, ventricular wall thickness, and
                internal dimensions) raised to the third power, and BSA is
                related to the body major dimension raised to the second power,
                LV mass should be proportional to [BSA]<sup>3/2</sup>."
                </p>
              
                <footer>
                  <cite>— Dewey et al., Circulation. 2008;117:2279-2287.</cite>
                </footer>
              </blockquote>

              <div className="insight-success">
                <h4>🔬 Ready to Explore?</h4>
                <p>
                  Click <strong>"Scaling Comparison"</strong> above to start
                  with our main visualization tool. You'll see how different
                  scaling approaches affect the apparent differences between
                  male and female cardiac measurements.
                </p>
              </div>

              <details>
                <summary>Technical Details</summary>
                <div>
                  <h4>Data Source</h4>
                  <p>
                    All measurements are derived from the Multi-Ethnic Study of
                    Atherosclerosis (MESA), providing normal reference limits
                    for echocardiographic parameters across diverse populations.
                  </p>

                  <h4>Methodology</h4>
                  <p>
                    We implement the Dewey methodology for coefficient
                    derivation, which back-calculates absolute measurement
                    values from published indexed references, then derives
                    universal LBM coefficients that work across sexes.
                  </p>

                  <h4>Formulas Available</h4>
                  <dl>
                    <dt>BSA Calculations:</dt>
                    <dd>
                      Du Bois (1916), Mosteller (1987), Haycock (1978), and more
                    </dd>
                    <dt>LBM Calculations:</dt>
                    <dd>Boer (1984), Hume (1971), Yu (2013), Lee (2017)</dd>
                  </dl>
                </div>
              </details>
            </article>
          </section>
        )}

        {activeTab === "scaling" && (
          <section>
            <RatiometricVsBiological />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="container">
        <hr />
        <small>
          Cardiac Scaling Analysis Laboratory • Built with React, Vite, and Pico
          CSS • Data from MESA Study (Strom et al. 2024)
        </small>
      </footer>
    </div>
  );
}

export default App;
