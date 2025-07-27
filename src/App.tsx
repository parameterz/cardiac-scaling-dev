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
            Interactive exploration of geometric scaling principles in cardiac measurements
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
            📐 Linear Measurements ({linearMeasurements.length})
          </button>
          <button
            className={`tab-button ${activeTab === "area" ? "active" : ""}`}
            onClick={() => setActiveTab("area")}
          >
            📊 Area Measurements ({areaMeasurements.length})
          </button>
          <button
            className={`tab-button ${activeTab === "mass_volume" ? "active" : ""}`}
            onClick={() => setActiveTab("mass_volume")}
          >
            📦 Mass & Volume ({massVolumeMeasurements.length})
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
                  Dimensions, diameters, and thicknesses that scale with body size^(1/3). 
                  Expected relationships: LBM^0.33, BSA^0.5, Height^1.0
                </p>
              </hgroup>
            </header>
            
            <div className="insight-info">
              <h3>Key Insight: Ratiometric BSA Overcorrection</h3>
              <p>
                Traditional BSA indexing (BSA^1.0) overcorrects linear measurements, making large patients 
                appear to have smaller hearts. Geometric theory predicts BSA^0.5 = √BSA for proper scaling.
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
              <h3>Key Insight: BSA Indexing Is Geometrically Correct!</h3>
              <p>
                Area measurements are the only cardiac parameters where traditional ratiometric BSA indexing 
                (BSA^1.0) aligns with geometric theory. This is why you'll see less dramatic differences 
                between scaling approaches for areas.
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
              <h3>Key Insight: The Height Exponent Mystery</h3>
              <p>
                Pure geometric theory predicts Height^3.0 for 3D measurements, but empirical studies 
                consistently find exponents between 1.6-2.7. This suggests cardiac scaling doesn't 
                follow perfect geometric similarity - biology is more complex than pure physics!
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
      </footer>
    </div>
  );
}

export default App;