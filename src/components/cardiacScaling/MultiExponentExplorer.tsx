"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// src/components/cardiacScaling/MultiExponentScalingExplorer.tsx

// Universal scaling exponents based on dimensional analysis
const SCALING_EXPONENTS = {
  linear: { lbm: 0.33, bsa: 0.5, height: 1.0 },
  mass_volume: { lbm: 1.0, bsa: 1.5, height: 2.1 }
};

interface MeasurementDefinition {
  id: string;
  name: string;
  type: 'linear' | 'mass_volume';
  unit: string;
  referenceData: {
    [demographic: string]: {
      mean: number;
      sd: number;
      indexType: 'bsa' | 'height';
    };
  };
}

interface FormulaDefinition {
  id: string;
  name: string;
  calculate: (height: number, weight: number, sex?: string) => number;
}

// Helper function to get expected exponents for a measurement type
const getExpectedExponents = (measurementType: 'linear' | 'mass_volume') => {
  return SCALING_EXPONENTS[measurementType];
};

// Sample data - would come from your data layer
const MEASUREMENTS: MeasurementDefinition[] = [
  {
    id: 'lvdd',
    name: 'LV End-Diastolic Dimension',
    type: 'linear',
    unit: 'cm',
    referenceData: {
      'male': { mean: 2.3, sd: 0.3, indexType: 'bsa' },
      'female': { mean: 2.4, sd: 0.3, indexType: 'bsa' }
    }
  },
  {
    id: 'ivsd',
    name: 'Interventricular Septal Thickness',
    type: 'linear',
    unit: 'cm',
    referenceData: {
      'male': { mean: 0.61, sd: 0.11, indexType: 'bsa' },
      'female': { mean: 0.60, sd: 0.13, indexType: 'bsa' }
    }
  },
  {
    id: 'lvm',
    name: 'LV Mass',
    type: 'mass_volume',
    unit: 'g',
    referenceData: {
      'male': { mean: 84.8, sd: 17.7, indexType: 'bsa' },
      'female': { mean: 72.2, sd: 15.3, indexType: 'bsa' }
    }
  }
];

const BSA_FORMULAS: FormulaDefinition[] = [
  {
    id: 'dubois',
    name: 'Du Bois & Du Bois (1916)',
    calculate: (h, w) => 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425)
  },
  {
    id: 'mosteller',
    name: 'Mosteller (1987)',
    calculate: (h, w) => Math.sqrt((h * w) / 3600)
  }
];

const LBM_FORMULAS: FormulaDefinition[] = [
  {
    id: 'boer',
    name: 'Boer (1984)',
    calculate: (h, w, sex) => sex === 'male' 
      ? (0.407 * w) + (0.267 * h) - 19.2
      : (0.252 * w) + (0.473 * h) - 48.3
  },
  {
    id: 'hume',
    name: 'Hume & Weyers (1971)',
    calculate: (h, w, sex) => sex === 'male'
      ? (0.32810 * w) + (0.33929 * h) - 29.5336
      : (0.29569 * w) + (0.41813 * h) - 43.2933
  }
];

const MultiExponentScalingExplorer = () => {
  // Configuration state
  const [selectedMeasurement, setSelectedMeasurement] = useState('lvdd');
  const [selectedBSAFormula, setSelectedBSAFormula] = useState('dubois');
  const [selectedLBMFormula, setSelectedLBMFormula] = useState('boer');
  
  // Exponent state
  const [exponents, setExponents] = useState({
    bsa: 0.5,
    lbm: 0.33,
    height: 1.0
  });
  
  // Active scaling variable
  const [activeVariable, setActiveVariable] = useState<'bsa' | 'lbm' | 'height'>('bsa');
  
  // Reference population
  const referenceHeights = { male: 178, female: 164 };
  const targetBMI = 24;
  const weights = {
    male: targetBMI * Math.pow(referenceHeights.male / 100, 2),
    female: targetBMI * Math.pow(referenceHeights.female / 100, 2)
  };
  
  // Get current measurement and formulas
  const currentMeasurement = MEASUREMENTS.find(m => m.id === selectedMeasurement);
  const bsaFormula = BSA_FORMULAS.find(f => f.id === selectedBSAFormula);
  const lbmFormula = LBM_FORMULAS.find(f => f.id === selectedLBMFormula);
  
  if (!currentMeasurement || !bsaFormula || !lbmFormula) {
    return <div>Loading...</div>;
  }
  
  // Calculate body composition values
  const bsaValues = {
    male: bsaFormula.calculate(referenceHeights.male, weights.male),
    female: bsaFormula.calculate(referenceHeights.female, weights.female)
  };
  
  const lbmValues = {
    male: lbmFormula.calculate(referenceHeights.male, weights.male, 'male'),
    female: lbmFormula.calculate(referenceHeights.female, weights.female, 'female')
  };
  
  const heightValues = {
    male: referenceHeights.male / 100,
    female: referenceHeights.female / 100
  };
  
  // Calculate absolute measurement values from indexed reference data
  const absoluteValues = useMemo(() => {
    const male = currentMeasurement.referenceData.male;
    const female = currentMeasurement.referenceData.female;
    
    const maleUpperLimit = male.mean + 1.65 * male.sd;
    const femaleUpperLimit = female.mean + 1.65 * female.sd;
    
    if (male.indexType === 'bsa') {
      return {
        male: maleUpperLimit * bsaValues.male,
        female: femaleUpperLimit * bsaValues.female
      };
    } else {
      return {
        male: maleUpperLimit * referenceHeights.male / 100,
        female: femaleUpperLimit * referenceHeights.female / 100
      };
    }
  }, [currentMeasurement, bsaValues]);
  
  // Get scaling variable values and transformed values
  const getScalingValues = (variable: 'bsa' | 'lbm' | 'height') => {
    const baseValues = variable === 'bsa' ? bsaValues : 
                      variable === 'lbm' ? lbmValues : heightValues;
    const exponent = exponents[variable];
    
    return {
      base: baseValues,
      transformed: {
        male: Math.pow(baseValues.male, exponent),
        female: Math.pow(baseValues.female, exponent)
      },
      exponent
    };
  };
  
  const currentScaling = getScalingValues(activeVariable);
  
  // Calculate slopes for current active variable
  const slopes = {
    male: absoluteValues.male / currentScaling.transformed.male,
    female: absoluteValues.female / currentScaling.transformed.female
  };
  
  const slopeDifference = Math.abs(slopes.male - slopes.female);
  const relativeSlopeDifference = (slopeDifference / Math.max(slopes.male, slopes.female)) * 100;
  
  // Generate chart data
  const chartData = useMemo(() => {
    const points = [];
    const maxX = Math.max(currentScaling.transformed.male, currentScaling.transformed.female) * 1.2;
    const steps = 50;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * maxX;
      points.push({
        x: x,
        maleLine: slopes.male * x,
        femaleLine: slopes.female * x
      });
    }
    
    return points;
  }, [currentScaling, slopes]);
  
  // Data points for visualization
  const dataPoints = [
    {
      sex: 'Male',
      x: currentScaling.transformed.male,
      y: absoluteValues.male,
      bsa: bsaValues.male,
      lbm: lbmValues.male,
      height: referenceHeights.male,
      weight: weights.male
    },
    {
      sex: 'Female',
      x: currentScaling.transformed.female,
      y: absoluteValues.female,
      bsa: bsaValues.female,
      lbm: lbmValues.female,
      height: referenceHeights.female,
      weight: weights.female
    }
  ];
  
  // Get insights based on current settings
  const getInsight = () => {
    const expected = getExpectedExponents(currentMeasurement.type)[activeVariable];
    const current = exponents[activeVariable];
    const diff = Math.abs(current - expected);
    
    if (diff < 0.1) {
      return {
        type: 'success',
        message: `🎯 Near optimal! ${activeVariable.toUpperCase()}^${current.toFixed(2)} closely matches the expected ${activeVariable.toUpperCase()}^${expected} for ${currentMeasurement.type} measurements.`
      };
    } else if (current < expected - 0.2) {
      return {
        type: 'warning',
        message: `Exponent too low. Try moving closer to ${activeVariable.toUpperCase()}^${expected} for optimal ${currentMeasurement.type} scaling.`
      };
    } else {
      return {
        type: 'warning',
        message: `Exponent too high. The expected value for ${currentMeasurement.type} measurements is ${activeVariable.toUpperCase()}^${expected}.`
      };
    }
  };
  
  const insight = getInsight();

  const getDimensionalText = () => {
    if (currentMeasurement.type === 'linear') {
      return 'Linear measurements (lengths) scale as LBM^0.33, BSA^0.5, Height^1.0';
    } else {
      return 'Mass/Volume measurements scale as LBM^1.0, BSA^1.5, Height^2.1 (note: empirically around 2, not 3 as pure geometry would suggest!)';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Universal Cardiac Scaling Explorer
        </h2>
        <p className="text-gray-600">
          Discover the optimal allometric relationships for cardiac measurements across different scaling variables and formula choices.
        </p>
      </div>
      
      {/* Configuration Panel */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 grid lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardiac Measurement
          </label>
          <select
            value={selectedMeasurement}
            onChange={(e) => setSelectedMeasurement(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {MEASUREMENTS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            Expected exponents: BSA^{getExpectedExponents(currentMeasurement.type).bsa}, 
            LBM^{getExpectedExponents(currentMeasurement.type).lbm}, 
            Height^{getExpectedExponents(currentMeasurement.type).height}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BSA Formula
          </label>
          <select
            value={selectedBSAFormula}
            onChange={(e) => setSelectedBSAFormula(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {BSA_FORMULAS.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            Male: {bsaValues.male.toFixed(2)} m², Female: {bsaValues.female.toFixed(2)} m²
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LBM Formula
          </label>
          <select
            value={selectedLBMFormula}
            onChange={(e) => setSelectedLBMFormula(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {LBM_FORMULAS.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            Male: {lbmValues.male.toFixed(1)} kg, Female: {lbmValues.female.toFixed(1)} kg
          </div>
        </div>
      </div>
      
      {/* Exponent Controls */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scaling Exponent Controls</h3>
        
        <div className="mb-4 p-3 bg-white rounded border-l-4 border-blue-500">
          <div className="text-sm text-gray-700">
            <strong>Dimensional Analysis:</strong> {getDimensionalText()}
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          {(['bsa', 'lbm', 'height'] as const).map(variable => (
            <button
              key={variable}
              onClick={() => setActiveVariable(variable)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeVariable === variable
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {variable.toUpperCase()}^{exponents[variable].toFixed(2)}
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 min-w-0">
              {activeVariable.toUpperCase()} Exponent:
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.01"
              value={exponents[activeVariable]}
              onChange={(e) => setExponents(prev => ({
                ...prev,
                [activeVariable]: parseFloat(e.target.value)
              }))}
              className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-lg font-bold text-blue-600 min-w-0">
              {exponents[activeVariable].toFixed(2)}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setExponents(prev => ({
                ...prev,
                [activeVariable]: getExpectedExponents(currentMeasurement.type)[activeVariable]
              }))}
              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
            >
              Optimal ({getExpectedExponents(currentMeasurement.type)[activeVariable]})
            </button>
            <button
              onClick={() => setExponents(prev => ({ ...prev, [activeVariable]: 1.0 }))}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Ratiometric (1.0)
            </button>
            {activeVariable === 'height' && currentMeasurement.type === 'mass_volume' && (
              <>
                <button
                  onClick={() => setExponents(prev => ({ ...prev, height: 3.0 }))}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                >
                  Geometric (3.0)
                </button>
                <button
                  onClick={() => setExponents(prev => ({ ...prev, height: 2.7 }))}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
                >
                  Literature (2.7)
                </button>
              </>
            )}
          </div>
          
          {activeVariable === 'height' && currentMeasurement.type === 'mass_volume' && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              <strong>Height Exponent Mystery:</strong> Pure geometric scaling would suggest Height^3.0 for volumes/masses, 
              but empirical studies find exponents around 1.6-2.7. This suggests cardiac size doesn't scale with 
              perfect geometric similarity - biology is more complex than simple scaling!
            </div>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMeasurement.name} vs {activeVariable.toUpperCase()}^{exponents[activeVariable].toFixed(2)}
          </h3>
          <p className="text-sm text-gray-600">
            Slope difference: {relativeSlopeDifference.toFixed(1)}% 
            {relativeSlopeDifference < 5 && <span className="text-green-600 ml-1">✓ Excellent convergence</span>}
          </p>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="x"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => value.toFixed(2)}
              label={{ 
                value: `${activeVariable.toUpperCase()}^${exponents[activeVariable].toFixed(2)}`, 
                position: 'insideBottom', 
                offset: -5 
              }}
            />
            <YAxis 
              domain={[0, 'dataMax']}
              label={{ 
                value: `${currentMeasurement.name} (${currentMeasurement.unit})`, 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              formatter={(value, name) => [typeof value === 'number' ? value.toFixed(3) : value, name]}
              labelFormatter={(value) => `${activeVariable.toUpperCase()}^${exponents[activeVariable].toFixed(2)}: ${value?.toFixed(3)}`}
            />
            
            <Line 
              dataKey="maleLine" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
              name="Male"
            />
            <Line 
              dataKey="femaleLine" 
              stroke="#ec4899" 
              strokeWidth={3}
              dot={false}
              name="Female"
            />
            
            <ReferenceLine x={0} stroke="#666" strokeWidth={1} />
            <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Analysis Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Scaling Analysis</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Male slope:</span>
              <span className="font-mono">{slopes.male.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-pink-700">Female slope:</span>
              <span className="font-mono">{slopes.female.toFixed(4)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-800">Difference:</span>
                <span className="font-bold">{relativeSlopeDifference.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">All Exponents Summary</h3>
          <div className="space-y-2 text-sm">
            {(['bsa', 'lbm', 'height'] as const).map(variable => {
              const scaling = getScalingValues(variable);
              const tempSlopes = {
                male: absoluteValues.male / scaling.transformed.male,
                female: absoluteValues.female / scaling.transformed.female
              };
              const tempDiff = Math.abs(tempSlopes.male - tempSlopes.female);
              const tempRelativeDiff = (tempDiff / Math.max(tempSlopes.male, tempSlopes.female)) * 100;
              
              return (
                <div key={variable} className={`flex justify-between p-2 rounded ${
                  activeVariable === variable ? 'bg-blue-200' : 'bg-white'
                }`}>
                  <span className="font-medium">{variable.toUpperCase()}^{exponents[variable].toFixed(2)}:</span>
                  <span className={`font-bold ${tempRelativeDiff < 5 ? 'text-green-600' : 'text-orange-600'}`}>
                    {tempRelativeDiff.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Insight Panel */}
      <div className={`p-4 rounded-lg border ${
        insight.type === 'success' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${
          insight.type === 'success' ? 'text-green-800' : 'text-yellow-800'
        }`}>
          Scaling Insight
        </h3>
        <p className={`text-sm ${
          insight.type === 'success' ? 'text-green-700' : 'text-yellow-700'
        }`}>
          {insight.message}
        </p>
        
        {activeVariable === 'lbm' && exponents.lbm > 0.25 && exponents.lbm < 0.4 && (
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
            <strong>Universal Biology Detected:</strong> The nearly identical slopes demonstrate that cardiac dimensions scale universally to LBM^0.33 regardless of sex - this is the fundamental biological relationship!
          </div>
        )}
        
        {activeVariable === 'height' && currentMeasurement.type === 'mass_volume' && exponents.height > 2.8 && (
          <div className="mt-3 p-3 bg-purple-100 border border-purple-300 rounded text-purple-700 text-sm">
            <strong>Geometric Scaling Breakdown:</strong> Height^{exponents.height.toFixed(1)} creates extreme male-female differences that don't match biological reality. 
            This demonstrates why cardiac mass doesn't follow pure geometric scaling laws.
          </div>
        )}
        
        {activeVariable === 'height' && currentMeasurement.type === 'mass_volume' && exponents.height > 1.8 && exponents.height < 2.3 && (
          <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded text-blue-700 text-sm">
            <strong>Empirical Sweet Spot:</strong> Height^{exponents.height.toFixed(1)} represents the empirically-derived scaling that best fits real cardiac data - 
            biological systems rarely follow perfect geometric similarity!
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiExponentScalingExplorer;