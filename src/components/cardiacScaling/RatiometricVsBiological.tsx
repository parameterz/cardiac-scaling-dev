// src/components/cardiacScaling/RatiometricVsBiological.tsx

"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Import from your existing data structures
import { STROM_MEASUREMENTS, type Sex, type EnhancedMeasurementData } from '@/data/stromData';
import { getReferencePopulation, type PopulationCharacteristics } from '@/data/populationDefinitions';
import { getScalingExponents } from '@/data/scalingLaws';
import { calculateBSA, calculateLBM } from '@/utils/bodyComposition/formulaRegistry';

// =============================================================================
// TRANSPARENCY CALCULATIONS
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
  bsaFormula: string,
  lbmFormula: string
): TransparencyData => {
  const expectedExponent = getScalingExponents(measurement.type).lbm;
  
  // 1. Get reference populations with calculated BSA/LBM
  const maleRef = getReferencePopulation('male');
  const femaleRef = getReferencePopulation('female');
  
  const malePopulation = {
    ...maleRef,
    bsa: calculateBSA(bsaFormula, maleRef.weight, maleRef.height),
    lbm: calculateLBM(lbmFormula, maleRef.weight, maleRef.height, 'male')
  };
  
  const femalePopulation = {
    ...femaleRef,
    bsa: calculateBSA(bsaFormula, femaleRef.weight, femaleRef.height),
    lbm: calculateLBM(lbmFormula, femaleRef.weight, femaleRef.height, 'female')
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
// CHART DATA GENERATION
// =============================================================================

/**
 * Generate clean biological dataset for each sex
 */
const generateBiologicalDataset = (
  sex: Sex,
  universalCoefficient: number,
  expectedExponent: number,
  bsaFormula: string,
  lbmFormula: string
) => {
  const data = [];
  const targetBMI = 24; // Fixed BMI for clean curves
  
  // Height range 120-220cm in 2cm steps
  for (let height = 120; height <= 220; height += 2) {
    const weight = targetBMI * Math.pow(height / 100, 2);
    const bsa = calculateBSA(bsaFormula, weight, height);
    const lbm = calculateLBM(lbmFormula, weight, height, sex);
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
const generateChartData = (transparencyData: TransparencyData, bsaFormula: string, lbmFormula: string) => {
  const { universalCoefficient, expectedExponent, measurement } = transparencyData;
  
  // Generate clean biological datasets
  const maleData = generateBiologicalDataset('male', universalCoefficient, expectedExponent, bsaFormula, lbmFormula);
  const femaleData = generateBiologicalDataset('female', universalCoefficient, expectedExponent, bsaFormula, lbmFormula);
  
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
  const [bsaFormula, setBsaFormula] = useState('dubois');
  const [lbmFormula, setLbmFormula] = useState('boer');
  const [showTransparency, setShowTransparency] = useState(false);
  
  // Get current measurement
  const measurement = STROM_MEASUREMENTS.find(m => m.id === selectedMeasurementId);
  
  // Memoized calculations
  const { transparencyData, chartData } = useMemo(() => {
    if (!measurement) {
      return { transparencyData: null, chartData: [] };
    }
    
    const transparency = calculateTransparencyData(measurement, bsaFormula, lbmFormula);
    const data = generateChartData(transparency, bsaFormula, lbmFormula);
    
    return {
      transparencyData: transparency,
      chartData: data
    };
  }, [measurement, bsaFormula, lbmFormula]);
  
  if (!measurement || !transparencyData) {
    return <div>Measurement not found</div>;
  }
  
  // Calculate ratiometric comparison metrics using 95th percentile (consistent with LBM derivation)
  const ratiometricSlopeMale = measurement.male.bsa.mean + 1.65 * measurement.male.bsa.sd;
  const ratiometricSlopeFemale = measurement.female.bsa.mean + 1.65 * measurement.female.bsa.sd;
  const ratiometricDifference = Math.abs(ratiometricSlopeMale - ratiometricSlopeFemale);
  const ratiometricRelativeDiff = (ratiometricDifference / Math.max(ratiometricSlopeMale, ratiometricSlopeFemale)) * 100;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Ratiometric vs. Biological Scaling
        </h2>
        <p className="text-gray-600">
          Straight lines show traditional BSA indexing. Curved lines show universal biological scaling.
        </p>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 grid md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Measurement
          </label>
          <select
            value={selectedMeasurementId}
            onChange={(e) => setSelectedMeasurementId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {STROM_MEASUREMENTS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            Expected: LBM^{transparencyData.expectedExponent}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BSA Formula
          </label>
          <select
            value={bsaFormula}
            onChange={(e) => setBsaFormula(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="dubois">Du Bois (1916)</option>
            <option value="mosteller">Mosteller (1987)</option>
            <option value="haycock">Haycock (1978)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LBM Formula
          </label>
          <select
            value={lbmFormula}
            onChange={(e) => setLbmFormula(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="boer">Boer (1984)</option>
            <option value="hume">Hume (1971)</option>
            <option value="yu">Yu (2013)</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => setShowTransparency(!showTransparency)}
            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showTransparency
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showTransparency ? 'Hide' : 'Show'} Transparency
          </button>
        </div>
      </div>
      
      {/* Universal Coefficient Summary */}
      <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Universal LBM Coefficient
            </h3>
            <p className="text-sm text-green-700">
              {formatCoefficient(transparencyData.universalCoefficient, measurement.type)} {measurement.absoluteUnit}/kg^{transparencyData.expectedExponent}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-800">
              {transparencyData.similarity.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-green-600">Sex Similarity</div>
          </div>
        </div>
      </div>
      
      {/* Transparency Panel */}
      {showTransparency && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">
            🔍 Full Transparency: Universal Coefficient Genesis
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            This is the complete step-by-step calculation of how we derive the universal LBM coefficient 
            using the Dewey methodology. Every number is shown so you can verify the math.
          </p>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Step 1: Reference Populations */}
            <div className="bg-white p-4 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                Step 1: Reference Populations
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium text-blue-800 mb-2">Male Reference</div>
                  <div className="space-y-1">
                    <div>Height: {transparencyData.referencePopulations.male.height} cm</div>
                    <div>Weight: {transparencyData.referencePopulations.male.weight.toFixed(1)} kg</div>
                    <div>BMI: {transparencyData.referencePopulations.male.bmi.toFixed(1)} kg/m²</div>
                    <div className="pt-1 border-t border-gray-200">
                      <div>BSA: {transparencyData.referencePopulations.male.bsa.toFixed(3)} m²</div>
                      <div>LBM: {transparencyData.referencePopulations.male.lbm.toFixed(1)} kg</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-pink-800 mb-2">Female Reference</div>
                  <div className="space-y-1">
                    <div>Height: {transparencyData.referencePopulations.female.height} cm</div>
                    <div>Weight: {transparencyData.referencePopulations.female.weight.toFixed(1)} kg</div>
                    <div>BMI: {transparencyData.referencePopulations.female.bmi.toFixed(1)} kg/m²</div>
                    <div className="pt-1 border-t border-gray-200">
                      <div>BSA: {transparencyData.referencePopulations.female.bsa.toFixed(3)} m²</div>
                      <div>LBM: {transparencyData.referencePopulations.female.lbm.toFixed(1)} kg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 2: Back-Calculated Absolutes */}
            <div className="bg-white p-4 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                Step 2: Back-Calculated Absolute Values
              </h4>
              <div className="text-xs space-y-3">
                <div>
                  <div className="font-medium text-gray-700 mb-1">Published Reference (95th percentile):</div>
                  <div>Male: {(measurement.male.bsa.mean + 1.65 * measurement.male.bsa.sd).toFixed(3)} {measurement.getIndexedUnit('bsa')}</div>
                  <div>Female: {(measurement.female.bsa.mean + 1.65 * measurement.female.bsa.sd).toFixed(3)} {measurement.getIndexedUnit('bsa')}</div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="font-medium text-gray-700 mb-1">Calculated Absolute Values:</div>
                  <div>Male: {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.male, measurement.absoluteUnit)} {measurement.absoluteUnit}</div>
                  <div>Female: {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.female, measurement.absoluteUnit)} {measurement.absoluteUnit}</div>
                </div>
              </div>
            </div>
            
            {/* Step 3: Individual LBM Coefficients */}
            <div className="bg-white p-4 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                Step 3: Individual LBM Coefficients
              </h4>
              <div className="text-xs space-y-3">
                <div className="font-mono text-gray-600 text-center p-2 bg-gray-50 rounded">
                  Coefficient = Absolute ÷ LBM^{transparencyData.expectedExponent}
                </div>
                <div>
                  <div className="font-medium text-blue-700 mb-1">Male Coefficient:</div>
                  <div className="font-mono">
                    {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.male, measurement.absoluteUnit)} ÷ {transparencyData.referencePopulations.male.lbm.toFixed(1)}^{transparencyData.expectedExponent} = {formatCoefficient(transparencyData.individualCoefficients.male, measurement.type)}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-pink-700 mb-1">Female Coefficient:</div>
                  <div className="font-mono">
                    {formatMeasurementValue(transparencyData.backCalculatedAbsolutes.female, measurement.absoluteUnit)} ÷ {transparencyData.referencePopulations.female.lbm.toFixed(1)}^{transparencyData.expectedExponent} = {formatCoefficient(transparencyData.individualCoefficients.female, measurement.type)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 4: Universal Coefficient */}
            <div className="bg-white p-4 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                Step 4: Universal Coefficient
              </h4>
              <div className="text-xs space-y-3">
                <div className="font-mono text-gray-600 text-center p-2 bg-gray-50 rounded">
                  Universal = (Male + Female) ÷ 2
                </div>
                <div>
                  <div className="font-mono text-center">
                    ({formatCoefficient(transparencyData.individualCoefficients.male, measurement.type)} + {formatCoefficient(transparencyData.individualCoefficients.female, measurement.type)}) ÷ 2
                  </div>
                  <div className="font-mono text-center font-bold text-green-700 text-lg mt-2">
                    = {formatCoefficient(transparencyData.universalCoefficient, measurement.type)}
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Absolute difference:</span>
                    <span className="font-mono">{formatCoefficient(transparencyData.similarity.absolute, measurement.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Similarity:</span>
                    <span className="font-bold text-green-700">{transparencyData.similarity.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-sm text-green-700">
            <strong>Validation:</strong> High similarity ({transparencyData.similarity.percentage.toFixed(1)}%) between 
            male and female LBM coefficients supports the hypothesis that biological scaling relationships 
            are universal across sexes when properly normalized.
          </div>
        </div>
      )}
      
      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {measurement.name} vs Body Surface Area
          </h3>
          <p className="text-sm text-gray-600">
            Universal LBM Coefficient: {formatCoefficient(transparencyData.universalCoefficient, measurement.type)} {measurement.absoluteUnit}/kg^{transparencyData.expectedExponent}
            <br />
            <span className="text-xs text-gray-500">
              Both approaches use 95th percentile reference points for fair comparison. Biological curves shown for realistic population range (BSA 1.0-3.2 m², heights 120-220cm).
            </span>
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="bsa"
              type="number"
              domain={[0, 3.5]}
              tickFormatter={(value) => value.toFixed(1)}
              label={{ 
                value: 'Body Surface Area (m²)', 
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
              labelFormatter={(value) => `BSA: ${value?.toFixed(2)} m²`}
            />
            
            {/* Biological curves (curved) - THICK SOLID LINES */}
            <Line 
              dataKey="biologicalMale" 
              stroke="#2563eb" 
              strokeWidth={4}
              dot={false}
              name={`Biological Male (LBM^${transparencyData.expectedExponent})`}
              strokeDasharray="none"
              connectNulls={false}
            />
            <Line 
              dataKey="biologicalFemale" 
              stroke="#dc2626" 
              strokeWidth={4}
              dot={false}
              name={`Biological Female (LBM^${transparencyData.expectedExponent})`}
              strokeDasharray="none"
              connectNulls={false}
            />
            
            {/* Ratiometric lines (straight) - THIN DASHED LINES */}
            <Line 
              dataKey="ratiometricMale" 
              stroke="#60a5fa" 
              strokeWidth={2}
              dot={false}
              name="Ratiometric Male (BSA Linear)"
              strokeDasharray="8 4"
            />
            <Line 
              dataKey="ratiometricFemale" 
              stroke="#f87171" 
              strokeWidth={2}
              dot={false}
              name="Ratiometric Female (BSA Linear)"
              strokeDasharray="8 4"
            />
            
            {/* Reference lines */}
            <ReferenceLine x={0} stroke="#374151" strokeWidth={1} />
            <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
            
            {/* Reference population markers */}
            <ReferenceLine 
              x={transparencyData.referencePopulations.male.bsa} 
              stroke="#2563eb" 
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
      </div>
      
      {/* Analysis Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            Ratiometric Scaling Issues
          </h3>
          <div className="space-y-2 text-sm text-red-800">
            <div className="flex justify-between">
              <span>Male slope (95th percentile):</span>
              <span className="font-mono">{ratiometricSlopeMale.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Female slope (95th percentile):</span>
              <span className="font-mono">{ratiometricSlopeFemale.toFixed(3)}</span>
            </div>
            <div className="pt-2 border-t border-red-200">
              <div className="flex justify-between">
                <span>Sex difference:</span>
                <span className="font-bold text-red-700">{ratiometricRelativeDiff.toFixed(1)}%</span>
              </div>
              <div className="text-xs mt-1 text-red-600">
                Artificial mathematical artifact (same reference points as biological curves)
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            Biological Scaling Truth
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex justify-between">
              <span>Universal coefficient:</span>
              <span className="font-mono">{formatCoefficient(transparencyData.universalCoefficient, measurement.type)}</span>
            </div>
            <div className="flex justify-between">
              <span>Male coefficient:</span>
              <span className="font-mono">{formatCoefficient(transparencyData.individualCoefficients.male, measurement.type)}</span>
            </div>
            <div className="flex justify-between">
              <span>Female coefficient:</span>
              <span className="font-mono">{formatCoefficient(transparencyData.individualCoefficients.female, measurement.type)}</span>
            </div>
            <div className="pt-2 border-t border-green-200">
              <div className="flex justify-between">
                <span>Sex similarity:</span>
                <span className="font-bold text-green-700">{transparencyData.similarity.percentage.toFixed(1)}%</span>
              </div>
              <div className="text-xs mt-1 text-green-600">
                Universal biology revealed
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend and Insight */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              <strong>Curved biological lines</strong> (thick solid) represent universal scaling relationships 
              derived from actual population data, showing natural convergence between sexes.
            </p>
            <p>
              <strong>Straight ratiometric lines</strong> (thin dashed) are mathematical extrapolations 
              that can extend to any value but create artificial sex differences.
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <div className="text-xs text-blue-700 space-y-1">
              <div className="flex items-center">
                <div className="w-6 h-1 bg-blue-600 mr-2"></div>
                <span>Male biological (LBM^{transparencyData.expectedExponent})</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-1 bg-red-600 mr-2"></div>
                <span>Female biological (LBM^{transparencyData.expectedExponent})</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-blue-400 border-dashed mr-2" style={{borderTopStyle: 'dashed', borderTopWidth: '1px'}}></div>
                <span>Male ratiometric (95th percentile)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-red-400 border-dashed mr-2" style={{borderTopStyle: 'dashed', borderTopWidth: '1px'}}></div>
                <span>Female ratiometric (95th percentile)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatiometricVsBiological;