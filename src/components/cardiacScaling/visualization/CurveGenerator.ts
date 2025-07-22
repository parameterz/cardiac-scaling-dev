// src/components/cardiacScaling/visualization/CurveGenerator.ts

import { calculateBSA, calculateLBM } from '@/utils/bodyComposition/formulaRegistry';
import { getReferencePopulation } from '@/data/populationDefinitions';
import type { EnhancedMeasurementData } from '@/data/stromData';

export interface PopulationPoint {
  height: number;
  weight: number;
  bsa: number;
  lbm: number;
}

export interface ChartDataPoint {
  bsa: number;
  biologicalMale: number;
  biologicalFemale: number;
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
 * Generate population range with BSA and LBM values across physiological spectrum
 */
export const generatePopulationRange = (
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): { male: PopulationPoint[]; female: PopulationPoint[] } => {
  const populations = { male: [] as PopulationPoint[], female: [] as PopulationPoint[] };
  
  // Generate realistic population range
  // Heights: 140-210cm (covers short to very tall adults)
  // BMI: 18-35 (underweight to obese class II)
  for (let height = 140; height <= 210; height += 5) {
    for (let bmi = 18; bmi <= 35; bmi += 2) {
      const weight = bmi * Math.pow(height / 100, 2);
      
      (['male', 'female'] as const).forEach(sex => {
        const bsa = calculateBSA(bsaFormula, weight, height);
        const lbm = calculateLBM(lbmFormula, weight, height, sex);
        
        populations[sex].push({ height, weight, bsa, lbm });
      });
    }
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
 * Generate chart data comparing biological vs ratiometric scaling across BSA range
 */
export const generateChartData = (
  measurement: EnhancedMeasurementData,
  universalCoeff: number,
  maxBSA: number = 3.5
): ChartDataPoint[] => {
  const chartData: ChartDataPoint[] = [];
  const stepSize = 0.05;
  
  // Generate points from 0 to maxBSA
  for (let bsa = 0; bsa <= maxBSA; bsa += stepSize) {
    if (bsa === 0) {
      // Origin point - all scaling methods converge at zero
      chartData.push({
        bsa: 0,
        biologicalMale: 0,
        biologicalFemale: 0,
        ratiometricMale: 0,
        ratiometricFemale: 0
      });
      continue;
    }
    
    // For biological curves, estimate LBM from BSA using sex-specific ratios
    // These are rough approximations based on typical body composition differences
    // In a full implementation, you'd use the actual population data
    const estimatedMaleLBM = bsa * 35; // kg - Male LBM/BSA ratio ≈ 35
    const estimatedFemaleLBM = bsa * 27; // kg - Female LBM/BSA ratio ≈ 27
    
    const lbmExponent = measurement.type === 'linear' ? 0.33 : 
                       measurement.type === 'area' ? 0.67 : 1.0;
    
    // Biological predictions using universal LBM coefficient
    // prediction = universal_coefficient × LBM^exponent
    const biologicalMale = universalCoeff * Math.pow(estimatedMaleLBM, lbmExponent);
    const biologicalFemale = universalCoeff * Math.pow(estimatedFemaleLBM, lbmExponent);
    
    // Ratiometric predictions (straight lines from origin)
    // prediction = BSA_indexed_reference × BSA
    const ratiometricMale = measurement.male.bsa.mean * bsa;
    const ratiometricFemale = measurement.female.bsa.mean * bsa;
    
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
 * Generate reference points for canonical populations
 * These show where typical male/female reference populations fall on the curves
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