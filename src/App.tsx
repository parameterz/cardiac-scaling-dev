// src/App.tsx
import React, { useState } from "react";

// Import components
import Welcome from "./components/Welcome";
import Introduction from "./components/Introduction"; // Now becomes "Methodology"
import FourWayScalingComparison from "./components/cardiacScaling/FourWayScalingComparison";
import { getMeasurementsByType } from "./data/stromData";

function App() {
  const [activeTab, setActiveTab] = useState<"welcome" | "linear" | "area" | "mass_volume" | "methodology">("welcome");

  // Get measurements for each category
  const linearMeasurements = getMeasurementsByType('linear');
  const areaMeasurements = getMeasurementsByType('area');
  const massMeasurements = getMeasurementsByType('mass');
  const volumeMeasurements = getMeasurementsByType('volume');
  const massVolumeMeasurements = [...massMeasurements, ...volumeMeasurements];

  // Handle navigation from Welcome buttons
  const navigateToTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      {/* Header with navigation */}
      <header className="container">
        <hgroup>
          <h1>🫀 Cardiac Scaling Analysis Laboratory</h1>
          <p>
            Interactive exploration of geometric scaling principles in cardiac measurements
          </p>
        </hgroup>

        {/* Tab Navigation using Pico CSS */}
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "welcome" ? "active" : ""}`}
            onClick={() => setActiveTab("welcome")}
          >
            🚀 Getting Started
          </button>
          <button
            className={`tab-button ${activeTab === "linear" ? "active" : ""}`}
            onClick={() => setActiveTab("linear")}
          >
            📐 Linear ({linearMeasurements.length})
          </button>
          <button
            className={`tab-button ${activeTab === "area" ? "active" : ""}`}
            onClick={() => setActiveTab("area")}
          >
            📊 Area ({areaMeasurements.length})
          </button>
          <button
            className={`tab-button ${activeTab === "mass_volume" ? "active" : ""}`}
            onClick={() => setActiveTab("mass_volume")}
          >
            📦 Mass & Volume ({massVolumeMeasurements.length})
          </button>
          <button
            className={`tab-button ${activeTab === "methodology" ? "active" : ""}`}
            onClick={() => setActiveTab("methodology")}
          >
            🔬 Methodology
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container">
        {activeTab === "welcome" && (
          <Welcome onNavigate={setActiveTab} />
        )}
        
        {activeTab === "linear" && (
          <section>
            <header>
              <hgroup>
                <h2>📐 Linear Measurements (1D)</h2>
                <p>
                  Dimensions, diameters, and thicknesses that scale with body size^(1/3). 
                  Expected relationships: LBM^0.33, BSA^0.5, Height^1.0
                </p>
              </hgroup>
            </header>
            
            <div className="insight-danger">
              <h3>🚨 The Ratiometric Problem is Most Visible Here</h3>
              <p>
                Traditional BSA indexing (BSA^1.0) dramatically overcorrects linear measurements. 
                A 2-meter tall athlete appears to have thinner walls than a petite person, 
                even when their absolute measurements are larger!
              </p>
              <p>
                <strong>Geometric theory predicts BSA^0.5 = √BSA for proper linear scaling.</strong>
              </p>
            </div>

            <FourWayScalingComparison 
              availableMeasurements={linearMeasurements}
              initialMeasurement="lvdd"
              categoryContext={{
                categoryName: "Linear Measurements",
                expectedApproaches: 4,
                scalingInfo: "Expected: LBM^0.33, BSA^0.5, Height^1.0"
              }}
            />
            
            <div className="transparency-panel">
              <h3>💡 Key Insights for Linear Measurements</h3>
              <ul>
                <li><strong>Biggest scaling differences:</strong> Linear measurements show the most dramatic differences between approaches</li>
                <li><strong>Clinical impact:</strong> Ratiometric BSA indexing can misclassify wall thickness in large vs small patients</li>
                <li><strong>LBM advantage:</strong> Universal biological scaling (LBM^0.33) works regardless of body composition</li>
                <li><strong>Height scaling:</strong> Direct Height^1.0 relationship makes intuitive sense for dimensions</li>
              </ul>
            </div>
          </section>
        )}
        
        {activeTab === "area" && (
          <section>
            <header>
              <hgroup>
                <h2>📊 Area Measurements (2D)</h2>
                <p>
                  Chamber areas and valve areas that scale with body size^(2/3). 
                  Expected relationships: LBM^0.67, BSA^1.0, Height^2.0
                </p>
              </hgroup>
            </header>
            
            <div className="insight-success">
              <h3>🎯 Traditional Indexing Gets This One Right!</h3>
              <p>
                Area measurements are the <strong>only</strong> cardiac parameters where ratiometric BSA indexing 
                aligns perfectly with geometric theory. BSA^1.0 = BSA^1.0 - they're identical!
              </p>
              <p>
                <strong>This is why area measurements show the smallest differences between scaling approaches.</strong>
              </p>
            </div>

            <FourWayScalingComparison 
              availableMeasurements={areaMeasurements}
              initialMeasurement="raesa"
              categoryContext={{
                categoryName: "Area Measurements",
                expectedApproaches: 5,
                scalingInfo: "Expected: LBM^0.67, BSA^1.0 (=Ratiometric), Height^2.0"
              }}
            />
            
            <div className="transparency-panel">
              <h3>💡 Key Insights for Area Measurements</h3>
              <ul>
                <li><strong>Geometric validation:</strong> Ratiometric BSA = Allometric BSA^1.0 for areas</li>
                <li><strong>Smallest differences:</strong> Less dramatic scaling differences since traditional method is correct</li>
                <li><strong>Height^2.0:</strong> Theoretical geometric scaling for 2D measurements</li>
                <li><strong>Clinical confidence:</strong> Current BSA indexing practice is geometrically sound for areas</li>
              </ul>
            </div>
          </section>
        )}
        
        {activeTab === "mass_volume" && (
          <section>
            <header>
              <hgroup>
                <h2>📦 Mass & Volume Measurements (3D)</h2>
                <p>
                  Tissue masses and chamber volumes that scale with body size^1.0. 
                  Expected relationships: LBM^1.0, BSA^1.5, Height^1.6-3.0
                </p>
              </hgroup>
            </header>
            
            <div className="insight-warning">
              <h3>🤔 The Height Exponent Mystery</h3>
              <p>
                Pure geometric theory predicts <strong>Height^3.0</strong> for 3D measurements, 
                but real cardiac data consistently shows exponents between <strong>1.6-2.7</strong>.
              </p>
              <p>
                <strong>Question:</strong> Do hearts scale with perfect geometric similarity, 
                or does biology break the rules of physics?
              </p>
            </div>

            <FourWayScalingComparison 
              availableMeasurements={massVolumeMeasurements}
              initialMeasurement="lvm"
              categoryContext={{
                categoryName: "Mass & Volume Measurements",
                expectedApproaches: 6,
                scalingInfo: "Expected: LBM^1.0, BSA^1.5, Height^1.6-3.0"
              }}
            />
            
            <div className="transparency-panel">
              <h3>💡 Key Insights for Mass & Volume</h3>
              <ul>
                <li><strong>Height mystery:</strong> Empirical Height^1.6-2.7 vs theoretical Height^3.0</li>
                <li><strong>LBM scaling:</strong> Direct LBM^1.0 relationship for tissue masses makes biological sense</li>
                <li><strong>BSA^1.5 theory:</strong> Geometric prediction for 3D from 2D scaling</li>
                <li><strong>Clinical significance:</strong> Height exponent choice dramatically affects body size corrections</li>
                <li><strong>Sex differences:</strong> Most pronounced with traditional ratiometric scaling</li>
              </ul>
            </div>
          </section>
        )}

        {activeTab === "methodology" && (
          <section>
            <header>
              <hgroup>
                <h2>🔬 Methodology & Theory</h2>
                <p>
                  Deep dive into the mathematical foundations, Dewey methodology, 
                  and geometric scaling principles underlying this analysis.
                </p>
              </hgroup>
            </header>
            
            <Introduction />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="container">
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <small>
            Cardiac Scaling Analysis Laboratory • Educational exploration of geometric scaling principles
          </small>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            Data: <a href="https://doi.org/10.1161/JAHA.123.034029" target="_blank" rel="noopener noreferrer">
              Strom et al. (2024) MESA Study
            </a>
          </small>
        </div>
        
        {/* Version info */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            Educational Tool v0.1.2 • Not for clinical use • 
            <a href="https://doi.org/10.1161/circulationaha.107.736785" target="_blank" rel="noopener noreferrer">
              Dewey et al. methodology
            </a>
          </small>
        </div>
      </footer>
    </div>
  );
}

export default App;