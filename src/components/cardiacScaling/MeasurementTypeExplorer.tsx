// src/components/cardiacScaling/MeasurementTypeExplorer.tsx

"use client";
import React, { useState } from 'react';
import { 
  getMeasurementsByType, 
  type MeasurementType,
  type EnhancedMeasurementData 
} from '@/data/stromData';
import FourWayScalingComparison from './FourWayScalingComparison';

// =============================================================================
// MEASUREMENT ORGANIZATION
// =============================================================================

interface MeasurementCategory {
  id: MeasurementType | 'mass_volume';
  name: string;
  description: string;
  measurements: EnhancedMeasurementData[];
  defaultMeasurement: string;
  scalingInfo: string;
  expectedApproaches: number;
}

/**
 * Organize measurements by dimensional category
 */
const getMeasurementCategories = (): MeasurementCategory[] => {
  const linearMeasurements = getMeasurementsByType('linear');
  const areaMeasurements = getMeasurementsByType('area');
  const massMeasurements = getMeasurementsByType('mass');
  const volumeMeasurements = getMeasurementsByType('volume');
  
  return [
    {
      id: 'linear',
      name: 'Linear Measurements (1D)',
      description: 'Dimensions, diameters, and thicknesses that scale with body size^(1/3)',
      measurements: linearMeasurements,
      defaultMeasurement: 'lvdd', // LV End-Diastolic Dimension
      scalingInfo: 'Expected: LBM^0.33, BSA^0.5, Height^1.0',
      expectedApproaches: 4
    },
    {
      id: 'area',
      name: 'Area Measurements (2D)', 
      description: 'Chamber areas and valve areas that scale with body size^(2/3)',
      measurements: areaMeasurements,
      defaultMeasurement: 'raesa', // Right Atrial End-Systolic Area
      scalingInfo: 'Expected: LBM^0.67, BSA^1.0 (=Ratiometric), Height^2.0',
      expectedApproaches: 5
    },
    {
      id: 'mass_volume',
      name: 'Mass & Volume Measurements (3D)',
      description: 'Tissue masses and chamber volumes that scale with body size^1.0',
      measurements: [...massMeasurements, ...volumeMeasurements],
      defaultMeasurement: 'lvm', // LV Mass
      scalingInfo: 'Expected: LBM^1.0, BSA^1.5, Height^1.6-3.0',
      expectedApproaches: 6
    }
  ];
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const MeasurementTypeExplorer: React.FC = () => {
  const categories = getMeasurementCategories();
  const [activeCategory, setActiveCategory] = useState<string>('linear');
  
  // Get current category
  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];
  
  // Get initial measurement for the category (handle category switching)
  const [selectedMeasurements, setSelectedMeasurements] = useState<Record<string, string>>({
    linear: 'lvdd',
    area: 'raesa', 
    mass_volume: 'lvm'
  });

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleMeasurementChange = (measurementId: string) => {
    setSelectedMeasurements(prev => ({
      ...prev,
      [activeCategory]: measurementId
    }));
  };

  const currentMeasurementId = selectedMeasurements[activeCategory] || currentCategory.defaultMeasurement;

  return (
    <div className="container">
      {/* Header */}
      <header>
        <hgroup>
          <h2>🔬 Comprehensive Scaling Analysis</h2>
          <p>
            Explore all scaling approaches organized by measurement dimensionality. 
            Each category reveals different aspects of cardiac scaling relationships.
          </p>
        </hgroup>
      </header>

      {/* Category Tabs */}
      <section>
        <nav className="tab-navigation">
          {categories.map(category => (
            <button
              key={category.id}
              className={`tab-button ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name} ({category.measurements.length})
            </button>
          ))}
        </nav>

        {/* Category Information */}
        <div className="insight-info" style={{ marginTop: '1rem' }}>
          <h3>{currentCategory.name}</h3>
          <p>{currentCategory.description}</p>
          <div className="metrics-grid">
            <div>
              <h4>Scaling Expectations</h4>
              <p>{currentCategory.scalingInfo}</p>
            </div>
            <div>
              <h4>Analysis Depth</h4>
              <p>{currentCategory.expectedApproaches} scaling approaches available</p>
            </div>
          </div>
        </div>

        {/* Quick Category Overview */}
        <details style={{ marginTop: '1rem' }}>
          <summary>📊 Available Measurements in {currentCategory.name}</summary>
          <div className="metrics-grid" style={{ marginTop: '1rem' }}>
            {currentCategory.measurements.map(measurement => (
              <div key={measurement.id} className="metric-card">
                <h5>{measurement.name}</h5>
                <p><strong>Unit:</strong> {measurement.absoluteUnit}</p>
                <p><strong>Type:</strong> {measurement.type}</p>
                <button 
                  onClick={() => handleMeasurementChange(measurement.id)}
                  className={currentMeasurementId === measurement.id ? 'secondary' : 'outline'}
                  style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                >
                  {currentMeasurementId === measurement.id ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* Four-Way Scaling Analysis */}
      <section style={{ marginTop: '2rem' }}>
        <FourWayScalingComparison 
          availableMeasurements={currentCategory.measurements}
          initialMeasurement={currentMeasurementId}
          categoryContext={{
            categoryName: currentCategory.name,
            expectedApproaches: currentCategory.expectedApproaches,
            scalingInfo: currentCategory.scalingInfo
          }}
        />
      </section>

      {/* Educational Notes by Category */}
      <section className="transparency-panel" style={{ marginTop: '2rem' }}>
        <header>
          <h3>🎓 {currentCategory.name} - Key Insights</h3>
        </header>
        
        {activeCategory === 'linear' && (
          <div>
            <h4>Why Linear Measurements Are Special</h4>
            <p>
              Linear cardiac dimensions (like LV diameter, wall thickness) represent 1D measurements. 
              According to geometric scaling theory, they should scale as the cube root (^0.33) of body mass 
              or the square root (^0.5) of body surface area.
            </p>
            <div className="insight-warning">
              <strong>Ratiometric Problem:</strong> Traditional BSA indexing (BSA^1.0) overcorrects linear 
              measurements, making large patients appear to have smaller hearts than they actually do.
            </div>
          </div>
        )}

        {activeCategory === 'area' && (
          <div>
            <h4>The Area Measurement Sweet Spot</h4>
            <p>
              Area measurements (chamber areas, valve areas) are the only cardiac measurements where 
              traditional ratiometric BSA indexing is geometrically correct! BSA^1.0 = BSA^1.0 - 
              they're the same thing.
            </p>
            <div className="insight-success">
              <strong>Geometric Validation:</strong> This is why you'll see fewer dramatic differences 
              between scaling approaches for area measurements. Traditional indexing got this one right!
            </div>
          </div>
        )}

        {activeCategory === 'mass_volume' && (
          <div>
            <h4>The Height Exponent Mystery</h4>
            <p>
              Mass and volume measurements present the most complex scaling relationships. Pure geometric 
              theory predicts Height^3.0, but empirical studies consistently find exponents between 1.6-2.7.
            </p>
            <div className="insight-info">
              <strong>Biological Reality:</strong> Hearts don't scale with perfect geometric similarity. 
              Body composition, fitness, and other factors create deviations from pure geometric predictions.
            </div>
            <div className="insight-warning">
              <strong>Clinical Impact:</strong> The choice of height exponent can dramatically affect 
              apparent sex differences and body size corrections in cardiac measurements.
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MeasurementTypeExplorer;