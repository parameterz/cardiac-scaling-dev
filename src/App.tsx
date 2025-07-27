// src/App.tsx
import React, { useState } from "react";

// Import components
import Introduction from "./components/Introduction";
import RatiometricVsBiological from "./components/cardiacScaling/RatiometricVsBiological";
import MeasurementTypeExplorer from "./components/cardiacScaling/MeasurementTypeExplorer";

function App() {
  const [activeTab, setActiveTab] = useState<"intro" | "scaling" | "comprehensive">("intro");

  return (
    <div>
      {/* Header with navigation */}
      <header className="container">
        <hgroup>
          <h1>🫀 Cardiac Scaling Analysis Laboratory</h1>
          <p>
            Interactive exploration of ratiometric vs. allometric scaling relationships 
            in cardiac measurements
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
            className={`tab-button ${activeTab === "scaling" ? "active" : ""}`}
            onClick={() => setActiveTab("scaling")}
          >
            📊 2-Way Comparison
          </button>
          <button
            className={`tab-button ${activeTab === "comprehensive" ? "active" : ""}`}
            onClick={() => setActiveTab("comprehensive")}
          >
            🔬 Comprehensive Analysis
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container">
        {activeTab === "intro" && <Introduction />}
        {activeTab === "scaling" && <RatiometricVsBiological />}
        {activeTab === "comprehensive" && <MeasurementTypeExplorer />}
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