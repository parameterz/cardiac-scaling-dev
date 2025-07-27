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
                  Dimensions, diameters, and thicknesses that scale with these expected relationships: LBM^0.33, BSA^0.5, Height^1.0
                </p>
              </hgroup>
            </header>
            

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
                  Chamber areas and valve areas that scale with these expected relationships: LBM^0.67, BSA^1.0, Height^2.0
                </p>
              </hgroup>
            </header>
            

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
                  Tissue masses and chamber volumes that scale with these expected relationships: LBM^1.0, BSA^1.5, Height^1.6-3.0
                </p>
              </hgroup>
            </header>
            

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
        </div>
        
        {/* Version info */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            Educational Tool v0.1.2 • Not for clinical use • 
          </small>
        </div>
      </footer>
    </div>
  );
}

export default App;