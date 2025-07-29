// src/App.tsx
import React, { useState } from "react";

// Import components
import Navigation, { type NavigationTab } from "./components/Navigation";
import Intro from "./components/Intro";
import Methods from "./components/Methods";
import FourWayScalingComparison from "./components/cardiacScaling/FourWayScalingComparison";
import LVMassComponentAnalysis from "./components/cardiacScaling/LVMassComponentAnalysis"; // NEW IMPORT
import { getMeasurementsByType } from "./data/stromData";

function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("intro");

  // Get measurements for each category
  const linearMeasurements = getMeasurementsByType('linear');
  const areaMeasurements = getMeasurementsByType('area');
  const massMeasurements = getMeasurementsByType('mass');
  const volumeMeasurements = getMeasurementsByType('volume');
  const massVolumeMeasurements = [...massMeasurements, ...volumeMeasurements];

  return (
    <div>
      {/* Professional Header with Navigation */}
      <header className="container">
        <hgroup>
          <h1>Cardiac Scaling Analysis Laboratory</h1>
        </hgroup>

        <Navigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          measurementCounts={{
            linear: linearMeasurements.length,
            area: areaMeasurements.length,
            massVolume: massVolumeMeasurements.length
          }}
        />
      </header>

      {/* Main Content */}
      <main className="container">
        {activeTab === "intro" && (
          <Intro onNavigate={setActiveTab} />
        )}
        
        {activeTab === "linear" && (
          <section>
            <header>
              <hgroup>
                <h2>Linear Measurements</h2>
                <p>
                  One-dimensional cardiac parameters including dimensions, diameters, 
                  and wall thicknesses. Expected scaling relationships: LBM^0.33, BSA^0.5, Height^1.0
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
                <h2>Area Measurements</h2>
                <p>
                  Two-dimensional cardiac parameters including chamber areas and valve areas. 
                  Expected scaling relationships: LBM^0.67, BSA^1.0, Height^2.0
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
                <h2>Mass and Volume Measurements</h2>
                <p>
                  Three-dimensional cardiac parameters including tissue masses and chamber volumes. 
                  Expected scaling relationships: LBM^1.0, BSA^1.5, Height^1.6-3.0
                </p>
              </hgroup>
            </header>

            <FourWayScalingComparison 
              availableMeasurements={massVolumeMeasurements}
              initialMeasurement="lvm"
              categoryContext={{
                categoryName: "Mass and Volume Measurements",
                expectedApproaches: 6,
                scalingInfo: "Expected: LBM^1.0, BSA^1.5, Height^1.6-3.0"
              }}
            />
          </section>
        )}

        {activeTab === "lv_mass_analysis" && (
          <section>
            <LVMassComponentAnalysis />
          </section>
        )}
                {activeTab === "methods" && (
          <section>
            <header>
              <hgroup>
                <h2>Methodology and Theoretical Framework</h2>
                <p>
                  Mathematical foundations, scaling theory principles, and implementation 
                  of the Dewey methodology for cardiovascular parameter normalization.
                </p>
              </hgroup>
            </header>
            
            <Methods />
          </section>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="container">
        <hr />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          fontSize: '0.9rem'
        }}>
          <small>
            Cardiac Scaling Analysis Laboratory
          </small>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            Educational research tool • Not for clinical use
          </small>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <small style={{ color: 'var(--pico-muted-color)', fontSize: '0.85rem' }}>
            v0.1.3 • © 2025 Dan Dyar, MA, ACS, RDCS, FASE •
          </small>
        </div>
      </footer>
    </div>
  );
}

export default App;