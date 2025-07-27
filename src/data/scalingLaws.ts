// src/data/scalingLaws.ts - Updated with Ratiometric/Allometric Clarification

/**
 * Universal scaling laws based on geometric and biological principles
 * 
 * KEY TERMINOLOGY CLARIFICATION:
 * - Ratiometric scaling = exponent 1.0 (simple division)
 * - Allometric scaling = exponent ≠ 1.0 (power law transformation)
 * - Ratiometric is geometrically appropriate when measurement and scaling variable have same dimensionality
 * - Allometric transforms scaling variables between dimensional spaces
 * 
 * Updated to handle the complete measurement taxonomy:
 * - Linear (1D): dimensions, diameters, thicknesses
 * - Area (2D): chamber areas, valve areas  
 * - Mass (3D): tissue masses
 * - Volume (3D): chamber volumes, flow rates
 */

export interface ScalingExponents {
  lbm: number;
  bsa: number;
  height: number;
}

export type MeasurementType = 'linear' | 'area' | 'mass' | 'volume';

/**
 * Universal scaling exponents based on geometric principles
 * Updated to clarify when ratiometric scaling (exponent = 1.0) is geometrically appropriate
 */
export const SCALING_EXPONENTS: Record<MeasurementType, ScalingExponents> = {
  // 1D Measurements: Linear scaling
  linear: { 
    lbm: 0.33,    // LBM^(1/3) - allometric: transforms 3D mass → 1D linear
    bsa: 0.5,     // BSA^0.5 - allometric: transforms 2D area → 1D linear  
    height: 1.0   // Height^1.0 - RATIOMETRIC: both are 1D (geometrically appropriate)
  },
  
  // 2D Measurements: Area scaling  
  area: { 
    lbm: 0.67,    // LBM^(2/3) - allometric: transforms 3D mass → 2D area
    bsa: 1.0,     // BSA^1.0 - RATIOMETRIC: both are 2D (geometrically appropriate - current practice is correct!)
    height: 2.0   // Height^2.0 - allometric: transforms 1D height → 2D area
  },
  
  // 3D Measurements: Mass scaling (tissue mass)
  mass: { 
    lbm: 1.0,     // LBM^1.0 - RATIOMETRIC: both are 3D/mass (geometrically appropriate)
    bsa: 1.5,     // BSA^1.5 - allometric: transforms 2D area → 3D mass
    height: 3.0   // Height^3.0 - allometric: theoretical geometric scaling for 3D
  },
  
  // 3D Measurements: Volume scaling (chamber volumes, flow)
  volume: { 
    lbm: 1.0,     // LBM^1.0 - RATIOMETRIC: both represent 3D space (geometrically appropriate)
    bsa: 1.5,     // BSA^1.5 - allometric: transforms 2D area → 3D volume
    height: 3.0   // Height^3.0 - allometric: theoretical geometric scaling for 3D
  }
};

/**
 * Physical basis explanations for each measurement type
 * Updated to clarify ratiometric vs allometric relationships
 */
export const SCALING_EXPLANATIONS = {
  linear: {
    title: 'Linear Measurements (1D)',
    physics: 'One-dimensional measurements. Height ratiometric scaling (Height^1.0) is geometrically appropriate since both measurement and scaling variable are 1D. BSA^0.5 and LBM^0.33 are allometric transformations.',
    examples: ['LV End-Diastolic Dimension', 'Wall Thicknesses', 'Vessel Diameters'],
    ratiometricApproach: 'Height^1.0 (both 1D)',
    allometricApproaches: 'LBM^0.33 (3D→1D), BSA^0.5 (2D→1D)',
    clinicalProblem: 'Current BSA ratiometric indexing mixes 1D measurements with 2D scaling variable'
  },
  area: {
    title: 'Area Measurements (2D)', 
    physics: 'Two-dimensional measurements. BSA ratiometric scaling (BSA^1.0) is geometrically appropriate since BSA is literally surface area (2D). Current clinical practice gets this right!',
    examples: ['Cardiac Chamber Areas', 'Valve Areas', 'Cross-Sectional Areas'],
    ratiometricApproach: 'BSA^1.0 (both 2D) - Current practice is correct!',
    allometricApproaches: 'LBM^0.67 (3D→2D), Height^2.0 (1D→2D)',
    clinicalProblem: 'None - current BSA indexing is geometrically appropriate for areas'
  },
  mass: {
    title: 'Mass Measurements (3D)',
    physics: 'Tissue mass measurements. LBM ratiometric scaling (LBM^1.0) is geometrically appropriate since both represent 3D/mass space. Height^3.0 represents theoretical geometric scaling for 3D measurements.',
    examples: ['LV Mass', 'Cardiac Muscle Mass', 'Organ Masses'],
    ratiometricApproach: 'LBM^1.0 (both 3D/mass)',
    allometricApproaches: 'BSA^1.5 (2D→3D), Height^3.0 (theoretical geometric), empirical options: Height^1.6, Height^2.7',
    clinicalProblem: 'Current BSA ratiometric indexing mixes 3D measurements with 2D scaling variable'
  },
  volume: {
    title: 'Volume Measurements (3D)',
    physics: 'Chamber volumes and flow rates represent 3D space. LBM ratiometric scaling may be appropriate since both represent 3D space. Height^3.0 represents theoretical geometric scaling for 3D measurements.',
    examples: ['LV Volumes', 'LA Volumes', 'Stroke Volume', 'Cardiac Output'],
    ratiometricApproach: 'LBM^1.0 (both 3D space)',
    allometricApproaches: 'BSA^1.5 (2D→3D), Height^3.0 (theoretical geometric), empirical options: Height^1.6, Height^2.7',
    clinicalProblem: 'Current BSA ratiometric indexing mixes 3D measurements with 2D scaling variable'
  }
};

/**
 * Expected coefficient ranges for validation - updated with ratiometric context
 */
export const EXPECTED_COEFFICIENT_RANGES = {
  linear: {
    lbm: { min: 0.8, max: 1.5, ideal: 1.166, note: 'Allometric LBM^0.33 transformation' },
    bsa: { min: 2.5, max: 4.0, ideal: 3.22, note: 'Allometric BSA^0.5 transformation' },
    height: { min: 0.02, max: 0.05, ideal: 0.03, note: 'Ratiometric Height^1.0 (geometrically appropriate)' }
  },
  area: {
    lbm: { min: 5.0, max: 15.0, ideal: 10.0, note: 'Allometric LBM^0.67 transformation' },
    bsa: { min: 8.0, max: 12.0, ideal: 10.0, note: 'Ratiometric BSA^1.0 (current practice - geometrically correct!)' },
    height: { min: 0.3, max: 0.8, ideal: 0.5, note: 'Allometric Height^2.0 transformation' }
  },
  mass: {
    lbm: { min: 0.5, max: 2.0, ideal: 1.0, note: 'Ratiometric LBM^1.0 (geometrically appropriate)' },
    bsa: { min: 20, max: 80, ideal: 50, note: 'Allometric BSA^1.5 transformation' },
    height: { min: 5, max: 30, ideal: 15, note: 'Allometric Height^3.0 (theoretical geometric scaling for 3D)' }
  },
  volume: {
    lbm: { min: 0.3, max: 1.5, ideal: 0.8, note: 'Ratiometric LBM^1.0 (may be geometrically appropriate)' },
    bsa: { min: 15, max: 60, ideal: 35, note: 'Allometric BSA^1.5 transformation' },
    height: { min: 3, max: 20, ideal: 10, note: 'Allometric Height^3.0 (theoretical geometric scaling for 3D)' }
  }
};

/**
 * Validation rules by measurement type - updated with ratiometric context
 */
export const COEFFICIENT_VALIDATION = {
  linear: {
    minCoefficient: 0.5,
    maxCoefficient: 5.0,
    maxCoefficientVariation: 0.3,  // 30% max difference between sexes
    requiredRSquared: 0.85,
    geometricallyAppropriateApproach: 'height_ratiometric',
    note: 'Height ratiometric scaling should show best sex similarity for 1D measurements'
  },
  area: {
    minCoefficient: 2.0,
    maxCoefficient: 20.0,
    maxCoefficientVariation: 0.35, // 35% max difference
    requiredRSquared: 0.80,
    geometricallyAppropriateApproach: 'bsa_ratiometric',
    note: 'BSA ratiometric scaling (current practice) should perform well for 2D measurements'
  },
  mass: {
    minCoefficient: 10,
    maxCoefficient: 200,
    maxCoefficientVariation: 0.4,  // 40% max difference
    requiredRSquared: 0.80,
    geometricallyAppropriateApproach: 'lbm_ratiometric',
    note: 'LBM ratiometric scaling should show best sex similarity for 3D mass measurements'
  },
  volume: {
    minCoefficient: 5,
    maxCoefficient: 100,
    maxCoefficientVariation: 0.4,  // 40% max difference
    requiredRSquared: 0.75,
    geometricallyAppropriateApproach: 'lbm_ratiometric',
    note: 'LBM ratiometric scaling may be appropriate for 3D volume measurements'
  }
};

/**
 * Get scaling approach classification
 */
export const getScalingApproachType = (
  measurementType: MeasurementType, 
  scalingVariable: 'lbm' | 'bsa' | 'height'
): 'ratiometric' | 'allometric' => {
  const exponent = SCALING_EXPONENTS[measurementType][scalingVariable];
  
  // Ratiometric scaling has exponent = 1.0 and is geometrically appropriate
  if (exponent === 1.0) {
    // Check if it's geometrically appropriate (same dimensional space)
    const isGeometricallyAppropriate = 
      (measurementType === 'linear' && scalingVariable === 'height') ||
      (measurementType === 'area' && scalingVariable === 'bsa') ||
      ((measurementType === 'mass' || measurementType === 'volume') && scalingVariable === 'lbm');
    
    return isGeometricallyAppropriate ? 'ratiometric' : 'allometric';
  }
  
  return 'allometric';
};

/**
 * Get scaling exponents for a measurement type
 */
export const getScalingExponents = (measurementType: MeasurementType): ScalingExponents => {
  return SCALING_EXPONENTS[measurementType];
};

/**
 * Get expected coefficient ranges for a measurement type
 */
export const getExpectedRanges = (measurementType: MeasurementType) => {
  return EXPECTED_COEFFICIENT_RANGES[measurementType];
};

/**
 * Get validation rules for a measurement type
 */
export const getValidationRules = (measurementType: MeasurementType) => {
  return COEFFICIENT_VALIDATION[measurementType];
};

/**
 * Get scaling explanation for a measurement type
 */
export const getScalingExplanation = (measurementType: MeasurementType) => {
  return SCALING_EXPLANATIONS[measurementType];
};

/**
 * Check if a scaling approach is geometrically appropriate (ratiometric with matched dimensionality)
 */
export const isGeometricallyAppropriate = (
  measurementType: MeasurementType,
  scalingVariable: 'lbm' | 'bsa' | 'height'
): boolean => {
  const exponent = SCALING_EXPONENTS[measurementType][scalingVariable];
  
  if (exponent !== 1.0) return false; // Must be ratiometric
  
  // Check dimensional matching
  return (
    (measurementType === 'linear' && scalingVariable === 'height') ||     // 1D ÷ 1D
    (measurementType === 'area' && scalingVariable === 'bsa') ||          // 2D ÷ 2D  
    ((measurementType === 'mass' || measurementType === 'volume') && scalingVariable === 'lbm') // 3D ÷ 3D
  );
};

/**
 * Get dimensional space description
 */
export const getDimensionalDescription = (measurementType: MeasurementType): string => {
  switch (measurementType) {
    case 'linear': return '1D (length/diameter)';
    case 'area': return '2D (surface area)';
    case 'mass': return '3D (tissue mass)';
    case 'volume': return '3D (chamber volume)';
    default: return 'Unknown';
  }
};

export default {
  SCALING_EXPONENTS,
  EXPECTED_COEFFICIENT_RANGES,
  COEFFICIENT_VALIDATION,
  SCALING_EXPLANATIONS,
  getScalingExponents,
  getExpectedRanges,
  getValidationRules,
  getScalingExplanation,
  getScalingApproachType,
  isGeometricallyAppropriate,
  getDimensionalDescription
};