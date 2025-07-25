// src/components/cardiacScaling/RatiometricVsBiological.tsx

"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Import from your existing data structures
import { STROM_MEASUREMENTS, type Sex, type EnhancedMeasurementData } from '@/data/stromData';
import { getReferencePopulation, type PopulationCharacteristics } from '@/data/populationDefinitions';
import { getScalingExponents } from '@/data/scalingLaws';
import { calculateBSA, calculateLBM } from '@/utils/bodyComposition/formulaRegistry';

// Import the new FormulaSelector component
import FormulaSelector, { 
  useFormulaSelection, 
  FormulaValuesDisplay,
  type FormulaSelectionState 
} from '@/components/common/FormulaSelector';

// =============================================================================
// TRANSPARENCY CALCULATIONS (Updated to use FormulaSelectionState)
// =============================================================================

interface TransparencyData {
  measurement: EnhancedMeasurementData;
  referencePopulations: {
    male: PopulationCharacteristics & { bsa: number; lbm: number };
    female: PopulationCharacteristics & { bsa: number; lbm: number };
  };
  backCalculatedAbsolutes: {
    male: number;
    female: number;
  };
  individualCoefficients: {
    male: number;
    female: number;
  };
  universalCoefficient: number;
  similarity: {
    absolute: number;
    percentage: number;
  };
  expectedExponent: number;
}

/**
 * Calculate complete transparency data for a measurement
 */
const calculateTransparencyData = (
  measurement: EnhancedMeasurementData,
  formulaSelection: FormulaSelectionState
): TransparencyData => {
  const expectedExponent = getScalingExponents(measurement.type).lbm;
  
  // 1. Get reference populations with calculated BSA/LBM
  const maleRef = getReferencePopulation('male');
  const femaleRef = getReferencePopulation('female');
  
  const malePopulation = {
    ...maleRef,
    bsa: calculateBSA(formulaSelection.bsaFormula, maleRef.weight, maleRef.height),
    lbm: calculateLBM(
      formulaSelection.lbmFormula, 
      maleRef.weight, 
      maleRef.height, 
      'male', 
      formulaSelection.age, 
      formulaSelection.ethnicity
    )
  };
  
  const femalePopulation = {
    ...femaleRef,
    bsa: calculateBSA(formulaSelection.bsaFormula, femaleRef.weight, femaleRef.height),
    lbm: calculateLBM(
      formulaSelection.lbmFormula, 
      femaleRef.weight, 
      femaleRef.height, 
      'female', 
      formulaSelection.age, 
      formulaSelection.ethnicity
    )
  };
  
  // 2. Back-calculate absolute values from indexed references
  // Using 95th percentile (mean + 1.65*SD) for upper normal limit
  const maleIndexed = measurement.male.bsa.mean + 1.65 * measurement.male.bsa.sd;
  const femaleIndexed = measurement.female.bsa.mean + 1.65 * measurement.female.bsa.sd;
  
  const maleAbsolute = maleIndexed * malePopulation.bsa;
  const femaleAbsolute = femaleIndexed * femalePopulation.bsa;
  
  // 3. Calculate individual LBM coefficients (Dewey methodology)
  const maleCoefficient = maleAbsolute / Math.pow(malePopulation.lbm, expectedExponent);
  const femaleCoefficient = femaleAbsolute / Math.pow(femalePopulation.lbm, expectedExponent);
  
  // 4. Calculate universal coefficient (average)
  const universalCoefficient = (maleCoefficient + femaleCoefficient) / 2;
  
  // 5. Calculate similarity metrics
  const absoluteDifference = Math.abs(maleCoefficient - femaleCoefficient);
  const relativeDifference = (absoluteDifference / Math.max(maleCoefficient, femaleCoefficient)) * 100;
  const similarity = Math.max(0, 100 - relativeDifference);
  
  return {
    measurement,
    referencePopulations: {
      male: malePopulation,
      female: femalePopulation
    },
    backCalculatedAbsolutes: {
      male: maleAbsolute,
      female: femaleAbsolute
    },
    individualCoefficients: {
      male: maleCoefficient,
      female: femaleCoefficient
    },
    universalCoefficient,
    similarity: {
      absolute: absoluteDifference,
      percentage: similarity
    },
    expectedExponent
  };
};

// =============================================================================
// CHART DATA GENERATION (Updated to use FormulaSelectionState)
// =============================================================================

/**
 * Generate clean biological dataset for each sex
 */
const generateBiologicalDataset = (
  sex: Sex,
  universalCoefficient: number,
  expectedExponent: number,
  formulaSelection: FormulaSelectionState
) => {
  const data = [];
  const targetBMI = 24; // Fixed BMI for clean curves
  
  // Height range 120-220cm in 2cm steps
  for (let height = 120; height <= 220; height += 2) {
    const weight = targetBMI * Math.pow(height / 100, 2);
    const bsa = calculateBSA(formulaSelection.bsaFormula, weight, height);
    const lbm = calculateLBM(
      formulaSelection.lbmFormula, 
      weight, 
      height, 
      sex, 
      formulaSelection.age, 
      formulaSelection.ethnicity
    );
    const measurementValue = universalCoefficient * Math.pow(lbm, expectedExponent);
    
    data.push({
      height,
      weight,
      bsa,
      lbm,
      measurementValue
    });
  }
  
  return data;
};

/**
 * Generate chart data for visualization using clean datasets
 */
const generateChartData = (
  transparencyData: TransparencyData, 
  formulaSelection: FormulaSelectionState
) => {
  const { universalCoefficient, expectedExponent, measurement } = transparencyData;
  
  // Generate clean biological datasets
  const maleData = generateBiologicalDataset('male', universalCoefficient, expectedExponent, formulaSelection);
  const femaleData = generateBiologicalDataset('female', universalCoefficient, expectedExponent, formulaSelection);
  
  // Calculate 95th percentile slopes for ratiometric comparison
  const male95thPercentile = measurement.male.bsa.mean + 1.65 * measurement.male.bsa.sd;
  const female95thPercentile = measurement.female.bsa.mean + 1.65 * measurement.female.bsa.sd;
  
  // Create chart data by combining biological points with ratiometric lines
  const data = [];
  
  // Generate BSA range for ratiometric lines
  for (let bsa = 0; bsa <= 3.5; bsa += 0.05) {
    const dataPoint: any = { bsa };
    
    // Ratiometric lines (straight lines through origin)
    dataPoint.ratiometricMale = male95thPercentile * bsa;
    dataPoint.ratiometricFemale = female95thPercentile * bsa;
    
    // Add biological data points where available
    const closestMale = maleData.find(p => Math.abs(p.bsa - bsa) < 0.025);
    const closestFemale = femaleData.find(p => Math.abs(p.bsa - bsa) < 0.025);
    
    if (closestMale) {
      dataPoint.biologicalMale = closestMale.measurementValue;
    }
    
    if (closestFemale) {
      dataPoint.biologicalFemale = closestFemale.measurementValue;
    }
    
    data.push(dataPoint);
  }
  
  return data;
};

// =============================================================================
// FORMATTING UTILITIES
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
// MAIN COMPONENT
// =============================================================================

const RatiometricVsBiological: React.FC = () => {
  // State
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('lvdd');
  const [showTransparency, setShowTransparency] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  
  // Use the new formula selection hook
  const { selection: formulaSelection, callbacks: formulaCallbacks } = useFormulaSelection();
  
  // Get current measurement
  const measurement = STROM_MEASUREMENTS.find(m => m.id === selectedMeasurementId);
  
  // Memoized calculations
  const { transparencyData, chartData, referencePopulation } = useMemo(() => {
    if (!measurement) {
      return { transparencyData: null, chartData: [], referencePopulation: null };
    }
    
    const transparency = calculateTransparencyData(measurement, formulaSelection);
    const data = generateChartData(transparency, formulaSelection);
    
    // Prepare reference population data for FormulaValuesDisplay
    const refPop = {
      male: {
        height: transparency.referencePopulations.male.height,
        weight: transparency.referencePopulations.male.weight,
        bsa: transparency.referencePopulations.male.bsa,
        lbm: transparency.referencePopulations.male.lbm
      },
      female: {
        height: transparency.referencePopulations.female.height,
        weight: transparency.referencePopulations.female.weight,
        bsa: transparency.referencePopulations.female.bsa,
        lbm: transparency.referencePopulations.female.lbm
      }
    };
    
    return {
      transparencyData: transparency,
      chartData: data,
      referencePopulation: refPop
    };
  }, [measurement, formulaSelection]);
  
  if (!measurement || !transparencyData || !referencePopulation) {
    return <div>Measurement not found</div>;
  }
  
  // Calculate ratiometric comparison metrics using 95th percentile
  const ratiometricSlopeMale = measurement.male.bsa.mean + 1.65 * measurement.male.bsa.sd;
  const ratiometricSlopeFemale = measurement.female.bsa.mean + 1.65 * measurement.female.bsa.sd;
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
      
      {/* Universal Coefficient Summary */}
      <section className="universal-coefficient">
        <div>
          <h3 style={{ margin: 0 }}>Universal LBM Coefficient</h3>
          <div className="coefficient-value">
            {formatCoefficient(transparencyData.universalCoefficient, measurement.type)} {measurement.absoluteUnit}/kg^{transparencyData.expectedExponent}
          </div>
        </div>
        <div className="similarity-score">
          <div className="similarity-value">
            {transparencyData.similarity.percentage.toFixed(1)}%
          </div>
          <small>Sex Similarity</small>
        </div>
      </section>
      
      {/* Transparency Panel */}
      {showTransparency && (
        <section className="transparency-panel">
          <hgroup>
            <h3>🔍 Full Transparency: Universal Coefficient Genesis</h3>
            <p>
              This is the complete step-by-step calculation of how we derive the universal LBM coefficient 
              using the Dewey methodology. Every number is shown so you can verify the math.
            </p>
          </hgroup>
          
          <div className="metrics-grid">
            {/* Step 1: Reference Populations */}
            <article>
              <header>
                <h4>Step 1: Reference Populations</h4>
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
                <h5>Published Reference (95th percentile):</h5>
                <dl>
                  <dt>Male:</dt>
                  <dd className="coefficient-display">
                    {(measurement.male.bsa.mean + 1.65 * measurement.male.bsa.sd).toFixed(3)} {measurement.getIndexedUnit('bsa')}
                  </dd>
                  <dt>Female:</dt>
                  <dd className="coefficient-display">
                    {(measurement.female.bsa.mean + 1.65 * measurement.female.bsa.sd).toFixed(3)} {measurement.getIndexedUnit('bsa')}
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
              Both approaches use 95th percentile reference points for fair comparison. Biological curves shown for realistic population range (BSA 1.0-3.2 m², heights 120-220cm).
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
            <dt>Male slope (95th percentile):</dt>
            <dd className="coefficient-display">{ratiometricSlopeMale.toFixed(3)}</dd>
            <dt>Female slope (95th percentile):</dt>
            <dd className="coefficient-display">{ratiometricSlopeFemale.toFixed(3)}</dd>
            <dt>Sex difference:</dt>
            <dd className="status-error">{ratiometricRelativeDiff.toFixed(1)}%</dd>
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
                Male ratiometric ({formulaSelection.bsaFormula.toUpperCase()} BSA 95th percentile)
              </dt>
              <dt style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '1.5rem', height: '2px', backgroundColor: '#f87171', marginRight: '0.5rem', borderTop: '2px dashed #f87171' }}></div>
                Female ratiometric ({formulaSelection.bsaFormula.toUpperCase()} BSA 95th percentile)
              </dt>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RatiometricVsBiological;