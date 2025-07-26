// src/components/cardiacScaling/RatiometricVsBiological.tsx

"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Import from your existing data structures
import { STROM_MEASUREMENTS, type EnhancedMeasurementData } from '@/data/stromData';

// Import the new FormulaSelector component
import FormulaSelector, { 
  useFormulaSelection, 
  FormulaValuesDisplay,
  type FormulaSelectionState 
} from '@/components/common/FormulaSelector';

// 🚀 NEW: Import the DeweyMethodFactory
import { 
  generateQuickComparison, 
  extractLegacyData,
  type DeweyMethodResult 
} from './core/DeweyMethodFactory';

// =============================================================================
// FORMATTING UTILITIES (kept from original)
// =============================================================================

const formatCoefficient = (value: number, measurementType: string): string => {
  if (measurementType === 'linear') {
    return value.toFixed(3);
  } else if (measurementType === 'mass' || measurementType === 'volume') {
    return value.toFixed(2);
  } else {
    return value.toFixed(2);
  }
};

const formatMeasurementValue = (value: number, unit: string): string => {
  if (unit === 'cm') {
    return value.toFixed(2);
  } else if (unit === 'g') {
    return value.toFixed(1);
  } else if (unit === 'mL') {
    return value.toFixed(1);
  } else {
    return value.toFixed(2);
  }
};

// =============================================================================
// MAIN COMPONENT - POWERED BY DEWEYMETHODFACTORY
// =============================================================================

const RatiometricVsBiological: React.FC = () => {
  // State
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('lvdd');
  const [showTransparency, setShowTransparency] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  
  // Use the formula selection hook
  const { selection: formulaSelection, callbacks: formulaCallbacks } = useFormulaSelection();
  
  // Get current measurement
  const measurement = STROM_MEASUREMENTS.find(m => m.id === selectedMeasurementId);
  
  // 🚀 NEW: Replace all inline calculations with DeweyMethodFactory
  const { factoryResult, transparencyData, chartData, referencePopulation } = useMemo(() => {
    if (!measurement) {
      return { 
        factoryResult: null, 
        transparencyData: null, 
        chartData: [], 
        referencePopulation: null 
      };
    }
    
    console.log('🔧 DeweyMethodFactory: Generating scaling analysis...');
    
    // Generate the complete analysis using the factory
    const result = generateQuickComparison(measurement, formulaSelection, {
      populationRange: {
        height: { min: 120, max: 220, step: 1 }, // 1cm steps for smooth curves
        bmi: { min: 24, max: 24, step: 1 } // Fixed BMI for clean curves
      },
      includeCorrelations: true,
      generateInsights: true
    });
    
    console.log('✅ DeweyMethodFactory: Analysis complete');
    
    // Extract legacy format for existing UI compatibility
    const legacyData = extractLegacyData(result);
    
    // Prepare reference population data for FormulaValuesDisplay
    const refPop = {
      male: {
        height: result.referencePopulations.male.height,
        weight: result.referencePopulations.male.weight,
        bsa: result.referencePopulations.male.bsa,
        lbm: result.referencePopulations.male.lbm
      },
      female: {
        height: result.referencePopulations.female.height,
        weight: result.referencePopulations.female.weight,
        bsa: result.referencePopulations.female.bsa,
        lbm: result.referencePopulations.female.lbm
      }
    };
    
    return {
      factoryResult: result,
      transparencyData: legacyData.transparencyData,
      chartData: legacyData.chartData,
      referencePopulation: refPop
    };
  }, [measurement, formulaSelection]);
  
  if (!measurement || !transparencyData || !referencePopulation || !factoryResult) {
    return <div>Measurement not found or factory error</div>;
  }
  
  // Calculate ratiometric comparison metrics using 97.5th percentile
  const ratiometricSlopeMale = measurement.male.bsa.mean + 1.96 * measurement.male.bsa.sd;
  const ratiometricSlopeFemale = measurement.female.bsa.mean + 1.96 * measurement.female.bsa.sd;
  const ratiometricDifference = Math.abs(ratiometricSlopeMale - ratiometricSlopeFemale);
  const ratiometricRelativeDiff = (ratiometricDifference / Math.max(ratiometricSlopeMale, ratiometricSlopeFemale)) * 100;

  return (
    <div className="container">
      {/* Header */}
      <header>
        <hgroup>
          <h2>Ratiometric vs. Biological Scaling</h2>
          <p>Straight lines show traditional BSA indexing. Curved lines show universal biological scaling.</p>
        </hgroup>
        
        {/* 🚀 NEW: Factory Status Display */}
        <div className="insight-info">
          <small>
            <strong>🔧 Engine Status:</strong> DeweyMethodFactory v1.0 • 
            Configurations: {factoryResult.configurations.length} • 
            Best: {factoryResult.insights.bestConfiguration} • 
            Recommended: {factoryResult.insights.recommendedApproach}
          </small>
        </div>
      </header>
      
      {/* Controls */}
      <section>
        <div className="controls-grid">
          {/* Measurement Selection */}
          <div>
            <label htmlFor="measurement-select">Measurement</label>
            <select
              id="measurement-select"
              value={selectedMeasurementId}
              onChange={(e) => setSelectedMeasurementId(e.target.value)}
            >
              {STROM_MEASUREMENTS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type})
                </option>
              ))}
            </select>
            <div className="formula-info">
              Expected: LBM^{transparencyData.expectedExponent}
            </div>
            {/* 🚀 NEW: Factory Insights */}
            <div className="formula-notes">
              Clinical relevance: {factoryResult.insights.clinicalRelevance}
            </div>
          </div>
          
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setShowTransparency(!showTransparency)}
              role="button"
              className={showTransparency ? '' : 'secondary'}
            >
              {showTransparency ? 'Hide' : 'Show'} Transparency
            </button>
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              role="button"
              className={showFormulaDetails ? '' : 'secondary'}
            >
              {showFormulaDetails ? 'Hide' : 'Show'} Formula Details
            </button>
            {/* 🚀 NEW: Factory Debug */}
            <button
              onClick={() => console.log('Factory Result:', factoryResult)}
              role="button"
              className="secondary"
              style={{ fontSize: '0.8rem' }}
            >
              🔍 Debug Factory
            </button>
          </div>
        </div>
        
        {/* Formula Selection Component */}
        <FormulaSelector
          selection={formulaSelection}
          callbacks={formulaCallbacks}
          layout="grid"
          className="mt-1"
        />
        
        {/* Formula Values Display */}
        {showFormulaDetails && (
          <FormulaValuesDisplay
            selection={formulaSelection}
            referencePopulation={referencePopulation}
            showDetailed={true}
          />
        )}
      </section>
      
      {/* Universal Coefficient Summary - Enhanced with Factory Data */}
      <section className="universal-coefficient">
        <div>
          <h3 style={{ margin: 0 }}>Universal LBM Coefficient</h3>
          <div className="coefficient-value">
            {formatCoefficient(transparencyData.universalCoefficient, measurement.type)} {measurement.absoluteUnit}/kg^{transparencyData.expectedExponent}
          </div>
          {/* 🚀 NEW: Factory Validation Metrics */}
          <small style={{ display: 'block', marginTop: '0.5rem' }}>
            R² = {factoryResult.validationMetrics.allometric_lbm?.rSquared.toFixed(3)} • 
            Correlation = {factoryResult.validationMetrics.allometric_lbm?.correlation.toFixed(3)}
          </small>
        </div>
        <div className="similarity-score">
          <div className="similarity-value">
            {transparencyData.similarity.percentage.toFixed(1)}%
          </div>
          <small>Sex Similarity</small>
        </div>
      </section>
      
      {/* 🚀 NEW: Factory Insights Panel */}
      <section className="insight-success">
        <h3>🤖 DeweyMethodFactory Insights</h3>
        <div className="metrics-grid">
          <div>
            <h4>Configuration Analysis</h4>
            <dl>
              <dt>Best performing:</dt>
              <dd className="coefficient-display">{factoryResult.insights.bestConfiguration}</dd>
              <dt>Worst performing:</dt>
              <dd className="coefficient-display">{factoryResult.insights.worstConfiguration}</dd>
              <dt>Recommended:</dt>
              <dd className="coefficient-display">{factoryResult.insights.recommendedApproach}</dd>
            </dl>
          </div>
          <div>
            <h4>Validation Scores</h4>
            <dl>
              <dt>LBM R²:</dt>
              <dd className="status-excellent">{factoryResult.validationMetrics.allometric_lbm?.rSquared.toFixed(3)}</dd>
              <dt>BSA R²:</dt>
              <dd className="status-good">{factoryResult.validationMetrics.ratiometric_bsa?.rSquared.toFixed(3)}</dd>
              <dt>Correlations found:</dt>
              <dd className="coefficient-display">{factoryResult.correlationMatrix.significantCorrelations.length}</dd>
            </dl>
          </div>
        </div>
      </section>
      
      {/* Transparency Panel - Enhanced */}
      {showTransparency && (
        <section className="transparency-panel">
          <hgroup>
            <h3>🔍 Full Transparency: Universal Coefficient Genesis</h3>
            <p>
              This is the complete step-by-step calculation of how we derive the universal LBM coefficient 
              using the Dewey methodology via DeweyMethodFactory. Every number is shown so you can verify the math.
            </p>
          </hgroup>
          
          <div className="metrics-grid">
            {/* Step 1: Reference Populations */}
            <article>
              <header>
                <h4>Step 1: Reference Populations (BMI 24 Standard)</h4>
              </header>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h5>Male Reference</h5>
                  <dl>
                    <dt>Height:</dt><dd>{transparencyData.referencePopulations.male.height} cm</dd>
                    <dt>Weight:</dt><dd>{transparencyData.referencePopulations.male.weight.toFixed(1)} kg</dd>
                    <dt>BMI:</dt><dd>{transparencyData.referencePopulations.male.bmi.toFixed(1)} kg/m²</dd>
                    <dt>BSA ({formulaSelection.bsaFormula}):</dt><dd>{transparencyData.referencePopulations.male.bsa.toFixed(3)} m²</dd>
                    <dt>LBM ({formulaSelection.lbmFormula}):</dt><dd>{transparencyData.referencePopulations.male.lbm.toFixed(1)} kg</dd>
                  </dl>
                </div>
                <div>
                  <h5>Female Reference</h5>
                  <dl>
                    <dt>Height:</dt><dd>{transparencyData.referencePopulations.female.height} cm</dd>
                    <dt>Weight:</dt><dd>{transparencyData.referencePopulations.female.weight.toFixed(1)} kg</dd>
                    <dt>BMI:</dt><dd>{transparencyData.referencePopulations.female.bmi.toFixed(1)} kg/m²</dd>
                    <dt>BSA ({formulaSelection.bsaFormula}):</dt><dd>{transparencyData.referencePopulations.female.bsa.toFixed(3)} m²</dd>
                    <dt>LBM ({formulaSelection.lbmFormula}):</dt><dd>{transparencyData.referencePopulations.female.lbm.toFixed(1)} kg</dd>
                  </dl>
                </div>
              </div>
              
              {/* Show additional parameters when using advanced formulas */}
              {(formulaSelection.lbmFormula === 'lee' || formulaSelection.lbmFormula === 'yu') && (
                <div className="insight-info">
                  <strong>Additional Parameters:</strong>
                  {formulaSelection.lbmFormula === 'lee' && (
                    <span> Ethnicity: {formulaSelection.ethnicity}</span>
                  )}
                  {(formulaSelection.lbmFormula === 'lee' || formulaSelection.lbmFormula === 'yu') && (
                    <span> Age: {formulaSelection.age} years</span>
                  )}
                </div>
              )}
            </article>
            
            {/* Step 2: Back-Calculated Absolutes */}
            <article>
              <header>
                <h4>Step 2: Back-Calculated Absolute Values</h4>
              </header>
              <div>
                <h5>Published Reference (97.5th percentile - ULN):</h5>
                <dl>
                  <dt>Male:</dt>
                  <dd className="coefficient-display">
                    {(measurement.male.bsa.mean + 1.96 * measurement.male.bsa.sd).toFixed(3)} {measurement.getIndexedUnit('bsa')}
                  </dd>
                  <dt>Female:</dt>
                  <dd className="coefficient-display">
                    {(measurement.female.bsa.mean + 1.96 * measurement.female.bsa.sd).toFixed(3)} {measurement.getIndexedUnit('bsa')}
                  </dd>
                </dl>
                
                <h5>Calculated Absolute Values:</h5>
                <dl>
                  <dt>Male:</dt>
                  <dd className="coefficient-display">
                    {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.male, measurement.absoluteUnit)} {measurement.absoluteUnit}
                  </dd>
                  <dt>Female:</dt>
                  <dd className="coefficient-display">
                    {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.female, measurement.absoluteUnit)} {measurement.absoluteUnit}
                  </dd>
                </dl>
              </div>
            </article>
            
            {/* Step 3: Individual LBM Coefficients */}
            <article>
              <header>
                <h4>Step 3: Individual LBM Coefficients</h4>
              </header>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--pico-code-background-color)', borderRadius: 'var(--pico-border-radius)', marginBottom: '1rem' }}>
                <code>Coefficient = Absolute ÷ LBM^{transparencyData.expectedExponent}</code>
              </div>
              <div>
                <h5>Male Coefficient:</h5>
                <code style={{ display: 'block', marginBottom: '0.5rem' }}>
                  {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.male, measurement.absoluteUnit)} ÷ {transparencyData.referencePopulations.male.lbm.toFixed(1)}^{transparencyData.expectedExponent} = {formatCoefficient(transparencyData.individualCoefficients.male, measurement.type)}
                </code>
                
                <h5>Female Coefficient:</h5>
                <code style={{ display: 'block' }}>
                  {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.female, measurement.absoluteUnit)} ÷ {transparencyData.referencePopulations.female.lbm.toFixed(1)}^{transparencyData.expectedExponent} = {formatCoefficient(transparencyData.individualCoefficients.female, measurement.type)}
                </code>
              </div>
            </article>
            
            {/* Step 4: Universal Coefficient */}
            <article>
              <header>
                <h4>Step 4: Universal Coefficient</h4>
              </header>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--pico-code-background-color)', borderRadius: 'var(--pico-border-radius)', marginBottom: '1rem' }}>
                <code>Universal = (Male + Female) ÷ 2</code>
              </div>
              <div style={{ textAlign: 'center' }}>
                <code style={{ display: 'block', marginBottom: '0.5rem' }}>
                  ({formatCoefficient(transparencyData.individualCoefficients.male, measurement.type)} + {formatCoefficient(transparencyData.individualCoefficients.female, measurement.type)}) ÷ 2
                </code>
                <div className="coefficient-display" style={{ fontSize: '1.25rem', padding: '0.75rem 1.5rem' }}>
                  = {formatCoefficient(transparencyData.universalCoefficient, measurement.type)}
                </div>
                
                <dl style={{ marginTop: '1rem' }}>
                  <dt>Absolute difference:</dt>
                  <dd className="coefficient-display">{formatCoefficient(transparencyData.similarity.absolute, measurement.type)}</dd>
                  <dt>Similarity:</dt>
                  <dd className="status-excellent">{transparencyData.similarity.percentage.toFixed(1)}%</dd>
                </dl>
              </div>
            </article>
          </div>
          
          <div className="insight-success">
            <strong>Validation:</strong> High similarity ({transparencyData.similarity.percentage.toFixed(1)}%) between 
            male and female LBM coefficients supports the hypothesis that biological scaling relationships 
            are universal across sexes when properly normalized.
            <br /><br />
            <strong>🚀 Factory Validation:</strong> R² = {factoryResult.validationMetrics.allometric_lbm?.rSquared.toFixed(3)}, 
            Correlation = {factoryResult.validationMetrics.allometric_lbm?.correlation.toFixed(3)}
          </div>
        </section>
      )}
      
      {/* Chart */}
      <section className="chart-container">
        <header>
          <h3>{measurement.name} vs Body Surface Area</h3>
          <p>
            Universal LBM Coefficient: <span className="coefficient-display">{formatCoefficient(transparencyData.universalCoefficient, measurement.type)} {measurement.absoluteUnit}/kg^{transparencyData.expectedExponent}</span>
            <br />
            <small style={{ color: 'var(--pico-muted-color)' }}>
              Both approaches use 97.5th percentile (ULN) reference points for fair comparison. Biological curves shown for realistic population range (BSA 1.0-3.2 m², heights 120-220cm).
              Using {formulaSelection.bsaFormula.toUpperCase()} BSA and {formulaSelection.lbmFormula.toUpperCase()} LBM formulas.
            </small>
          </p>
        </header>
        
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--pico-border-color)" opacity={0.5} />
            <XAxis 
              dataKey="bsa"
              type="number"
              domain={[0, 3.5]}
              tickFormatter={(value) => value.toFixed(1)}
              label={{ 
                value: `Body Surface Area (m²) - ${formulaSelection.bsaFormula.toUpperCase()}`, 
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
              formatter={(value, name) => [
                typeof value === 'number' ? value.toFixed(3) : value, 
                typeof name === 'string'
                  ? name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                  : String(name)
              ]}
              labelFormatter={(value) => `BSA: ${value?.toFixed(2)} m² (${formulaSelection.bsaFormula.toUpperCase()})`}
            />
            
            {/* Biological curves (curved) - THICK SOLID LINES */}
            <Line 
              dataKey="biologicalMale" 
              stroke="#3b82f6" 
              strokeWidth={4}
              dot={false}
              name={`Biological Male (${formulaSelection.lbmFormula.toUpperCase()} LBM^${transparencyData.expectedExponent})`}
              connectNulls={false}
            />
            <Line 
              dataKey="biologicalFemale" 
              stroke="#dc2626" 
              strokeWidth={4}
              dot={false}
              name={`Biological Female (${formulaSelection.lbmFormula.toUpperCase()} LBM^${transparencyData.expectedExponent})`}
              connectNulls={false}
            />
            
            {/* Ratiometric lines (straight) - THIN DASHED LINES */}
            <Line 
              dataKey="ratiometricMale" 
              stroke="#60a5fa" 
              strokeWidth={2}
              dot={false}
              name={`Ratiometric Male (${formulaSelection.bsaFormula.toUpperCase()} BSA Linear)`}
              strokeDasharray="8 4"
            />
            <Line 
              dataKey="ratiometricFemale" 
              stroke="#f87171" 
              strokeWidth={2}
              dot={false}
              name={`Ratiometric Female (${formulaSelection.bsaFormula.toUpperCase()} BSA Linear)`}
              strokeDasharray="8 4"
            />
            
            {/* Reference lines */}
            <ReferenceLine x={0} stroke="var(--pico-muted-color)" strokeWidth={1} />
            <ReferenceLine y={0} stroke="var(--pico-muted-color)" strokeWidth={1} />
            
            {/* Reference population markers */}
            <ReferenceLine 
              x={transparencyData.referencePopulations.male.bsa} 
              stroke="#3b82f6" 
              strokeWidth={1} 
              strokeDasharray="2 2"
              label={{ value: "♂ Ref", position: "top", style: { fontSize: '12px' } }}
            />
            <ReferenceLine 
              x={transparencyData.referencePopulations.female.bsa} 
              stroke="#dc2626" 
              strokeWidth={1} 
              strokeDasharray="2 2"
              label={{ value: "♀ Ref", position: "top", style: { fontSize: '12px' } }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
      
      {/* Analysis Grid */}
      <section className="metrics-grid">
        <article className="insight-danger">
          <header>
            <h3>Ratiometric Scaling Issues</h3>
          </header>
          <dl>
            <dt>Male slope (97.5th percentile):</dt>
            <dd className="coefficient-display">{ratiometricSlopeMale.toFixed(3)}</dd>
            <dt>Female slope (97.5th percentile):</dt>
            <dd className="coefficient-display">{ratiometricSlopeFemale.toFixed(3)}</dd>
            <dt>Sex difference:</dt>
            <dd className="status-error">{ratiometricRelativeDiff.toFixed(1)}%</dd>
            <dt>Factory R²:</dt>
            <dd className="coefficient-display">{factoryResult.validationMetrics.ratiometric_bsa?.rSquared.toFixed(3)}</dd>
          </dl>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            Artificial mathematical artifact (same reference points as biological curves)
          </small>
        </article>
        
        <article className="insight-success">
          <header>
            <h3>Biological Scaling Truth</h3>
          </header>
          <dl>
            <dt>Universal coefficient:</dt>
            <dd className="coefficient-display">{formatCoefficient(transparencyData.universalCoefficient, measurement.type)}</dd>
            <dt>Male coefficient:</dt>
            <dd className="coefficient-display">{formatCoefficient(transparencyData.individualCoefficients.male, measurement.type)}</dd>
            <dt>Female coefficient:</dt>
            <dd className="coefficient-display">{formatCoefficient(transparencyData.individualCoefficients.female, measurement.type)}</dd>
            <dt>Sex similarity:</dt>
            <dd className="status-excellent">{transparencyData.similarity.percentage.toFixed(1)}%</dd>
            <dt>Factory R²:</dt>
            <dd className="coefficient-display">{factoryResult.validationMetrics.allometric_lbm?.rSquared.toFixed(3)}</dd>
          </dl>
          <small style={{ color: 'var(--pico-muted-color)' }}>
            Universal biology revealed using {formulaSelection.bsaFormula.toUpperCase()} + {formulaSelection.lbmFormula.toUpperCase()}
          </small>
        </article>
      </section>
      
      {/* Legend and Insight */}
      <section className="insight-success">
        <header>
          <h3>Key Insights</h3>
        </header>
        <div className="metrics-grid">
          <div>
            <p>
              <strong>Curved biological lines</strong> (thick solid) represent universal scaling relationships 
              derived from actual population data using {formulaSelection.lbmFormula.toUpperCase()} LBM calculations, 
              showing natural convergence between sexes.
            </p>
            <p>
              <strong>Straight ratiometric lines</strong> (thin dashed) are mathematical extrapolations 
              using {formulaSelection.bsaFormula.toUpperCase()} BSA indexing that can extend to any value but create artificial sex differences.
            </p>
            {/* 🚀 NEW: Factory Insights */}
            <p>
              <strong>🤖 Factory Analysis:</strong> The DeweyMethodFactory recommends <em>{factoryResult.insights.recommendedApproach}</em> 
              based on measurement type ({measurement.type}) with <em>{factoryResult.insights.clinicalRelevance}</em> clinical relevance.
            </p>
          </div>
          <div style={{ background: 'var(--pico-card-background-color)', padding: '1rem', borderRadius: 'var(--pico-border-radius)', border: '1px solid var(--pico-border-color)' }}>
            <h4>Legend</h4>
            <dl style={{ fontSize: '0.875rem' }}>
              <dt style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '1.5rem', height: '3px', backgroundColor: '#3b82f6', marginRight: '0.5rem' }}></div>
                Male biological ({formulaSelection.lbmFormula.toUpperCase()} LBM^{transparencyData.expectedExponent})
              </dt>
              <dt style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '1.5rem', height: '3px', backgroundColor: '#dc2626', marginRight: '0.5rem' }}></div>
                Female biological ({formulaSelection.lbmFormula.toUpperCase()} LBM^{transparencyData.expectedExponent})
              </dt>
              <dt style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '1.5rem', height: '2px', backgroundColor: '#60a5fa', marginRight: '0.5rem', borderTop: '2px dashed #60a5fa' }}></div>
                Male ratiometric ({formulaSelection.bsaFormula.toUpperCase()} BSA 97.5th percentile)
              </dt>
              <dt style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '1.5rem', height: '2px', backgroundColor: '#f87171', marginRight: '0.5rem', borderTop: '2px dashed #f87171' }}></div>
                Female ratiometric ({formulaSelection.bsaFormula.toUpperCase()} BSA 97.5th percentile)
              </dt>
            </dl>
            
            {/* 🚀 NEW: Factory Status */}
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--pico-muted-color)' }}>
              <strong>Engine:</strong> DeweyMethodFactory • 
              <strong>Configs:</strong> {factoryResult.configurations.length} • 
              <strong>R² Range:</strong> {Math.min(...Object.values(factoryResult.validationMetrics).map(m => m.rSquared)).toFixed(3)} - {Math.max(...Object.values(factoryResult.validationMetrics).map(m => m.rSquared)).toFixed(3)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RatiometricVsBiological;