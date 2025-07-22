// src/data/scalingLaws.ts - Updated for 4-Type System

/**
 * Universal scaling laws based on geometric and biological principles
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
 */
export const SCALING_EXPONENTS: Record<MeasurementType, ScalingExponents> = {
  // 1D Measurements: Linear scaling
  linear: { 
    lbm: 0.33,    // LBM^(1/3) - cube root for 1D from 3D
    bsa: 0.5,     // BSA^0.5 - square root for 1D from 2D
    height: 1.0   // Height^1.0 - direct linear relationship
  },
  
  // 2D Measurements: Area scaling  
  area: { 
    lbm: 0.67,    // LBM^(2/3) - geometric 2D from 3D
    bsa: 1.0,     // BSA^1.0 - direct area relationship (BSA is area)
    height: 2.0   // Height^2.0 - geometric area scaling
  },
  
  // 3D Measurements: Mass scaling (tissue mass)
  mass: { 
    lbm: 1.0,     // LBM^1.0 - direct mass relationship
    bsa: 1.5,     // BSA^1.5 - geometric 3D scaling from 2D
    height: 2.1   // Height^2.1 - empirical (vs theoretical 3.0)
  },
  
  // 3D Measurements: Volume scaling (chamber volumes, flow)
  volume: { 
    lbm: 1.0,     // LBM^1.0 - volume scales with body mass
    bsa: 1.5,     // BSA^1.5 - geometric 3D scaling from 2D
    height: 2.1   // Height^2.1 - empirical (vs theoretical 3.0)
  }
};

/**
 * Expected coefficient ranges for validation
 */
export const EXPECTED_COEFFICIENT_RANGES = {
  linear: {
    lbm: { min: 0.8, max: 1.5, ideal: 1.166 },   // ~1.166 for LVDd
    bsa: { min: 2.5, max: 4.0, ideal: 3.22 }     // ~3.22 cm/m²
  },
  area: {
    lbm: { min: 5.0, max: 15.0, ideal: 10.0 },   // Area LBM coefficients
    bsa: { min: 8.0, max: 12.0, ideal: 10.0 }    // ~10 cm²/m² for areas
  },
  mass: {
    lbm: { min: 0.5, max: 2.0, ideal: 1.0 },     // Should be ~1.0 for mass
    bsa: { min: 20, max: 80, ideal: 50 }         // Mass BSA coefficients
  },
  volume: {
    lbm: { min: 0.3, max: 1.5, ideal: 0.8 },     // Volume LBM coefficients  
    bsa: { min: 15, max: 60, ideal: 35 }         // Volume BSA coefficients
  }
};

/**
 * Validation rules by measurement type
 */
export const COEFFICIENT_VALIDATION = {
  linear: {
    minCoefficient: 0.5,
    maxCoefficient: 5.0,
    maxCoefficientVariation: 0.3,  // 30% max difference between sexes
    requiredRSquared: 0.85
  },
  area: {
    minCoefficient: 2.0,
    maxCoefficient: 20.0,
    maxCoefficientVariation: 0.35, // 35% max difference
    requiredRSquared: 0.80
  },
  mass: {
    minCoefficient: 10,
    maxCoefficient: 200,
    maxCoefficientVariation: 0.4,  // 40% max difference
    requiredRSquared: 0.80
  },
  volume: {
    minCoefficient: 5,
    maxCoefficient: 100,
    maxCoefficientVariation: 0.4,  // 40% max difference
    requiredRSquared: 0.75
  }
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
 * Physical basis explanations for each measurement type
 */
export const SCALING_EXPLANATIONS = {
  linear: {
    title: 'Linear Measurements (1D)',
    physics: 'One-dimensional measurements follow linear geometric scaling. Since BSA ~ height², linear dimensions scale as BSA^0.5 to maintain geometric similarity.',
    examples: ['LV End-Diastolic Dimension', 'Wall Thicknesses', 'Vessel Diameters'],
    exponents: 'LBM^0.33, BSA^0.5, Height^1.0'
  },
  area: {
    title: 'Area Measurements (2D)', 
    physics: 'Two-dimensional measurements follow area geometric scaling. Areas scale directly with BSA since BSA is itself a surface area measure.',
    examples: ['Cardiac Chamber Areas', 'Valve Areas', 'Cross-Sectional Areas'],
    exponents: 'LBM^0.67, BSA^1.0, Height^2.0'
  },
  mass: {
    title: 'Mass Measurements (3D)',
    physics: 'Tissue mass measurements scale directly with body mass. The BSA^1.5 relationship derives from geometric 3D scaling principles.',
    examples: ['LV Mass', 'Cardiac Muscle Mass', 'Organ Masses'],
    exponents: 'LBM^1.0, BSA^1.5, Height^2.1'
  },
  volume: {
    title: 'Volume Measurements (3D)',
    physics: 'Chamber volumes and flow rates scale with body size but may have different coefficients than tissue masses due to functional vs structural differences.',
    examples: ['LV Volumes', 'LA Volumes', 'Stroke Volume', 'Cardiac Output'],
    exponents: 'LBM^1.0, BSA^1.5, Height^2.1'
  }
};

export default {
  SCALING_EXPONENTS,
  EXPECTED_COEFFICIENT_RANGES,
  COEFFICIENT_VALIDATION,
  SCALING_EXPLANATIONS,
  getScalingExponents,
  getExpectedRanges,
  getValidationRules
};