// src/App.tsx
import React, { useState } from "react";

// Import components
import Introduction from "./components/Introduction";
import FourWayScalingComparison from "./components/cardiacScaling/FourWayScalingComparison";
import { getMeasurementsByType } from "./data/stromData";

function App() {
  const [activeTab, setActiveTab] = useState<"intro" | "linear" | "area" | "mass_volume">("intro");

  // Get measurements for each category
  const linearMeasurements = getMeasurementsByType('linear');
  const areaMeasurements = getMeasurementsByType('area');
  const massMeasurements = getMeasurementsByType('mass');
  const volumeMeasurements = getMeasurementsByType('volume');
  const massVolumeMeasurements = [...massMeasurements, ...volumeMeasurements];

  return (
    <div>
      {/* Header with navigation */}
      <header className="container">
        <hgroup>
          <h1>🫀 Cardiac Scaling Analysis Laboratory</h1>
          <p>
            Interactive exploration of geometric scaling principles: when ratiometric scaling is appropriate 
            and when allometric transformation is needed
          </p>
        </hgroup>

        {/* Tab Navigation using Pico CSS */}
        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "intro" ? "active" : ""}`}
            onClick={() => setActiveTab("intro")}
          >
            📚 Theory & Methodology
          </button>
          <button
            className={`tab-button ${activeTab === "linear" ? "active" : ""}`}
            onClick={() => setActiveTab("linear")}
          >
            📐 Linear (1D) ({linearMeasurements.length})
          </button>
          <button
            className={`tab-button ${activeTab === "area" ? "active" : ""}`}
            onClick={() => setActiveTab("area")}
          >
            📊 Area (2D) ({areaMeasurements.length})
          </button>
          <button
            className={`tab-button ${activeTab === "mass_volume" ? "active" : ""}`}
            onClick={() => setActiveTab("mass_volume")}
          >
            📦 Mass & Volume (3D) ({massVolumeMeasurements.length})
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container">
        {activeTab === "intro" && <Introduction />}
        
        {activeTab === "linear" && (
          <section>
            <header>
              <hgroup>
                <h2>📐 Linear Measurements (1D)</h2>
                <p>
                  Dimensions, diameters, and thicknesses. <strong>Height ratiometric scaling</strong> is 
                  geometrically appropriate (both 1D). Allometric alternatives: LBM^0.33, BSA^0.5
                </p>
              </hgroup>
            </header>
            
            <div className="insight-warning">
              <h3>The Linear Measurement Problem</h3>
              <p>
                Current clinical practice uses <strong>BSA ratiometric scaling</strong> (BSA^1.0) for linear 
                measurements, but this mixes dimensional spaces: 1D measurement ÷ 2D variable. 
                Geometrically appropriate options include:
              </p>
              <ul>
                <li><strong>Height ratiometric</strong> (Height^1.0) - matches 1D dimensionality</li>
                <li><strong>BSA allometric</strong> (BSA^0.5 = √BSA) - transforms 2D → 1D</li>
                <li><strong>LBM allometric</strong> (LBM^0.33 = ∛LBM) - transforms 3D → 1D</li>
              </ul>
            </div>

            <FourWayScalingComparison 
              availableMeasurements={linearMeasurements}
              initialMeasurement="lvdd"
              categoryContext={{
                categoryName: "Linear Measurements (1D)",
                expectedApproaches: 4,
                scalingInfo: "Geometrically appropriate: Height^1.0 (ratiometric). Allometric alternatives: LBM^0.33, BSA^0.5"
              }}
            />
          </section>
        )}
        
        {activeTab === "area" && (
          <section>
            <header>
              <hgroup>
                <h2>📊 Area Measurements (2D)</h2>
                <p>
                  Chamber areas and valve areas. <strong>BSA ratiometric scaling</strong> is geometrically 
                  correct (both 2D)! Allometric alternatives: LBM^0.67, Height^2.0
                </p>
              </hgroup>
            </header>
            
            <div className="insight-success">
              <h3>🎯 Current Clinical Practice Gets This Right!</h3>
              <p>
                Area measurements are the only cardiac parameters where traditional <strong>BSA ratiometric 
                indexing</strong> (BSA^1.0) aligns perfectly with geometric theory. BSA is literally surface 
                area, so dividing area measurements by BSA makes geometric sense.
              </p>
              <ul>
                <li><strong>BSA ratiometric</strong> (BSA^1.0) - both measurement and scaling variable are 2D ✓</li>
                <li><strong>Height allometric</strong> (Height^2.0) - transforms 1D → 2D geometric scaling</li>
                <li><strong>LBM allometric</strong> (LBM^0.67) - transforms 3D → 2D biological scaling</li>
              </ul>
              <p>
                <strong>Prediction:</strong> You should see less dramatic differences between scaling approaches 
                for area measurements because current practice is already geometrically appropriate.
              </p>
            </div>

            <FourWayScalingComparison 
              availableMeasurements={areaMeasurements}
              initialMeasurement="raesa"
              categoryContext={{
                categoryName: "Area Measurements (2D)",
                expectedApproaches: 5,
                scalingInfo: "Geometrically correct: BSA^1.0 (ratiometric = current practice). Alternatives: LBM^0.67, Height^2.0"
              }}
            />
          </section>
        )}
        
        {activeTab === "mass_volume" && (
          <section>
            <header>
              <hgroup>
                <h2>📦 Mass & Volume Measurements (3D)</h2>
                <p>
                  Tissue masses and chamber volumes. <strong>LBM ratiometric scaling</strong> is geometrically 
                  appropriate (both 3D). Allometric alternatives: BSA^1.5, Height^3.0 (theoretical geometric), plus empirical Height^1.6, Height^2.7
                </p>
              </hgroup>
            </header>
            
            <div className="insight-info">
              <h3>The Mass/Volume Scaling Challenge</h3>
              <p>
                Current clinical practice uses <strong>BSA ratiometric scaling</strong> for mass/volume measurements, 
                mixing 3D measurements with 2D scaling variables. Geometrically appropriate alternatives:
              </p>
              <ul>
                <li><strong>LBM ratiometric</strong> (LBM^1.0) - both are 3D/mass-based ✓</li>
                <li><strong>BSA allometric</strong> (BSA^1.5) - transforms 2D → 3D geometric scaling</li>
                <li><strong>Height allometric</strong> (Height^1.6-2.7) - empirical scaling (deviates from Height^3.0 geometric prediction)</li>
              </ul>
            </div>
            
            <div className="insight-warning">
              <h3>🔬 The Height Exponent Mystery</h3>
              <p>
                Pure geometric theory predicts <strong>Height^3.0</strong> for 3D measurements, but empirical 
                studies consistently find exponents between <strong>1.6-2.7</strong>. This suggests cardiac 
                scaling doesn't follow perfect geometric similarity.
              </p>
              <div className="metrics-grid">
                <div>
                  <h4>Theoretical Prediction</h4>
                  <p>Height^3.0 (perfect geometric scaling)</p>
                </div>
                <div>
                  <h4>Empirical Reality</h4>
                  <p>Height^1.6-2.7 (biological scaling deviates from pure geometry)</p>
                </div>
              </div>
              <p>
                <strong>Insight:</strong> Biology is more complex than pure physics! Cardiac adaptation, 
                fitness, body composition, and other factors create deviations from perfect geometric similarity.
              </p>
            </div>

            <FourWayScalingComparison 
              availableMeasurements={massVolumeMeasurements}
              initialMeasurement="lvm"
              categoryContext={{
                categoryName: "Mass & Volume Measurements (3D)",
                expectedApproaches: 6,
                scalingInfo: "Geometrically appropriate: LBM^1.0 (ratiometric). Alternatives: BSA^1.5, Height^3.0 (theoretical geometric), empirical Height^1.6, Height^2.7"
              }}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="container">
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <small>
            Cardiac Scaling Analysis Laboratory • Educational exploration of when ratiometric scaling 
            is appropriate vs. when allometric transformation is needed
          </small>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            Data: <a href="https://doi.org/10.1161/JAHA.123.034029" target="_blank" rel="noopener noreferrer">
              Strom et al. (2024) MESA Study
            </a>
          </small>
        </div>
      </footer>
    </div>
  );
}

export default App;