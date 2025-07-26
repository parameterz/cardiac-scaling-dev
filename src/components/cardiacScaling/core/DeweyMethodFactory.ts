// src/components/cardiacScaling/core/DeweyMethodFactory.ts

/**
 * Dewey Method Factory - Universal Cardiac Scaling Analysis Engine
 * 
 * This is the core engine that implements the Dewey methodology for coefficient
 * derivation and enables comprehensive scaling comparisons across all approaches:
 * - Ratiometric BSA (current clinical standard)
 * - Allometric LBM (universal biological scaling)
 * - Allometric BSA (geometric scaling)
 * - Allometric Height (pure geometric scaling)
 * 
 * Key Features:
 * - BMI 24 canonical reference populations (178cm♂, 164cm♀)
 * - Cross-method correlation analysis
 * - Population generation across physiological ranges
 * - Validation against published literature
 * - Support for all measurement types (1D/2D/3D)
 */

import { 
  calculateBSA, 
  calculateLBM,
  type Sex
} from '@/utils/bodyComposition/formulaRegistry';
import { type FormulaSelectionState } from '@/components/common/FormulaSelector';
import { 
  type EnhancedMeasurementData,
  type MeasurementType 
} from '@/data/stromData';
import { 
  generatePopulationCharacteristics,
  type PopulationCharacteristics 
} from '@/data/populationDefinitions';
import { 
  getScalingExponents,
  type ScalingExponents 
} from '@/data/scalingLaws';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ScalingVariable = 'bsa' | 'lbm' | 'height';
export type ScalingApproach = 'ratiometric' | 'allometric';

export interface ScalingConfiguration {
  id: string;
  name: string;
  approach: ScalingApproach;
  variable: ScalingVariable;
  exponent: number;
  description: string;
}

export interface PopulationPoint {
  height: number;
  weight: number;
  bmi: number;
  bsa: number;
  lbm: number;
  scalingValue: number;
  measurementValue: number;
  metadata?: {
    ageCategory?: string;
    bmiCategory?: string;
  };
}

export interface ScalingCoefficients {
  male: number;
  female: number;
  universal?: number;
  similarity: {
    absolute: number;
    percentage: number;
  };
}

export interface ValidationMetrics {
  publishedMatch?: number;
  rSquared: number;
  correlation: number;
  meanAbsoluteError: number;
  coefficientOfVariation: number;
}

export interface ChartDataPoint {
  scalingValue: number; // For chart display, this is ALWAYS BSA regardless of configuration
  [key: string]: number | undefined; // Dynamic keys for each configuration
}

export interface CorrelationMatrix {
  configurationIds: string[];
  matrix: number[][];
  significantCorrelations: Array<{
    config1: string;
    config2: string;
    correlation: number;
    strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  }>;
}

export interface DeweyMethodResult {
  measurement: EnhancedMeasurementData;
  formulaSelection: FormulaSelectionState;
  referencePopulations: {
    male: PopulationCharacteristics & { bsa: number; lbm: number };
    female: PopulationCharacteristics & { bsa: number; lbm: number };
  };
  configurations: ScalingConfiguration[];
  coefficients: Record<string, ScalingCoefficients>;
  populationData: Record<string, { male: PopulationPoint[]; female: PopulationPoint[] }>;
  chartData: ChartDataPoint[];
  validationMetrics: Record<string, ValidationMetrics>;
  correlationMatrix: CorrelationMatrix;
  insights: {
    bestConfiguration: string;
    worstConfiguration: string;
    recommendedApproach: string;
    clinicalRelevance: string;
  };
}

export interface AnalysisOptions {
  populationRange?: {
    height: { min: number; max: number; step: number };
    bmi: { min: number; max: number; step: number };
  };
  validationTarget?: 'strom' | 'literature' | 'geometric';
  includeCorrelations?: boolean;
  generateInsights?: boolean;
}

// =============================================================================
// CANONICAL REFERENCE POPULATIONS (BMI 24 STANDARD)
// =============================================================================

/**
 * Canonical reference populations using BMI 24 standard
 * This ensures unbiased scaling relationships without weight-related cardiac adaptations
 */
const CANONICAL_REFERENCE_BASE = {
  male: { height: 178, bmi: 24, weight: 76.1 },    // BMI 24 at 178cm
  female: { height: 164, bmi: 24, weight: 64.6 }   // BMI 24 at 164cm
};

/**
 * Generate canonical reference populations with calculated BSA/LBM
 */
const generateCanonicalReferences = (
  formulaSelection: FormulaSelectionState
): DeweyMethodResult['referencePopulations'] => {
  const male = generatePopulationCharacteristics(
    CANONICAL_REFERENCE_BASE.male.height,
    CANONICAL_REFERENCE_BASE.male.bmi,
    'male',
    formulaSelection.age,
    formulaSelection.ethnicity,
    formulaSelection.bsaFormula,
    formulaSelection.lbmFormula
  );

  const female = generatePopulationCharacteristics(
    CANONICAL_REFERENCE_BASE.female.height,
    CANONICAL_REFERENCE_BASE.female.bmi,
    'female',
    formulaSelection.age,
    formulaSelection.ethnicity,
    formulaSelection.bsaFormula,
    formulaSelection.lbmFormula
  );

  return {
    male: {
      ...male,
      bsa: calculateBSA(formulaSelection.bsaFormula, male.weight, male.height),
      lbm: calculateLBM(
        formulaSelection.lbmFormula,
        male.weight,
        male.height,
        'male',
        formulaSelection.age,
        formulaSelection.ethnicity
      )
    },
    female: {
      ...female,
      bsa: calculateBSA(formulaSelection.bsaFormula, female.weight, female.height),
      lbm: calculateLBM(
        formulaSelection.lbmFormula,
        female.weight,
        female.height,
        'female',
        formulaSelection.age,
        formulaSelection.ethnicity
      )
    }
  };
};

// =============================================================================
// PREDEFINED SCALING CONFIGURATIONS
// =============================================================================

/**
 * Generate standard scaling configurations based on measurement type
 */
export const getStandardConfigurations = (measurementType: MeasurementType): ScalingConfiguration[] => {
  const expectedExponents = getScalingExponents(measurementType);

  const configs: ScalingConfiguration[] = [
    // Ratiometric BSA (current clinical standard)
    {
      id: 'ratiometric_bsa',
      name: 'Ratiometric BSA',
      approach: 'ratiometric',
      variable: 'bsa',
      exponent: 1.0,
      description: 'Current clinical standard - linear BSA indexing'
    },

    // Allometric LBM (universal biological)
    {
      id: 'allometric_lbm',
      name: `Allometric LBM^${expectedExponents.lbm}`,
      approach: 'allometric',
      variable: 'lbm',
      exponent: expectedExponents.lbm,
      description: 'Universal biological scaling based on lean body mass'
    },

    // Allometric BSA (geometric)
    {
      id: 'allometric_bsa',
      name: `Allometric BSA^${expectedExponents.bsa}`,
      approach: 'allometric',
      variable: 'bsa',
      exponent: expectedExponents.bsa,
      description: 'Geometric scaling using body surface area'
    },

    // Allometric Height (pure geometric)
    {
      id: 'allometric_height',
      name: `Allometric Height^${expectedExponents.height}`,
      approach: 'allometric',
      variable: 'height',
      exponent: expectedExponents.height,
      description: 'Pure geometric scaling using height'
    }
  ];

  // Add additional height exponents for mass/volume measurements
  if (measurementType === 'mass' || measurementType === 'volume') {
    configs.push(
      {
        id: 'height_geometric',
        name: 'Height^3.0 (Theoretical)',
        approach: 'allometric',
        variable: 'height',
        exponent: 3.0,
        description: 'Theoretical geometric scaling for 3D measurements'
      },
      {
        id: 'height_empirical',
        name: 'Height^2.7 (Empirical)',
        approach: 'allometric',
        variable: 'height',
        exponent: 2.7,
        description: 'Empirically derived scaling for 3D measurements'
      },
      {
        id: 'height_conservative',
        name: 'Height^1.6 (Conservative)',
        approach: 'allometric',
        variable: 'height',
        exponent: 1.6,
        description: 'Conservative scaling approach for 3D measurements'
      }
    );
  }

  return configs;
};

// =============================================================================
// COEFFICIENT CALCULATION (DEWEY METHODOLOGY)
// =============================================================================

/**
 * Calculate scaling coefficients using the Dewey methodology
 */
const calculateCoefficients = (
  measurement: EnhancedMeasurementData,
  configuration: ScalingConfiguration,
  referencePopulations: DeweyMethodResult['referencePopulations']
): ScalingCoefficients => {
  // Step 1: Get indexed reference values (97.5th percentile - ULN)
  const maleIndexed = measurement.male.bsa.mean + 1.96 * measurement.male.bsa.sd;
  const femaleIndexed = measurement.female.bsa.mean + 1.96 * measurement.female.bsa.sd;

  // Step 2: Back-calculate absolute values
  const maleAbsolute = maleIndexed * referencePopulations.male.bsa;
  const femaleAbsolute = femaleIndexed * referencePopulations.female.bsa;

  if (configuration.approach === 'ratiometric') {
    // Ratiometric: coefficients are the indexed values themselves
    return {
      male: maleIndexed,
      female: femaleIndexed,
      similarity: {
        absolute: Math.abs(maleIndexed - femaleIndexed),
        percentage: Math.max(0, 100 - (Math.abs(maleIndexed - femaleIndexed) / Math.max(maleIndexed, femaleIndexed)) * 100)
      }
    };
  } else {
    // Allometric: calculate coefficients using scaling formula
    const getScalingValue = (sex: Sex) => {
      const pop = referencePopulations[sex];
      switch (configuration.variable) {
        case 'bsa': return pop.bsa;
        case 'lbm': return pop.lbm;
        case 'height': return pop.height / 100; // Convert to meters
        default: return pop.bsa;
      }
    };

    const maleScalingValue = getScalingValue('male');
    const femaleScalingValue = getScalingValue('female');

    const maleCoefficient = maleAbsolute / Math.pow(maleScalingValue, configuration.exponent);
    const femaleCoefficient = femaleAbsolute / Math.pow(femaleScalingValue, configuration.exponent);

    const universalCoefficient = (maleCoefficient + femaleCoefficient) / 2;
    const absoluteDifference = Math.abs(maleCoefficient - femaleCoefficient);
    const relativeDifference = (absoluteDifference / Math.max(maleCoefficient, femaleCoefficient)) * 100;

    return {
      male: maleCoefficient,
      female: femaleCoefficient,
      universal: universalCoefficient,
      similarity: {
        absolute: absoluteDifference,
        percentage: Math.max(0, 100 - relativeDifference)
      }
    };
  }
};

// =============================================================================
// POPULATION GENERATION
// =============================================================================

/**
 * Generate population data across physiological ranges
 */
const generatePopulationData = (
  configuration: ScalingConfiguration,
  coefficients: ScalingCoefficients,
  formulaSelection: FormulaSelectionState,
  options: AnalysisOptions
): { male: PopulationPoint[]; female: PopulationPoint[] } => {
  const range = options.populationRange || {
    height: { min: 120, max: 220, step: 1 }, // 1cm steps for smooth curves
    bmi: { min: 24, max: 24, step: 1 } // Fixed BMI for clean curves
  };

  const populations = { male: [] as PopulationPoint[], female: [] as PopulationPoint[] };

  (['male', 'female'] as Sex[]).forEach(sex => {
    for (let height = range.height.min; height <= range.height.max; height += range.height.step) {
      for (let bmi = range.bmi.min; bmi <= range.bmi.max; bmi += range.bmi.step) {
        const weight = bmi * Math.pow(height / 100, 2);
        const bsa = calculateBSA(formulaSelection.bsaFormula, weight, height);
        const lbm = calculateLBM(
          formulaSelection.lbmFormula,
          weight,
          height,
          sex,
          formulaSelection.age,
          formulaSelection.ethnicity
        );

        // Calculate scaling value based on configuration
        let scalingValue: number;
        switch (configuration.variable) {
          case 'bsa': scalingValue = bsa; break;
          case 'lbm': scalingValue = lbm; break;
          case 'height': scalingValue = height / 100; break; // Convert to meters
          default: scalingValue = bsa;
        }

        // Calculate measurement value
        let measurementValue: number;
        if (configuration.approach === 'ratiometric') {
          measurementValue = coefficients[sex] * scalingValue;
        } else {
          const coefficient = coefficients.universal || coefficients[sex];
          measurementValue = coefficient * Math.pow(scalingValue, configuration.exponent);
        }

        populations[sex].push({
          height,
          weight,
          bmi,
          bsa,
          lbm,
          scalingValue,
          measurementValue,
          metadata: {
            bmiCategory: getBMICategory(bmi),
            ageCategory: 'adult' // Future expansion
          }
        });
      }
    }
  });

  return populations;
};

/**
 * Helper function to categorize BMI
 */
const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese_1';
  if (bmi < 40) return 'obese_2';
  return 'obese_3';
};

// =============================================================================
// CHART DATA GENERATION
// =============================================================================

/**
 * Generate chart data combining all configurations
 * SIMPLE APPROACH: Use population data directly, no interpolation
 */
const generateChartData = (
  configurations: ScalingConfiguration[],
  populationData: Record<string, { male: PopulationPoint[]; female: PopulationPoint[] }>,
  coefficients: Record<string, ScalingCoefficients>
): ChartDataPoint[] => {
  // Collect all BSA values from population data
  const bsaToDataMap = new Map<number, ChartDataPoint>();
  
  // Add origin point for ratiometric lines
  const originPoint: ChartDataPoint = { scalingValue: 0 };
  configurations.forEach(config => {
    if (config.approach === 'ratiometric') {
      originPoint[`${config.id}_male`] = 0;
      originPoint[`${config.id}_female`] = 0;
    } else {
      originPoint[`${config.id}_male`] = undefined;
      originPoint[`${config.id}_female`] = undefined;
    }
  });
  bsaToDataMap.set(0, originPoint);

  // Process population data directly - no interpolation!
  configurations.forEach(config => {
    const data = populationData[config.id];
    const configCoefficients = coefficients[config.id];
    
    if (data && configCoefficients) {
      // Process male population
      data.male.forEach(point => {
        const bsa = Math.round(point.bsa * 100) / 100; // Round to 2 decimals
        
        if (!bsaToDataMap.has(bsa)) {
          bsaToDataMap.set(bsa, { scalingValue: bsa });
        }
        
        const chartPoint = bsaToDataMap.get(bsa)!;
        
        if (config.approach === 'ratiometric') {
          // Ratiometric: linear from coefficient
          chartPoint[`${config.id}_male`] = configCoefficients.male * bsa;
        } else {
          // Biological: use actual population data
          chartPoint[`${config.id}_male`] = point.measurementValue;
        }
      });
      
      // Process female population
      data.female.forEach(point => {
        const bsa = Math.round(point.bsa * 100) / 100; // Round to 2 decimals
        
        if (!bsaToDataMap.has(bsa)) {
          bsaToDataMap.set(bsa, { scalingValue: bsa });
        }
        
        const chartPoint = bsaToDataMap.get(bsa)!;
        
        if (config.approach === 'ratiometric') {
          // Ratiometric: linear from coefficient
          chartPoint[`${config.id}_female`] = configCoefficients.female * bsa;
        } else {
          // Biological: use actual population data
          chartPoint[`${config.id}_female`] = point.measurementValue;
        }
      });
    }
  });

  // Convert map to sorted array
  const chartData = Array.from(bsaToDataMap.values()).sort((a, b) => a.scalingValue - b.scalingValue);
  
  // Extend ratiometric lines to chart max if needed
  const maxBSA = Math.max(...chartData.map(p => p.scalingValue));
  const extendTo = Math.max(3.5, maxBSA);
  
  // Add a few extension points for ratiometric lines only
  for (let bsa = Math.ceil(maxBSA * 10) / 10; bsa <= extendTo; bsa += 0.1) {
    const point: ChartDataPoint = { scalingValue: bsa };
    
    configurations.forEach(config => {
      const configCoefficients = coefficients[config.id];
      if (configCoefficients) {
        if (config.approach === 'ratiometric') {
          point[`${config.id}_male`] = configCoefficients.male * bsa;
          point[`${config.id}_female`] = configCoefficients.female * bsa;
        } else {
          // Biological curves don't extend beyond population
          point[`${config.id}_male`] = undefined;
          point[`${config.id}_female`] = undefined;
        }
      }
    });
    
    chartData.push(point);
  }

  return chartData.sort((a, b) => a.scalingValue - b.scalingValue);
};

/**
 * Find the closest population point for a given scaling value
 */
const findClosestPoint = (points: PopulationPoint[], targetScalingValue: number): PopulationPoint | null => {
  if (points.length === 0) return null;

  return points.reduce((closest, current) => {
    const currentDiff = Math.abs(current.scalingValue - targetScalingValue);
    const closestDiff = Math.abs(closest.scalingValue - targetScalingValue);
    return currentDiff < closestDiff ? current : closest;
  });
};

/**
 * FIXED: Find the closest population point for a given BSA value
 * This ensures chart X-axis is always BSA regardless of scaling method
 */
const findClosestPointByBSA = (points: PopulationPoint[], targetBSA: number): PopulationPoint | null => {
  if (points.length === 0) return null;

  return points.reduce((closest, current) => {
    const currentDiff = Math.abs(current.bsa - targetBSA);
    const closestDiff = Math.abs(closest.bsa - targetBSA);
    return currentDiff < closestDiff ? current : closest;
  });
};

// =============================================================================
// VALIDATION METRICS
// =============================================================================

/**
 * Calculate validation metrics for each configuration
 */
const calculateValidationMetrics = (
  configuration: ScalingConfiguration,
  coefficients: ScalingCoefficients,
  populationData: { male: PopulationPoint[]; female: PopulationPoint[] },
  measurement: EnhancedMeasurementData
): ValidationMetrics => {
  // Calculate R-squared for the scaling relationship
  const allPoints = [...populationData.male, ...populationData.female];
  
  if (allPoints.length === 0) {
    return {
      rSquared: 0,
      correlation: 0,
      meanAbsoluteError: 0,
      coefficientOfVariation: 0
    };
  }

  // Calculate correlation
  const xValues = allPoints.map(p => p.scalingValue);
  const yValues = allPoints.map(p => p.measurementValue);
  
  const correlation = calculateCorrelation(xValues, yValues);
  const rSquared = correlation * correlation;

  // Calculate mean absolute error
  const predictions = xValues.map(x => {
    if (configuration.approach === 'ratiometric') {
      return (coefficients.male + coefficients.female) / 2 * x; // Average coefficient for ratiometric
    } else {
      const coefficient = coefficients.universal || (coefficients.male + coefficients.female) / 2;
      return coefficient * Math.pow(x, configuration.exponent);
    }
  });

  const absoluteErrors = yValues.map((y, i) => Math.abs(y - predictions[i]));
  const meanAbsoluteError = absoluteErrors.reduce((sum, err) => sum + err, 0) / absoluteErrors.length;

  // Calculate coefficient of variation
  const mean = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
  const variance = yValues.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0) / yValues.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;

  return {
    rSquared,
    correlation,
    meanAbsoluteError,
    coefficientOfVariation
  };
};

/**
 * Calculate Pearson correlation coefficient
 */
const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

// =============================================================================
// CORRELATION MATRIX ANALYSIS
// =============================================================================

/**
 * Calculate cross-method correlation matrix
 */
const calculateCorrelationMatrix = (
  configurations: ScalingConfiguration[],
  populationData: Record<string, { male: PopulationPoint[]; female: PopulationPoint[] }>
): CorrelationMatrix => {
  const configIds = configurations.map(c => c.id);
  const matrix: number[][] = [];

  // Extract measurement values for each configuration
  const configurationMeasurements: Record<string, number[]> = {};
  
  configIds.forEach(configId => {
    const data = populationData[configId];
    if (data) {
      configurationMeasurements[configId] = [...data.male, ...data.female].map(p => p.measurementValue);
    }
  });

  // Calculate correlation matrix
  configIds.forEach((id1, i) => {
    matrix[i] = [];
    configIds.forEach((id2, j) => {
      if (configurationMeasurements[id1] && configurationMeasurements[id2]) {
        const correlation = calculateCorrelation(
          configurationMeasurements[id1],
          configurationMeasurements[id2]
        );
        matrix[i][j] = correlation;
      } else {
        matrix[i][j] = i === j ? 1 : 0;
      }
    });
  });

  // Identify significant correlations
  const significantCorrelations: CorrelationMatrix['significantCorrelations'] = [];
  
  for (let i = 0; i < configIds.length; i++) {
    for (let j = i + 1; j < configIds.length; j++) {
      const correlation = matrix[i][j];
      const absCorrelation = Math.abs(correlation);
      
      let strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
      if (absCorrelation >= 0.9) strength = 'very_strong';
      else if (absCorrelation >= 0.7) strength = 'strong';
      else if (absCorrelation >= 0.5) strength = 'moderate';
      else strength = 'weak';

      if (absCorrelation >= 0.3) { // Only include correlations >= 0.3
        significantCorrelations.push({
          config1: configIds[i],
          config2: configIds[j],
          correlation,
          strength
        });
      }
    }
  }

  return {
    configurationIds: configIds,
    matrix,
    significantCorrelations
  };
};

// =============================================================================
// INSIGHTS GENERATION
// =============================================================================

/**
 * Generate insights and recommendations
 */
const generateInsights = (
  measurement: EnhancedMeasurementData,
  configurations: ScalingConfiguration[],
  coefficients: Record<string, ScalingCoefficients>,
  validationMetrics: Record<string, ValidationMetrics>,
  correlationMatrix: CorrelationMatrix
): DeweyMethodResult['insights'] => {
  // Find best configuration (highest R² and similarity)
  let bestConfig = configurations[0].id;
  let bestScore = 0;
  
  configurations.forEach(config => {
    const metrics = validationMetrics[config.id];
    const coeff = coefficients[config.id];
    
    if (metrics && coeff) {
      // Composite score: R² weighted by similarity percentage
      const score = metrics.rSquared * (coeff.similarity.percentage / 100);
      
      if (score > bestScore) {
        bestScore = score;
        bestConfig = config.id;
      }
    }
  });

  // Find worst configuration
  let worstConfig = configurations[0].id;
  let worstScore = 1;
  
  configurations.forEach(config => {
    const metrics = validationMetrics[config.id];
    const coeff = coefficients[config.id];
    
    if (metrics && coeff) {
      const score = metrics.rSquared * (coeff.similarity.percentage / 100);
      
      if (score < worstScore) {
        worstScore = score;
        worstConfig = config.id;
      }
    }
  });

  // Determine recommended approach based on measurement type
  const expectedExponents = getScalingExponents(measurement.type);
  let recommendedApproach = 'allometric_lbm'; // Default to LBM
  
  if (measurement.type === 'area') {
    // For areas, BSA^1.0 should be theoretically optimal
    recommendedApproach = 'allometric_bsa';
  } else if (measurement.type === 'linear') {
    // For linear measurements, LBM^0.33 is most universal
    recommendedApproach = 'allometric_lbm';
  }

  // Clinical relevance assessment
  const lbmSimilarity = coefficients['allometric_lbm']?.similarity.percentage || 0;
  const ratiometricSimilarity = coefficients['ratiometric_bsa']?.similarity.percentage || 0;
  
  let clinicalRelevance = 'moderate';
  if (Math.abs(lbmSimilarity - ratiometricSimilarity) > 20) {
    clinicalRelevance = 'high';
  } else if (Math.abs(lbmSimilarity - ratiometricSimilarity) < 5) {
    clinicalRelevance = 'low';
  }

  return {
    bestConfiguration: bestConfig,
    worstConfiguration: worstConfig,
    recommendedApproach,
    clinicalRelevance
  };
};

// =============================================================================
// MAIN DEWEY METHOD FACTORY FUNCTION
// =============================================================================

/**
 * Generate comprehensive scaling analysis using the Dewey methodology
 * 
 * This is the main function that orchestrates the entire analysis:
 * 1. Sets up canonical reference populations
 * 2. Calculates coefficients for each scaling configuration
 * 3. Generates population data across physiological ranges
 * 4. Creates chart-ready data for visualization
 * 5. Calculates validation metrics and correlations
 * 6. Provides insights and recommendations
 */
export const generateScalingAnalysis = (
  measurement: EnhancedMeasurementData,
  formulaSelection: FormulaSelectionState,
  configurations?: ScalingConfiguration[],
  options: AnalysisOptions = {}
): DeweyMethodResult => {
  // Use standard configurations if none provided
  const scalingConfigurations = configurations || getStandardConfigurations(measurement.type);
  
  // Generate canonical reference populations
  const referencePopulations = generateCanonicalReferences(formulaSelection);
  
  // Calculate coefficients for each configuration
  const coefficients: Record<string, ScalingCoefficients> = {};
  scalingConfigurations.forEach(config => {
    coefficients[config.id] = calculateCoefficients(measurement, config, referencePopulations);
  });
  
  // Generate population data for each configuration
  const populationData: Record<string, { male: PopulationPoint[]; female: PopulationPoint[] }> = {};
  scalingConfigurations.forEach(config => {
    populationData[config.id] = generatePopulationData(
      config,
      coefficients[config.id],
      formulaSelection,
      options
    );
  });
  
  // Generate chart data (with coefficients for ratiometric calculations)
  const chartData = generateChartData(scalingConfigurations, populationData, coefficients);
  
  // Calculate validation metrics
  const validationMetrics: Record<string, ValidationMetrics> = {};
  scalingConfigurations.forEach(config => {
    validationMetrics[config.id] = calculateValidationMetrics(
      config,
      coefficients[config.id],
      populationData[config.id],
      measurement
    );
  });
  
  // Calculate correlation matrix (if requested)
  const correlationMatrix = options.includeCorrelations !== false 
    ? calculateCorrelationMatrix(scalingConfigurations, populationData)
    : { configurationIds: [], matrix: [], significantCorrelations: [] };
  
  // Generate insights (if requested)
  const insights = options.generateInsights !== false
    ? generateInsights(measurement, scalingConfigurations, coefficients, validationMetrics, correlationMatrix)
    : {
        bestConfiguration: scalingConfigurations[0].id,
        worstConfiguration: scalingConfigurations[0].id,
        recommendedApproach: 'allometric_lbm',
        clinicalRelevance: 'moderate'
      };

  return {
    measurement,
    formulaSelection,
    referencePopulations,
    configurations: scalingConfigurations,
    coefficients,
    populationData,
    chartData,
    validationMetrics,
    correlationMatrix,
    insights
  };
};

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Generate quick two-way comparison (Ratiometric BSA vs Allometric LBM)
 */
export const generateQuickComparison = (
  measurement: EnhancedMeasurementData,
  formulaSelection: FormulaSelectionState,
  options: AnalysisOptions = {}
): DeweyMethodResult => {
  const expectedExponent = getScalingExponents(measurement.type).lbm;
  
  const configurations: ScalingConfiguration[] = [
    {
      id: 'ratiometric_bsa',
      name: 'Ratiometric BSA',
      approach: 'ratiometric',
      variable: 'bsa',
      exponent: 1.0,
      description: 'Current clinical standard'
    },
    {
      id: 'allometric_lbm',
      name: `Allometric LBM^${expectedExponent}`,
      approach: 'allometric',
      variable: 'lbm',
      exponent: expectedExponent,
      description: 'Universal biological scaling'
    }
  ];

  return generateScalingAnalysis(measurement, formulaSelection, configurations, options);
};

export default {
  generateScalingAnalysis,
  generateQuickComparison,
  getStandardConfigurations
};