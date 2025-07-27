// src/components/cardiacScaling/FourWayScalingComparison.tsx

"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Import core dependencies
import { STROM_MEASUREMENTS, type EnhancedMeasurementData } from '@/data/stromData';
import FormulaSelector, { 
  useFormulaSelection, 
  FormulaValuesDisplay 
} from '@/components/common/FormulaSelector';

// Import the FIXED DeweyMethodFactory
import { 
  generateScalingAnalysis,
  getStandardConfigurations,
  type DeweyMethodResult,
  type ScalingConfiguration 
} from './core/DeweyMethodFactory';

// =============================================================================
// ENHANCED COMPONENT INTERFACE
// =============================================================================

interface CategoryContext {
  categoryName: string;
  expectedApproaches: number;
  scalingInfo: string;
}

interface FourWayScalingComparisonProps {
  availableMeasurements?: EnhancedMeasurementData[];
  initialMeasurement?: string;
  categoryContext?: CategoryContext;
}

interface ToggleState {
  [configId: string]: {
    male: boolean;
    female: boolean;
  };
}

interface ConfigurationDisplay {
  id: string;
  name: string;
  description: string;
  color: {
    male: string;
    female: string;
  };
  strokeWidth: number;
  strokeDasharray?: string;
}

// =============================================================================
// ENHANCED COLOR PALETTE
// =============================================================================

const CONFIGURATION_COLORS: Record<string, ConfigurationDisplay> = {
  ratiometric_bsa: {
    id: 'ratiometric_bsa',
    name: 'Ratiometric BSA',
    description: 'Current clinical standard - linear BSA indexing',
    color: { male: '#60a5fa', female: '#f87171' },
    strokeWidth: 2,
    strokeDasharray: '8 4'
  },
  allometric_lbm: {
    id: 'allometric_lbm', 
    name: 'Allometric LBM',
    description: 'Universal biological scaling',
    color: { male: '#3b82f6', female: '#dc2626' },
    strokeWidth: 4
  },
  allometric_bsa: {
    id: 'allometric_bsa',
    name: 'Allometric BSA', 
    description: 'Geometric BSA scaling',
    color: { male: '#059669', female: '#10b981' },
    strokeWidth: 3
  },
  allometric_height: {
    id: 'allometric_height',
    name: 'Allometric Height',
    description: 'Pure geometric height scaling', 
    color: { male: '#7c3aed', female: '#ec4899' },
    strokeWidth: 3
  },
  height_geometric: {
    id: 'height_geometric',
    name: 'Height Geometric',
    description: 'Theoretical geometric scaling',
    color: { male: '#f59e0b', female: '#f97316' },
    strokeWidth: 2,
    strokeDasharray: '4 2'
  },
  height_16: {
    id: 'height_16', 
    name: 'Height^1.6',
    description: 'Empirical scaling from Strom data',
    color: { male: '#8b5cf6', female: '#a855f7' },
    strokeWidth: 2,
    strokeDasharray: '6 3'
  },
  height_27: {
    id: 'height_27',
    name: 'Height^2.7', 
    description: 'Empirical scaling from Strom data',
    color: { male: '#06b6d4', female: '#0891b2' },
    strokeWidth: 2,
    strokeDasharray: '2 1'
  }
};

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

const formatCoefficient = (value: number, measurementType: string): string => {
  if (measurementType === 'linear') return value.toFixed(3);
  if (measurementType === 'mass' || measurementType === 'volume') return value.toFixed(2);
  return value.toFixed(2);
};

const getCorrelationColor = (correlation: number): string => {
  const abs = Math.abs(correlation);
  if (abs >= 0.9) return 'var(--cardiac-success)';
  if (abs >= 0.7) return 'var(--cardiac-primary)'; 
  if (abs >= 0.5) return 'var(--cardiac-warning)';
  return 'var(--cardiac-danger)';
};

const getCorrelationStrength = (correlation: number): string => {
  const abs = Math.abs(correlation);
  if (abs >= 0.9) return 'Very Strong';
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.5) return 'Moderate';
  if (abs >= 0.3) return 'Weak';
  return 'Very Weak';
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const FourWayScalingComparison: React.FC<FourWayScalingComparisonProps> = ({
  availableMeasurements = STROM_MEASUREMENTS,
  initialMeasurement = 'lvdd',
  categoryContext
}) => {
  // State
  const [selectedMeasurementId, setSelectedMeasurementId] = useState(initialMeasurement);
  const [showCorrelations, setShowCorrelations] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Formula selection
  const { selection: formulaSelection, callbacks: formulaCallbacks } = useFormulaSelection();

  // Get current measurement from available measurements
  const measurement = availableMeasurements.find(m => m.id === selectedMeasurementId) || availableMeasurements[0];

  // Update selected measurement when initialMeasurement changes (category switching)
  React.useEffect(() => {
    if (initialMeasurement && availableMeasurements.find(m => m.id === initialMeasurement)) {
      setSelectedMeasurementId(initialMeasurement);
    } else if (availableMeasurements.length > 0) {
      setSelectedMeasurementId(availableMeasurements[0].id);
    }
  }, [initialMeasurement, availableMeasurements]);

  // Generate factory result with all configurations
  const factoryResult = useMemo(() => {
    if (!measurement) return null;

    console.log(`🔧 ${categoryContext?.categoryName || 'Analysis'}: Generating scaling analysis for ${measurement.name}...`);

    // Get all standard configurations for this measurement type
    const configurations = getStandardConfigurations(measurement.type);

    const result = generateScalingAnalysis(measurement, formulaSelection, configurations, {
      populationRange: {
        height: { min: 120, max: 220, step: 1 },
        bmi: { min: 24, max: 24, step: 1 }
      },
      includeCorrelations: true,
      generateInsights: true
    });

    console.log(`✅ ${categoryContext?.categoryName || 'Analysis'}: ${configurations.length} configurations analyzed`);
    return result;
  }, [measurement, formulaSelection, categoryContext]);

  // Toggle state for showing/hiding lines
  const [toggleState, setToggleState] = useState<ToggleState>(() => {
    if (!factoryResult) return {};

    const initialState: ToggleState = {};
    factoryResult.configurations.forEach(config => {
      // Start with key approaches visible
      const isKeyApproach = ['ratiometric_bsa', 'allometric_lbm'].includes(config.id);
      initialState[config.id] = {
        male: isKeyApproach,
        female: isKeyApproach
      };
    });
    return initialState;
  });

  // Update toggle state when configurations change
  React.useEffect(() => {
    if (!factoryResult) return;

    setToggleState(prevState => {
      const newState: ToggleState = {};
      factoryResult.configurations.forEach(config => {
        const existing = prevState[config.id];
        if (existing) {
          newState[config.id] = existing;
        } else {
          // Default for new configurations
          const isKeyApproach = ['ratiometric_bsa', 'allometric_lbm'].includes(config.id);
          newState[config.id] = {
            male: isKeyApproach,
            female: isKeyApproach
          };
        }
      });
      return newState;
    });
  }, [factoryResult]);

  if (!measurement || !factoryResult) {
    return <div>Loading comprehensive scaling analysis...</div>;
  }

  // Helper functions
  const toggleConfiguration = (configId: string, sex: 'male' | 'female') => {
    setToggleState(prev => ({
      ...prev,
      [configId]: {
        ...prev[configId],
        [sex]: !prev[configId]?.[sex]
      }
    }));
  };

  const toggleAllForConfig = (configId: string) => {
    const current = toggleState[configId];
    const allOn = current?.male && current?.female;
    setToggleState(prev => ({
      ...prev,
      [configId]: {
        male: !allOn,
        female: !allOn
      }
    }));
  };

  // Reference population for display
  const referencePopulation = {
    male: {
      height: factoryResult.referencePopulations.male.height,
      weight: factoryResult.referencePopulations.male.weight,
      bsa: factoryResult.referencePopulations.male.bsa,
      lbm: factoryResult.referencePopulations.male.lbm
    },
    female: {
      height: factoryResult.referencePopulations.female.height,
      weight: factoryResult.referencePopulations.female.weight,
      bsa: factoryResult.referencePopulations.female.bsa,
      lbm: factoryResult.referencePopulations.female.lbm
    }
  };

  return (
    <div>
      {/* Header with category context */}
      <header>
        <hgroup>
          <h3>{categoryContext ? `${categoryContext.categoryName} Analysis` : '4-Way Scaling Comparison'}</h3>
          <p>
            {categoryContext ? categoryContext.scalingInfo : 'Comprehensive analysis of all scaling approaches'} for {measurement.name}
          </p>
        </hgroup>
      </header>

      {/* Controls */}
      <section>
        <div className="controls-grid">
          {/* Measurement Selection */}
          <div>
            <label htmlFor="measurement-select">
              {categoryContext ? `${categoryContext.categoryName} Measurements` : 'Measurement'}
            </label>
            <select
              id="measurement-select"
              value={selectedMeasurementId}
              onChange={(e) => setSelectedMeasurementId(e.target.value)}
            >
              {availableMeasurements.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.absoluteUnit})
                </option>
              ))}
            </select>
            <div className="formula-info">
              {factoryResult.configurations.length} scaling approaches • {measurement.type} measurement
            </div>
          </div>

          {/* View Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setShowCorrelations(!showCorrelations)}
              role="button"
              className={showCorrelations ? '' : 'secondary'}
            >
              {showCorrelations ? 'Hide' : 'Show'} Correlations
            </button>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              role="button"
              className={showMetrics ? '' : 'secondary'}
            >
              {showMetrics ? 'Hide' : 'Show'} Metrics
            </button>
          </div>
        </div>

        {/* Formula Selection */}
        <FormulaSelector
          selection={formulaSelection}
          callbacks={formulaCallbacks}
          layout="grid"
          className="mt-1"
        />

        {/* Configuration Toggles */}
        <div className="controls-grid" style={{ marginTop: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <h4>Scaling Configurations</h4>
            <div className="metrics-grid">
              {factoryResult.configurations.map(config => {
                const display = CONFIGURATION_COLORS[config.id] || {
                  id: config.id,
                  name: config.name,
                  description: config.description,
                  color: { male: '#6b7280', female: '#9ca3af' },
                  strokeWidth: 2
                };

                const toggles = toggleState[config.id] || { male: false, female: false };
                const coefficients = factoryResult.coefficients[config.id];
                const metrics = factoryResult.validationMetrics[config.id];

                return (
                  <div key={config.id} className="metric-card">
                    <h5 style={{ margin: '0 0 0.5rem 0' }}>{display.name}</h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--pico-muted-color)', margin: '0 0 1rem 0' }}>
                      {display.description}
                    </p>

                    {/* Toggle Controls */}
                    <div className="button-group">
                      <button
                        onClick={() => toggleAllForConfig(config.id)}
                        className={toggles.male && toggles.female ? '' : 'secondary'}
                        style={{ fontSize: '0.875rem' }}
                      >
                        {toggles.male && toggles.female ? 'Hide All' : 'Show All'}
                      </button>
                      <button
                        onClick={() => toggleConfiguration(config.id, 'male')}
                        className={toggles.male ? '' : 'secondary'}
                        style={{ 
                          fontSize: '0.875rem',
                          borderLeft: `3px solid ${display.color.male}`
                        }}
                      >
                        ♂ Male
                      </button>
                      <button
                        onClick={() => toggleConfiguration(config.id, 'female')}
                        className={toggles.female ? '' : 'secondary'}
                        style={{ 
                          fontSize: '0.875rem',
                          borderLeft: `3px solid ${display.color.female}`
                        }}
                      >
                        ♀ Female
                      </button>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                      <div>R² = {metrics.rSquared.toFixed(3)}</div>
                      <div>Similarity = {coefficients.similarity.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Summary Statistics */}
      <section className="insight-info">
        <h4>Analysis Summary</h4>
        <div className="metrics-grid">
          <div>
            <h5>Best Performing</h5>
            <div className="coefficient-display">{factoryResult.insights.bestConfiguration}</div>
            <small>Highest R² × Sex Similarity score</small>
          </div>
          <div>
            <h5>Recommended</h5>
            <div className="coefficient-display">{factoryResult.insights.recommendedApproach}</div>
            <small>Based on measurement type ({measurement.type})</small>
          </div>
          <div>
            <h5>Clinical Relevance</h5>
            <div className="coefficient-display">{factoryResult.insights.clinicalRelevance}</div>
            <small>Impact on clinical decision making</small>
          </div>
          <div>
            <h5>Total Correlations</h5>
            <div className="coefficient-display">{factoryResult.correlationMatrix.significantCorrelations.length}</div>
            <small>Significant relationships found</small>
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="chart-container">
        <header>
          <h4>{measurement.name} - All Scaling Approaches</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--pico-muted-color)' }}>
            Comparing {factoryResult.configurations.length} different scaling methodologies. 
            Toggle configurations above to show/hide approaches.
          </p>
        </header>

        <ResponsiveContainer width="100%" height={600}>
          <LineChart data={factoryResult.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--pico-border-color)" opacity={0.5} />
            <XAxis 
              dataKey="scalingValue"
              type="number"
              domain={[0, 3.5]}
              tickFormatter={(value) => value.toFixed(1)}
              label={{ 
                value: `Body Surface Area (m²)`, 
                position: 'insideBottom', 
                offset: -5 
              }}
            />
            <YAxis 
              domain={[0, 'dataMax']}
              label={{ 
                value: `${measurement.name} (${measurement.absoluteUnit})`, 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (typeof value !== 'number') return [value, name];
                
                // Extract config ID and sex from dataKey
                const nameStr = String(name);
                const configId = nameStr.replace('_male', '').replace('_female', '');
                const sex = nameStr.includes('_male') ? 'Male' : 'Female';
                const display = CONFIGURATION_COLORS[configId];
                
                const displayName = display ? `${display.name} ${sex}` : nameStr;
                return [value.toFixed(2), displayName];
              }}
              labelFormatter={(value) => `BSA: ${value?.toFixed(2)} m²`}
              contentStyle={{
                fontSize: '0.875rem',
                padding: '0.5rem',
                maxWidth: '250px'
              }}
            />

            {/* Render lines for each configuration */}
            {factoryResult.configurations.map(config => {
              const display = CONFIGURATION_COLORS[config.id] || {
                color: { male: '#6b7280', female: '#9ca3af' },
                strokeWidth: 2
              };
              const toggles = toggleState[config.id] || { male: false, female: false };

              return (
                <React.Fragment key={config.id}>
                  {/* Male line */}
                  {toggles.male && (
                    <Line 
                      dataKey={`${config.id}_male`}
                      stroke={display.color.male}
                      strokeWidth={display.strokeWidth}
                      strokeDasharray={display.strokeDasharray}
                      dot={false}
                      name={`${config.id}_male`}
                      connectNulls={false}
                    />
                  )}
                  
                  {/* Female line */}
                  {toggles.female && (
                    <Line 
                      dataKey={`${config.id}_female`}
                      stroke={display.color.female}
                      strokeWidth={display.strokeWidth}
                      strokeDasharray={display.strokeDasharray}
                      dot={false}
                      name={`${config.id}_female`}
                      connectNulls={false}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Reference lines */}
            <ReferenceLine x={0} stroke="var(--pico-muted-color)" strokeWidth={1} />
            <ReferenceLine y={0} stroke="var(--pico-muted-color)" strokeWidth={1} />
            
            {/* Reference population markers */}
            <ReferenceLine 
              x={referencePopulation.male.bsa} 
              stroke="#3b82f6" 
              strokeWidth={1} 
              strokeDasharray="2 2"
              label={{ value: "♂", position: "top", style: { fontSize: '12px' } }}
            />
            <ReferenceLine 
              x={referencePopulation.female.bsa} 
              stroke="#dc2626" 
              strokeWidth={1} 
              strokeDasharray="2 2"
              label={{ value: "♀", position: "top", style: { fontSize: '12px' } }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Detailed Metrics */}
      {showMetrics && (
        <section className="metrics-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <h4>Detailed Configuration Metrics</h4>
          </div>
          
          {factoryResult.configurations.map(config => {
            const coefficients = factoryResult.coefficients[config.id];
            const metrics = factoryResult.validationMetrics[config.id];
            const display = CONFIGURATION_COLORS[config.id];

            return (
              <article key={config.id} className="metric-card">
                <header>
                  <h5>{display?.name || config.name}</h5>
                </header>
                
                <dl style={{ fontSize: '0.875rem' }}>
                  <dt>Approach:</dt>
                  <dd>{config.approach}</dd>
                  <dt>Variable:</dt>
                  <dd>{config.variable.toUpperCase()}^{config.exponent}</dd>
                  <dt>R²:</dt>
                  <dd className="status-excellent">{metrics.rSquared.toFixed(3)}</dd>
                  <dt>Correlation:</dt>
                  <dd className="status-excellent">{metrics.correlation.toFixed(3)}</dd>
                  <dt>Sex Similarity:</dt>
                  <dd className="status-excellent">{coefficients.similarity.percentage.toFixed(1)}%</dd>
                  
                  {config.approach === 'allometric' && coefficients.universal && (
                    <>
                      <dt>Universal Coefficient:</dt>
                      <dd className="coefficient-display">
                        {formatCoefficient(coefficients.universal, measurement.type)}
                      </dd>
                    </>
                  )}
                </dl>
              </article>
            );
          })}
        </section>
      )}

      {/* Correlation Matrix */}
      {showCorrelations && factoryResult.correlationMatrix.significantCorrelations.length > 0 && (
        <section>
          <h4>Cross-Method Correlations</h4>
          <div className="insight-info">
            <p>
              Correlations between different scaling approaches. High correlations suggest 
              methods produce similar results, while low correlations indicate fundamental differences.
            </p>
          </div>
          
          <div className="metrics-grid">
            {factoryResult.correlationMatrix.significantCorrelations.map((corr, index) => {
              const config1 = CONFIGURATION_COLORS[corr.config1];
              const config2 = CONFIGURATION_COLORS[corr.config2];
              
              return (
                <div key={index} className="metric-card">
                  <h5 style={{ fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                    {config1?.name || corr.config1} ↔ {config2?.name || corr.config2}
                  </h5>
                  <div 
                    className="coefficient-display"
                    style={{ 
                      color: getCorrelationColor(corr.correlation),
                      fontSize: '1.25rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {corr.correlation.toFixed(3)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pico-muted-color)' }}>
                    {getCorrelationStrength(corr.correlation)} ({corr.strength})
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default FourWayScalingComparison;