// src/data/populationDefinitions.ts

/**
 * Canonical population definitions and ranges for cardiac scaling calculations
 * This file provides the single source of truth for reference populations
 * and population generation parameters used across all visualizations
 */

import { calculateBSA, calculateLBM, type Sex } from '../utils/bodyComposition/formulaRegistry';

// =============================================================================
// REFERENCE POPULATION CHARACTERISTICS
// =============================================================================

export interface PopulationCharacteristics {
  height: number;  // cm
  weight: number;  // kg
  bmi: number;     // kg/m²
  bsa: number;     // m² (calculated)
  lbm: number;     // kg (calculated)
}

/**
 * Canonical reference population for back-calculation of coefficients
 * Based on typical characteristics used in scaling studies
 * These represent the "standard" individuals used for coefficient derivation
 */
export const CANONICAL_REFERENCE_POPULATION: Record<Sex, PopulationCharacteristics> = {
  male: {
    height: 178,     // cm (typical male height)
    weight: 79.1,    // kg (BMI 25 at 178cm)
    bmi: 25.0,       // kg/m² (normal BMI upper limit)
    bsa: 1.97,       // m² (calculated using Du Bois formula)
    lbm: 64.2        // kg (calculated using Boer formula)
  },
  female: {
    height: 164,     // cm (typical female height)  
    weight: 67.2,    // kg (BMI 25 at 164cm)
    bmi: 25.0,       // kg/m² (normal BMI upper limit)
    bsa: 1.71,       // m² (calculated using Du Bois formula)
    lbm: 45.8        // kg (calculated using Boer formula)
  }
};

// =============================================================================
// POPULATION GENERATION RANGES
// =============================================================================

export interface PopulationRanges {
  height: {
    min: number;
    max: number;
    step?: number;
  };
  bmi: {
    min: number;
    max: number;
    step?: number;
  };
  age: {
    min: number;
    max: number;
    step?: number;
  };
}

/**
 * Ranges for generating diverse populations across physiological spectrum
 * Covers from pediatric to adult extremes for comprehensive scaling analysis
 */
export const POPULATION_GENERATION_RANGES: PopulationRanges = {
  height: {
    min: 120,        // cm (short adult/tall child)
    max: 220,        // cm (very tall adult)
    step: 2          // cm (reasonable resolution)
  },
  bmi: {
    min: 16,         // kg/m² (underweight)
    max: 45,         // kg/m² (severe obesity)
    step: 1          // kg/m² (fine resolution)
  },
  age: {
    min: 18,         // years (adult population focus)
    max: 80,         // years (elderly)
    step: 5          // years (reasonable grouping)
  }
};

/**
 * Common BMI categories for population analysis
 */
export const BMI_CATEGORIES = {
  underweight: { min: 16, max: 18.5, label: 'Underweight' },
  normal: { min: 18.5, max: 25, label: 'Normal' },
  overweight: { min: 25, max: 30, label: 'Overweight' },
  obese_1: { min: 30, max: 35, label: 'Obese Class I' },
  obese_2: { min: 35, max: 40, label: 'Obese Class II' },
  obese_3: { min: 40, max: 45, label: 'Obese Class III' }
};

// =============================================================================
// POPULATION GENERATION UTILITIES
// =============================================================================

/**
 * Calculate weight from height and BMI
 */
export const calculateWeightFromBMI = (height: number, bmi: number): number => {
  const heightInMeters = height / 100;
  return bmi * heightInMeters * heightInMeters;
};

/**
 * Generate population characteristics from height and BMI
 */
export const generatePopulationCharacteristics = (
  height: number,
  bmi: number,
  sex: Sex,
  age: number = 50,
  ethnicity: string = 'white',
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): PopulationCharacteristics => {
  const weight = calculateWeightFromBMI(height, bmi);
  const bsa = calculateBSA(bsaFormula, weight, height);
  const lbm = calculateLBM(lbmFormula, weight, height, sex, age, ethnicity);
  
  return {
    height,
    weight,
    bmi,
    bsa,
    lbm
  };
};

/**
 * Generate a range of population characteristics
 */
export const generatePopulationRange = (
  sex: Sex,
  heightRange?: { min: number; max: number; step: number },
  bmiRange?: { min: number; max: number; step: number },
  age: number = 50,
  ethnicity: string = 'white',
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): PopulationCharacteristics[] => {
  const heights = heightRange || POPULATION_GENERATION_RANGES.height;
  const bmis = bmiRange || POPULATION_GENERATION_RANGES.bmi;
  
  const populations: PopulationCharacteristics[] = [];
  
  for (let height = heights.min; height <= heights.max; height += heights.step || 5) {
    for (let bmi = bmis.min; bmi <= bmis.max; bmi += bmis.step || 1) {
      populations.push(
        generatePopulationCharacteristics(height, bmi, sex, age, ethnicity, bsaFormula, lbmFormula)
      );
    }
  }
  
  return populations;
};

/**
 * Generate height-only population range (fixed BMI)
 * Useful for visualizing height scaling with controlled BMI
 */
export const generateHeightRange = (
  sex: Sex,
  fixedBMI: number = 25,
  heightRange?: { min: number; max: number; step: number },
  age: number = 50,
  ethnicity: string = 'white',
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): PopulationCharacteristics[] => {
  const heights = heightRange || POPULATION_GENERATION_RANGES.height;
  const populations: PopulationCharacteristics[] = [];
  
  for (let height = heights.min; height <= heights.max; height += heights.step || 5) {
    populations.push(
      generatePopulationCharacteristics(height, fixedBMI, sex, age, ethnicity, bsaFormula, lbmFormula)
    );
  }
  
  return populations;
};

/**
 * Generate BMI-only population range (fixed height)  
 * Useful for visualizing BMI/body composition effects
 */
export const generateBMIRange = (
  sex: Sex,
  fixedHeight: number = 170,
  bmiRange?: { min: number; max: number; step: number },
  age: number = 50,
  ethnicity: string = 'white',
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): PopulationCharacteristics[] => {
  const bmis = bmiRange || POPULATION_GENERATION_RANGES.bmi;
  const populations: PopulationCharacteristics[] = [];
  
  for (let bmi = bmis.min; bmi <= bmis.max; bmi += bmis.step || 1) {
    populations.push(
      generatePopulationCharacteristics(fixedHeight, bmi, sex, age, ethnicity, bsaFormula, lbmFormula)
    );
  }
  
  return populations;
};

/**
 * Update canonical reference population with calculated values
 * Call this to ensure BSA/LBM are calculated with current formula preferences
 */
export const updateReferencePopulation = (
  bsaFormula: string = 'dubois',
  lbmFormula: string = 'boer'
): Record<Sex, PopulationCharacteristics> => {
  const updated: Record<Sex, PopulationCharacteristics> = {} as Record<Sex, PopulationCharacteristics>;
  
  (['male', 'female'] as Sex[]).forEach(sex => {
    const ref = CANONICAL_REFERENCE_POPULATION[sex];
    updated[sex] = generatePopulationCharacteristics(
      ref.height,
      ref.bmi,
      sex,
      50, // default age
      'white', // default ethnicity
      bsaFormula,
      lbmFormula
    );
  });
  
  return updated;
};

// =============================================================================
// POPULATION SAMPLING UTILITIES
// =============================================================================

/**
 * Get reference population for a specific sex
 */
export const getReferencePopulation = (sex: Sex): PopulationCharacteristics => {
  return CANONICAL_REFERENCE_POPULATION[sex];
};

/**
 * Get both reference populations
 */
export const getAllReferencePopulations = (): Record<Sex, PopulationCharacteristics> => {
  return CANONICAL_REFERENCE_POPULATION;
};

/**
 * Generate realistic population distributions
 * Uses normal distributions around typical values
 */
export const generateRealisticPopulation = (
  sex: Sex,
  sampleSize: number = 1000,
  heightMean?: number,
  heightSD?: number,
  bmiMean?: number,
  bmiSD?: number
): PopulationCharacteristics[] => {
  // Default population parameters
  const defaults = {
    male: {
      heightMean: 178,
      heightSD: 7,
      bmiMean: 26,
      bmiSD: 4
    },
    female: {
      heightMean: 164,
      heightSD: 6,
      bmiMean: 25,
      bmiSD: 4
    }
  };
  
  const params = defaults[sex];
  const hMean = heightMean || params.heightMean;
  const hSD = heightSD || params.heightSD;
  const bMean = bmiMean || params.bmiMean;
  const bSD = bmiSD || params.bmiSD;
  
  // Generate normally distributed values
  const populations: PopulationCharacteristics[] = [];
  
  for (let i = 0; i < sampleSize; i++) {
    // Simple Box-Muller transformation for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    const height = Math.max(120, Math.min(220, hMean + z0 * hSD));
    const bmi = Math.max(16, Math.min(45, bMean + z1 * bSD));
    
    populations.push(
      generatePopulationCharacteristics(height, bmi, sex)
    );
  }
  
  return populations;
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  CANONICAL_REFERENCE_POPULATION,
  POPULATION_GENERATION_RANGES,
  BMI_CATEGORIES,
  calculateWeightFromBMI,
  generatePopulationCharacteristics,
  generatePopulationRange,
  generateHeightRange,
  generateBMIRange,
  updateReferencePopulation,
  getReferencePopulation,
  getAllReferencePopulations,
  generateRealisticPopulation
};