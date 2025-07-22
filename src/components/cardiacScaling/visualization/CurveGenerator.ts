// src/components/cardiacScaling/visualization/CurveGenerator.ts

import { calculateBSA, calculateLBM } from '@/utils/bodyComposition/formulaRegistry';
import { getReferencePopulation, POPULATION_GENERATION_RANGES } from '@/data/populationDefinitions';
import type { EnhancedMeasurementData } from '@/data/stromData';

export interface PopulationPoint {
  height: number;
  weight: number;
  bsa: number;
  lbm: number;
}

export interface ChartDataPoint {
  bsa: number;
  biologicalMale: number | undefined;  // undefined outside population range
  biologicalFemale: number | undefined;  // undefined outside population range
  ratiometricMale: number;
  ratiometricFemale: number;
}

export interface ReferencePoint {
  sex: 'male' | 'female';
  bsa: number;
  measurement: number;
  label: string;
}

/**
 * Generate height-based population data with fixed BMI
 * Uses POPULATION_GENERATION_RANGES for height span (120-220cm)
 * This creates a clean progression from short to tall adults at consistent BMI
 */
export const generateHeightBasedPopulation = (
  fixedBMI: number = 24,
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): { male: PopulationPoint[]; female: PopulationPoint[] } => {
  const populations = { male: [] as PopulationPoint[], female: [] as PopulationPoint[] };
  
  // Use the defined height range from populationDefinitions (120-220cm)
  const heightRange = POPULATION_GENERATION_RANGES.height;
  const step = heightRange.step || 2; // Default 2cm steps for smooth curves
  
  // Generate population across height range with fixed BMI
  for (let height = heightRange.min; height <= heightRange.max; height += step) {
    const weight = fixedBMI * Math.pow(height / 100, 2);
    
    (['male', 'female'] as const).forEach(sex => {
      const bsa = calculateBSA(bsaFormula, weight, height);
      const lbm = calculateLBM(lbmFormula, weight, height, sex);
      
      populations[sex].push({ height, weight, bsa, lbm });
    });
  }
  
  return populations;
};

/**
 * Calculate universal LBM coefficient using Dewey methodology
 * Back-calculates from reference indexed values to derive absolute values,
 * then averages male/female LBM coefficients to get universal coefficient
 */
export const calculateUniversalLBMCoefficient = (
  measurement: EnhancedMeasurementData,
  bsaFormula: string,
  lbmFormula: string
): number => {
  // Get canonical reference populations (178cm♂, 164cm♀, BMI 25)
  const maleRef = getReferencePopulation('male');
  const femaleRef = getReferencePopulation('female');
  
  // Calculate body composition for reference populations using selected formulas
  const maleBSA = calculateBSA(bsaFormula, maleRef.weight, maleRef.height);
  const femaleBSA = calculateBSA(bsaFormula, femaleRef.weight, femaleRef.height);
  const maleLBM = calculateLBM(lbmFormula, maleRef.weight, maleRef.height, 'male');
  const femaleLBM = calculateLBM(lbmFormula, femaleRef.weight, femaleRef.height, 'female');
  
  // Back-calculate absolute measurement values from BSA-indexed reference data
  // This reverses the indexing: absolute = indexed_value × BSA
  const maleAbsolute = measurement.male.bsa.mean * maleBSA;
  const femaleAbsolute = measurement.female.bsa.mean * femaleBSA;
  
  // Determine appropriate LBM exponent based on measurement type
  // Linear measurements (dimensions): LBM^0.33 (cube root scaling)
  // Area measurements: LBM^0.67 (2/3 power scaling) 
  // Mass/Volume measurements: LBM^1.0 (direct mass scaling)
  const lbmExponent = measurement.type === 'linear' ? 0.33 : 
                     measurement.type === 'area' ? 0.67 : 1.0;
  
  // Calculate LBM coefficients for each sex
  // Coefficient = absolute_value / LBM^exponent
  const maleLBMCoeff = maleAbsolute / Math.pow(maleLBM, lbmExponent);
  const femaleLBMCoeff = femaleAbsolute / Math.pow(femaleLBM, lbmExponent);
  
  // Universal coefficient is the average of male and female coefficients
  // This tests the hypothesis that LBM scaling should be universal across sexes
  return (maleLBMCoeff + femaleLBMCoeff) / 2;
};

/**
 * Generate chart data comparing biological vs ratiometric scaling
 * Biological curves based on height range (120-220cm) with fixed BMI
 * Ratiometric lines are mathematical and can extend from origin
 */
export const generateChartData = (
  measurement: EnhancedMeasurementData,
  universalCoeff: number,
  fixedBMI: number = 24,
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): ChartDataPoint[] => {
  
  // Generate height-based population with fixed BMI
  const populations = generateHeightBasedPopulation(fixedBMI, bsaFormula, lbmFormula);
  
  const lbmExponent = measurement.type === 'linear' ? 0.33 : 
                     measurement.type === 'area' ? 0.67 : 1.0;
  
  // Calculate biological predictions for actual population
  const biologicalPointsMale = populations.male.map(p => ({
    bsa: p.bsa,
    measurement: universalCoeff * Math.pow(p.lbm, lbmExponent),
    height: p.height
  }));
  
  const biologicalPointsFemale = populations.female.map(p => ({
    bsa: p.bsa,
    measurement: universalCoeff * Math.pow(p.lbm, lbmExponent),
    height: p.height
  }));
  
  // Sort by BSA for smooth curves
  biologicalPointsMale.sort((a, b) => a.bsa - b.bsa);
  biologicalPointsFemale.sort((a, b) => a.bsa - b.bsa);
  
  // Get BSA range from population data
  const allBSAs = [...biologicalPointsMale, ...biologicalPointsFemale].map(p => p.bsa);
  const minPopBSA = Math.min(...allBSAs);
  const maxPopBSA = Math.max(...allBSAs);
  const maxChartBSA = Math.max(3.5, maxPopBSA * 1.1);
  
  // Create chart data
  const chartData: ChartDataPoint[] = [];
  
  // Add origin point (only ratiometric lines start at origin)
  chartData.push({
    bsa: 0,
    biologicalMale: undefined,     // Biological data doesn't extend to origin
    biologicalFemale: undefined,   // Biological data doesn't extend to origin  
    ratiometricMale: 0,           // Mathematical line starts at origin
    ratiometricFemale: 0          // Mathematical line starts at origin
  });
  
  // Generate dense points for smooth visualization
  for (let bsa = 0.05; bsa <= maxChartBSA; bsa += 0.02) {
    // Ratiometric predictions (mathematical lines)
    const ratiometricMale = measurement.male.bsa.mean * bsa;
    const ratiometricFemale = measurement.female.bsa.mean * bsa;
    
    // Biological predictions (only within population range)
    let biologicalMale = undefined;
    let biologicalFemale = undefined;
    
    if (bsa >= minPopBSA && bsa <= maxPopBSA) {
      // Find closest population points for interpolation
      biologicalMale = interpolateFromPopulation(biologicalPointsMale, bsa);
      biologicalFemale = interpolateFromPopulation(biologicalPointsFemale, bsa);
    }
    
    chartData.push({
      bsa,
      biologicalMale,
      biologicalFemale,
      ratiometricMale,
      ratiometricFemale
    });
  }
  
  return chartData;
};

/**
 * Interpolate measurement value at target BSA from population data points
 */
function interpolateFromPopulation(
  points: Array<{bsa: number; measurement: number; height: number}>, 
  targetBSA: number
): number | undefined {
  if (points.length === 0) return undefined;
  
  // Find surrounding points
  let lowerPoint = null;
  let upperPoint = null;
  
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i].bsa <= targetBSA && points[i + 1].bsa >= targetBSA) {
      lowerPoint = points[i];
      upperPoint = points[i + 1];
      break;
    }
  }
  
  // If exact match or at boundaries
  if (!lowerPoint || !upperPoint) {
    const closest = points.reduce((prev, curr) => 
      Math.abs(curr.bsa - targetBSA) < Math.abs(prev.bsa - targetBSA) ? curr : prev
    );
    return Math.abs(closest.bsa - targetBSA) < 0.1 ? closest.measurement : undefined;
  }
  
  // Linear interpolation
  if (lowerPoint.bsa === upperPoint.bsa) {
    return lowerPoint.measurement;
  }
  
  const ratio = (targetBSA - lowerPoint.bsa) / (upperPoint.bsa - lowerPoint.bsa);
  return lowerPoint.measurement + ratio * (upperPoint.measurement - lowerPoint.measurement);
}

/**
 * Generate reference points for canonical populations (178cm♂, 164cm♀ at BMI 25)
 * These show where the established reference populations fall on both scaling approaches
 */
export const generateReferencePoints = (
  measurement: EnhancedMeasurementData,
  universalCoeff: number,
  bsaFormula: string,
  lbmFormula: string
): ReferencePoint[] => {
  const maleRef = getReferencePopulation('male');
  const femaleRef = getReferencePopulation('female');
  
  // Calculate body composition using selected formulas
  const maleBSA = calculateBSA(bsaFormula, maleRef.weight, maleRef.height);
  const femaleBSA = calculateBSA(bsaFormula, femaleRef.weight, femaleRef.height);
  const maleLBM = calculateLBM(lbmFormula, maleRef.weight, maleRef.height, 'male');
  const femaleLBM = calculateLBM(lbmFormula, femaleRef.weight, femaleRef.height, 'female');
  
  const lbmExponent = measurement.type === 'linear' ? 0.33 : 
                     measurement.type === 'area' ? 0.67 : 1.0;
  
  // Calculate biological predictions for reference populations
  const maleMeasurement = universalCoeff * Math.pow(maleLBM, lbmExponent);
  const femaleMeasurement = universalCoeff * Math.pow(femaleLBM, lbmExponent);
  
  return [
    {
      sex: 'male',
      bsa: maleBSA,
      measurement: maleMeasurement,
      label: `Male Ref (${maleRef.height}cm, BMI ${maleRef.bmi})`
    },
    {
      sex: 'female',
      bsa: femaleBSA,
      measurement: femaleMeasurement,
      label: `Female Ref (${femaleRef.height}cm, BMI ${femaleRef.bmi})`
    }
  ];
};

/**
 * Calculate metrics for comparing scaling approaches
 */
export const calculateScalingMetrics = (
  measurement: EnhancedMeasurementData,
  referencePoints: ReferencePoint[]
): {
  ratiometric: {
    maleslope: number;
    femaleSlope: number;
    difference: number;
    relativeDifference: number;
  };
  biological: {
    universalCoefficient: number;
    sexSimilarity: number;
  };
} => {
  // Ratiometric slopes (from BSA-indexed reference data)
  const maleSlope = measurement.male.bsa.mean;
  const femaleSlope = measurement.female.bsa.mean;
  const difference = Math.abs(maleSlope - femaleSlope);
  const relativeDifference = (difference / Math.max(maleSlope, femaleSlope)) * 100;
  
  // For biological metrics, we'd need the actual coefficient calculation
  // This is simplified for the bare bones version
  const maleRef = referencePoints.find(p => p.sex === 'male');
  const femaleRef = referencePoints.find(p => p.sex === 'female');
  
  const sexSimilarity = maleRef && femaleRef ? 
    1 - Math.abs(maleRef.measurement - femaleRef.measurement) / Math.max(maleRef.measurement, femaleRef.measurement) : 0;
  
  return {
    ratiometric: {
      maleslope: maleSlope,
      femaleSlope: femaleSlope,
      difference,
      relativeDifference
    },
    biological: {
      universalCoefficient: 0, // Would be calculated from coefficient generation
      sexSimilarity: sexSimilarity * 100 // Convert to percentage
    }
  };
};

/**
 * Utility function to get expected exponent for measurement type
 */
export const getExpectedLBMExponent = (measurementType: string): number => {
  switch (measurementType) {
    case 'linear': return 0.33;
    case 'area': return 0.67;
    case 'mass':
    case 'volume': return 1.0;
    default: return 0.33;
  }
};

/**
 * Format coefficient with appropriate precision based on measurement type
 */
export const formatCoefficient = (coefficient: number, measurementType: string): string => {
  const precision = measurementType === 'linear' ? 4 : 
                   measurementType === 'area' ? 3 : 2;
  return coefficient.toFixed(precision);
};