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
                  <strong>Height ratiometric scaling</strong> is 
                  geometrically appropriate (both 1D). Allometric alternatives: LBM^0.33, BSA^0.5
                </p>
              </hgroup>
            </header>
            
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
                  <strong>BSA ratiometric scaling</strong> is geometrically 
                  correct (both 2D). Allometric alternatives: LBM^0.67, Height^2.0
                </p>
              </hgroup>
            </header>
            


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
                  <strong>LBM ratiometric scaling</strong> is geometrically 
                  appropriate (both 3D). Allometric alternatives: BSA^1.5, Height^1.6-3.0
                </p>
              </hgroup>
            </header>
            
            <FourWayScalingComparison 
              availableMeasurements={massVolumeMeasurements}
              initialMeasurement="lvm"
              categoryContext={{
                categoryName: "Mass & Volume Measurements (3D)",
                expectedApproaches: 6,
                scalingInfo: "Geometrically appropriate: LBM^1.0 (ratiometric). Alternatives: BSA^1.5, Height^1.6-3.0"
              }}
            />
                        <div className="insight-warning">
              <h3>🔬 The Height Exponent Mystery</h3>
              <p>
                Pure geometric theory predicts <strong>Height^3.0</strong> for 3D measurements, but empirical 
                studies consistently find exponents between <strong>1.6-2.7</strong>. This suggests cardiac 
                scaling doesn't follow perfect geometric similarity.
              </p>

            </div>

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