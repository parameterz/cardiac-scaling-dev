// src/utils/cardiacScaling/universalCoefficients.ts

/**
 * Universal Coefficient Calculator implementing Dewey methodology
 * 
 * Core Innovation: Generate universal LBM coefficients and sex-specific BSA coefficients
 * from published indexed reference values using back-calculation approach.
 * 
 * Key Principles:
 * 1. Universal LBM coefficients (same for both sexes) - represents true biological scaling
 * 2. Sex-specific BSA coefficients - compensate for body composition differences
 * 3. Multi-index back-calculation for robustness
 * 4. Automatic measurement type detection and appropriate exponent application
 */

import { STROM_MEASUREMENTS, REFERENCE_POPULATION, type Sex, type MeasurementData } from '../../data/stromData';
import { getScalingExponents, type ScalingExponents } from '../../data/measurementDefinitions';
import { calculateBSA, calculateLBM } from '../bodyComposition/formulaRegistry';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface CoefficientResult {
  measurement: string;
  type: 'linear' | 'mass_volume';
  universal: {
    lbm: number;
    r_squared?: number;
  };
  sexSpecific: {
    male: {
      bsa: number;
      r_squared?: number;
    };
    female: {
      bsa: number;
      r_squared?: number;
    };
  };
  backCalculation: {
    male: {
      absolute: number;
      indices: Record<string, number>;
    };
    female: {
      absolute: number;
      indices: Record<string, number>;
    };
  };
  validation: {
    isValid: boolean;
    warnings: string[];
    sexSimilarity: number; // Similarity between male/female LBM coefficients (0-1)
  };
}

export interface PopulationData {
  height: number;
  weight: number;
  bsa: number;
  lbm: number;
}

// =============================================================================
// BODY COMPOSITION CALCULATIONS
// =============================================================================

/**
 * Calculate reference population body composition using specified formulas
 */
const calculateReferencePopulation = (
  sex: Sex,
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): PopulationData => {
  const ref = REFERENCE_POPULATION[sex];
  
  const bsa = calculateBSA(bsaFormula, ref.weight, ref.height);
  const lbm = calculateLBM(lbmFormula, ref.weight, ref.height, sex);
  
  return {
    height: ref.height,
    weight: ref.weight,
    bsa,
    lbm
  };
};

// =============================================================================
// BACK-CALCULATION ENGINE
// =============================================================================

/**
 * Back-calculate absolute values from indexed values using available indices
 * Uses multi-index approach for robustness when multiple indices available
 */
const backCalculateAbsoluteValue = (
  measurement: MeasurementData,
  sex: Sex,
  population: PopulationData
): { absolute: number; indices: Record<string, number> } => {
  const sexData = measurement[sex];
  const indices: Record<string, number> = {};
  const absoluteValues: number[] = [];
  
  // BSA-indexed back-calculation
  if (sexData.bsa) {
    const bsaIndexed = sexData.bsa.mean;
    const absolute = bsaIndexed * population.bsa;
    indices.bsa = bsaIndexed;
    absoluteValues.push(absolute);
  }
  
  // Height-indexed back-calculation  
  if (sexData.height) {
    const heightIndexed = sexData.height.mean;
    const absolute = heightIndexed * (population.height / 100); // Convert cm to m for calculation
    indices.height = heightIndexed;
    absoluteValues.push(absolute);
  }
  
  // Height²-indexed back-calculation
  if (sexData.height2) {
    const height2Indexed = sexData.height2.mean;
    const absolute = height2Indexed * Math.pow(population.height / 100, 2);
    indices.height2 = height2Indexed;
    absoluteValues.push(absolute);
  }
  
  // BMI-indexed back-calculation (less preferred)
  if (sexData.bmi) {
    const bmiIndexed = sexData.bmi.mean;
    const bmi = population.weight / Math.pow(population.height / 100, 2);
    const absolute = bmiIndexed * bmi;
    indices.bmi = bmiIndexed;
    absoluteValues.push(absolute);
  }
  
  // Average across available methods for robustness
  const absoluteValue = absoluteValues.length > 0 
    ? absoluteValues.reduce((sum, val) => sum + val, 0) / absoluteValues.length
    : 0;
  
  return {
    absolute: absoluteValue,
    indices
  };
};

// =============================================================================
// COEFFICIENT GENERATION
// =============================================================================

/**
 * Generate LBM coefficient for a specific sex
 */
const generateLBMCoefficient = (
  absoluteValue: number,
  lbm: number,
  exponent: number
): number => {
  if (lbm <= 0 || absoluteValue <= 0) return 0;
  return absoluteValue / Math.pow(lbm, exponent);
};

/**
 * Generate BSA coefficient for a specific sex
 */
const generateBSACoefficient = (
  absoluteValue: number,
  bsa: number,
  exponent: number
): number => {
  if (bsa <= 0 || absoluteValue <= 0) return 0;
  return absoluteValue / Math.pow(bsa, exponent);
};

/**
 * Calculate universal LBM coefficient by averaging male and female coefficients
 * This tests the hypothesis that LBM scaling should be universal across sexes
 */
const generateUniversalLBMCoefficient = (
  maleAbsolute: number,
  femaleAbsolute: number,
  maleLBM: number,
  femaleLBM: number,
  exponent: number
): { coefficient: number; sexSimilarity: number } => {
  const maleCoeff = generateLBMCoefficient(maleAbsolute, maleLBM, exponent);
  const femaleCoeff = generateLBMCoefficient(femaleAbsolute, femaleLBM, exponent);
  
  // Universal coefficient is the average
  const universalCoeff = (maleCoeff + femaleCoeff) / 2;
  
  // Calculate similarity (1 = identical, 0 = completely different)
  const similarity = maleCoeff > 0 && femaleCoeff > 0 
    ? 1 - Math.abs(maleCoeff - femaleCoeff) / Math.max(maleCoeff, femaleCoeff)
    : 0;
  
  return {
    coefficient: universalCoeff,
    sexSimilarity: similarity
  };
};

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate coefficient results for biological plausibility
 */
const validateCoefficients = (
  result: Omit<CoefficientResult, 'validation'>
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  let isValid = true;
  
  // Check for reasonable coefficient ranges
  if (result.type === 'linear') {
    if (result.universal.lbm < 0.5 || result.universal.lbm > 2.0) {
      warnings.push(`LBM coefficient ${result.universal.lbm.toFixed(3)} outside expected range 0.5-2.0 for linear measurements`);
      isValid = false;
    }
    
    if (result.sexSpecific.male.bsa < 1.0 || result.sexSpecific.male.bsa > 5.0) {
      warnings.push(`Male BSA coefficient ${result.sexSpecific.male.bsa.toFixed(3)} outside expected range 1.0-5.0`);
      isValid = false;
    }
    
    if (result.sexSpecific.female.bsa < 1.0 || result.sexSpecific.female.bsa > 5.0) {
      warnings.push(`Female BSA coefficient ${result.sexSpecific.female.bsa.toFixed(3)} outside expected range 1.0-5.0`);
      isValid = false;
    }
  }
  
  if (result.type === 'mass_volume') {
    if (result.universal.lbm < 0.2 || result.universal.lbm > 3.0) {
      warnings.push(`LBM coefficient ${result.universal.lbm.toFixed(3)} outside expected range 0.2-3.0 for mass/volume measurements`);
      isValid = false;
    }
  }
  
  // Check sex similarity for LBM coefficients
  if (result.validation.sexSimilarity < 0.7) {
    warnings.push(`Low sex similarity (${(result.validation.sexSimilarity * 100).toFixed(1)}%) suggests potential issues with universal LBM scaling hypothesis`);
  }
  
  return { isValid, warnings };
};

// =============================================================================
// MAIN COEFFICIENT GENERATION FUNCTION
// =============================================================================

/**
 * Generate universal coefficients for a specific measurement
 * This is the core function implementing the Dewey methodology
 */
export const generateUniversalCoefficients = (
  measurementId: string,
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): CoefficientResult | null => {
  // Get measurement data
  const measurement = STROM_MEASUREMENTS.find(m => m.id === measurementId);
  if (!measurement) {
    console.error(`Measurement ${measurementId} not found`);
    return null;
  }
  
  // Get scaling exponents for measurement type
  const exponents = getScalingExponents(measurement.type);
  
  // Calculate reference population characteristics
  const malePopulation = calculateReferencePopulation('male', bsaFormula, lbmFormula);
  const femalePopulation = calculateReferencePopulation('female', bsaFormula, lbmFormula);
  
  // Back-calculate absolute values
  const maleBackCalc = backCalculateAbsoluteValue(measurement, 'male', malePopulation);
  const femaleBackCalc = backCalculateAbsoluteValue(measurement, 'female', femalePopulation);
  
  // Generate universal LBM coefficient
  const { coefficient: universalLBM, sexSimilarity } = generateUniversalLBMCoefficient(
    maleBackCalc.absolute,
    femaleBackCalc.absolute,
    malePopulation.lbm,
    femalePopulation.lbm,
    exponents.lbm
  );
  
  // Generate sex-specific BSA coefficients
  const maleBSACoeff = generateBSACoefficient(
    maleBackCalc.absolute,
    malePopulation.bsa,
    exponents.bsa
  );
  
  const femaleBSACoeff = generateBSACoefficient(
    femaleBackCalc.absolute,
    femalePopulation.bsa,
    exponents.bsa
  );
  
  // Construct result
  const result: Omit<CoefficientResult, 'validation'> = {
    measurement: measurement.name,
    type: measurement.type,
    universal: {
      lbm: universalLBM
    },
    sexSpecific: {
      male: {
        bsa: maleBSACoeff
      },
      female: {
        bsa: femaleBSACoeff
      }
    },
    backCalculation: {
      male: maleBackCalc,
      female: femaleBackCalc
    },
    validation: {
      isValid: true, // Will be updated
      warnings: [],
      sexSimilarity
    }
  };
  
  // Validate results
  const validation = validateCoefficients(result);
  
  return {
    ...result,
    validation: {
      ...validation,
      sexSimilarity
    }
  };
};

/**
 * Generate coefficients for all available measurements
 */
export const generateAllCoefficients = (
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): CoefficientResult[] => {
  const results: CoefficientResult[] = [];
  
  for (const measurement of STROM_MEASUREMENTS) {
    const result = generateUniversalCoefficients(measurement.id, bsaFormula, lbmFormula);
    if (result) {
      results.push(result);
    }
  }
  
  return results;
};

/**
 * Predict measurement value using universal coefficients
 */
export const predictMeasurement = (
  coefficient: CoefficientResult,
  sex: Sex,
  lbm: number,
  bsa: number
): number => {
  const exponents = getScalingExponents(coefficient.type);
  
  // Use universal LBM scaling + sex-specific BSA adjustment
  const lbmComponent = coefficient.universal.lbm * Math.pow(lbm, exponents.lbm);
  const bsaComponent = coefficient.sexSpecific[sex].bsa * Math.pow(bsa, exponents.bsa);
  
  // For this implementation, we'll use the LBM-based prediction as primary
  // Future versions could implement combined models
  return lbmComponent;
};

/**
 * Summary statistics for all coefficients
 */
export const getCoefficientsummary = (coefficients: CoefficientResult[]) => {
  const linear = coefficients.filter(c => c.type === 'linear');
  const massVolume = coefficients.filter(c => c.type === 'mass_volume');
  
  return {
    total: coefficients.length,
    byType: {
      linear: linear.length,
      mass_volume: massVolume.length
    },
    averages: {
      linear: {
        lbm: linear.length > 0 ? linear.reduce((sum, c) => sum + c.universal.lbm, 0) / linear.length : 0,
        sexSimilarity: linear.length > 0 ? linear.reduce((sum, c) => sum + c.validation.sexSimilarity, 0) / linear.length : 0
      },
      mass_volume: {
        lbm: massVolume.length > 0 ? massVolume.reduce((sum, c) => sum + c.universal.lbm, 0) / massVolume.length : 0,
        sexSimilarity: massVolume.length > 0 ? massVolume.reduce((sum, c) => sum + c.validation.sexSimilarity, 0) / massVolume.length : 0
      }
    },
    validation: {
      valid: coefficients.filter(c => c.validation.isValid).length,
      warnings: coefficients.reduce((total, c) => total + c.validation.warnings.length, 0)
    }
  };
};

export default {
  generateUniversalCoefficients,
  generateAllCoefficients,
  predictMeasurement,
  getCoefficientsummary
};