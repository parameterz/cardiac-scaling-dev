// src/components/cardiacScaling/RatiometricVsBiological.tsx

"use client";
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Import from your existing data structures
import { STROM_MEASUREMENTS } from '@/data/stromData';
import { 
  generateChartData,
  generateReferencePoints,
  calculateUniversalLBMCoefficient,
  formatCoefficient,
  type ChartDataPoint,
  type ReferencePoint
} from './visualization/CurveGenerator';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const RatiometricVsBiological: React.FC = () => {
  // State
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('lvdd');
  const [bsaFormula, setBsaFormula] = useState('dubois');
  const [lbmFormula, setLbmFormula] = useState('boer');
  
  // Get current measurement
  const measurement = STROM_MEASUREMENTS.find(m => m.id === selectedMeasurementId);
  
  // Memoized calculations
  const { universalCoeff, chartData, referencePoints } = useMemo(() => {
    if (!measurement) {
      return { universalCoeff: 0, chartData: [], referencePoints: [] };
    }
    
    const coeff = calculateUniversalLBMCoefficient(measurement, bsaFormula, lbmFormula);
    const data = generateChartData(measurement, coeff);
    const refs = generateReferencePoints(measurement, coeff, bsaFormula, lbmFormula);
    
    return {
      universalCoeff: coeff,
      chartData: data,
      referencePoints: refs
    };
  }, [measurement, bsaFormula, lbmFormula]);
  
  if (!measurement) {
    return <div>Measurement not found</div>;
  }
  
  // Calculate key metrics
  const refMale = referencePoints.find(p => p.sex === 'male');
  const refFemale = referencePoints.find(p => p.sex === 'female');
  
  const ratiometricSlopeMale = measurement.male.bsa.mean;
  const ratiometricSlopeFemale = measurement.female.bsa.mean;
  const ratiometricDifference = Math.abs(ratiometricSlopeMale - ratiometricSlopeFemale);
  const ratiometricRelativeDiff = (ratiometricDifference / Math.max(ratiometricSlopeMale, ratiometricSlopeFemale)) * 100;
  
  // Get biological convergence metric
  const biologicalConvergence = refMale && refFemale ? 
    100 - (Math.abs(refMale.measurement - refFemale.measurement) / Math.max(refMale.measurement, refFemale.measurement)) * 100 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Ratiometric vs. Biological Scaling
        </h2>
        <p className="text-gray-600">
          Straight lines show traditional BSA indexing. Curved lines show universal biological scaling.
        </p>
      </div>
      
      {/* Simple Controls */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 grid md:grid-cols-3 gap-4">
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
            Expected: LBM^{measurement.type === 'linear' ? '0.33' : measurement.type === 'area' ? '0.67' : '1.0'}
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
            <option value="dubois">Du Bois (1916) - Most cited</option>
            <option value="mosteller">Mosteller (1987) - Simple</option>
            <option value="haycock">Haycock (1978) - Pediatric</option>
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
            <option value="boer">Boer (1984) - Most common</option>
            <option value="hume">Hume (1971) - Classic</option>
            <option value="yu">Yu (2013) - BMI adjusted</option>
          </select>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {measurement.name} vs Body Surface Area
          </h3>
          <p className="text-sm text-gray-600">
            Universal LBM Coefficient: {formatCoefficient(universalCoeff, measurement.type)} {measurement.absoluteUnit}/kg^
            {measurement.type === 'linear' ? '0.33' : measurement.type === 'area' ? '0.67' : '1.0'}
            <br />
            <span className="text-xs text-gray-500">
              Biological curves shown only for population range (120-220cm heights)
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
                name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              ]}
              labelFormatter={(value) => `BSA: ${value?.toFixed(2)} m²`}
            />
            
            {/* Biological curves (curved) - THICK SOLID LINES, only where population data exists */}
            <Line 
              dataKey="biologicalMale" 
              stroke="#2563eb" 
              strokeWidth={4}
              dot={false}
              name="Biological Male (LBM^0.33)"
              strokeDasharray="none"
              connectNulls={false}
            />
            <Line 
              dataKey="biologicalFemale" 
              stroke="#dc2626" 
              strokeWidth={4}
              dot={false}
              name="Biological Female (LBM^0.33)"
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
            {refMale && (
              <ReferenceLine 
                x={refMale.bsa} 
                stroke="#2563eb" 
                strokeWidth={1} 
                strokeDasharray="2 2"
                label={{ value: "♂ Ref", position: "top", style: { fontSize: '12px' } }}
              />
            )}
            {refFemale && (
              <ReferenceLine 
                x={refFemale.bsa} 
                stroke="#dc2626" 
                strokeWidth={1} 
                strokeDasharray="2 2"
                label={{ value: "♀ Ref", position: "top", style: { fontSize: '12px' } }}
              />
            )}
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
              <span>Male slope (BSA linear):</span>
              <span className="font-mono">{ratiometricSlopeMale.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Female slope (BSA linear):</span>
              <span className="font-mono">{ratiometricSlopeFemale.toFixed(3)}</span>
            </div>
            <div className="pt-2 border-t border-red-200">
              <div className="flex justify-between">
                <span>Sex difference:</span>
                <span className="font-bold text-red-700">{ratiometricRelativeDiff.toFixed(1)}%</span>
              </div>
              <div className="text-xs mt-1 text-red-600">
                Artificial mathematical artifact
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
              <span className="font-mono">{formatCoefficient(universalCoeff, measurement.type)}</span>
            </div>
            <div className="flex justify-between">
              <span>Scaling type:</span>
              <span className="font-medium">{measurement.type}</span>
            </div>
            <div className="pt-2 border-t border-green-200">
              <div className="flex justify-between">
                <span>Sex convergence:</span>
                <span className="font-bold text-green-700">{biologicalConvergence.toFixed(1)}%</span>
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
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Insight</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              <strong>Curved biological lines</strong> (thick solid) are based on actual population data 
              (120-220cm heights) and show universal scaling relationships that converge between sexes.
            </p>
            <p>
              <strong>Straight ratiometric lines</strong> (thin dashed) are mathematical extrapolations 
              that can extend anywhere but create artificial sex differences throughout the range.
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <div className="text-xs text-blue-700 space-y-1">
              <div className="flex items-center">
                <div className="w-6 h-1 bg-blue-600 mr-2"></div>
                <span>Male biological (LBM^{measurement.type === 'linear' ? '0.33' : measurement.type === 'area' ? '0.67' : '1.0'})</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-1 bg-red-600 mr-2"></div>
                <span>Female biological (LBM^{measurement.type === 'linear' ? '0.33' : measurement.type === 'area' ? '0.67' : '1.0'})</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-blue-400 border-dashed mr-2" style={{borderTopStyle: 'dashed', borderTopWidth: '1px'}}></div>
                <span>Male ratiometric (BSA linear)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-0.5 bg-red-400 border-dashed mr-2" style={{borderTopStyle: 'dashed', borderTopWidth: '1px'}}></div>
                <span>Female ratiometric (BSA linear)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formula Impact Notice */}
      {(bsaFormula === 'dubois' || lbmFormula === 'boer') && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          <strong>Historical Note:</strong> You're using {bsaFormula === 'dubois' ? 'the 1916 Du Bois BSA formula' : ''}
          {bsaFormula === 'dubois' && lbmFormula === 'boer' ? ' and ' : ''}
          {lbmFormula === 'boer' ? 'the 1984 Boer LBM formula' : ''}. 
          Notice how universal scaling relationships remain robust across different computational methods, 
          validating the underlying biological principles.
        </div>
      )}
    </div>
  );
};

export default RatiometricVsBiological;