// src/components/cardiacScaling/core/DeweyMethodFactory.ts

/**
 * ENHANCED VERSION: DeweyMethodFactory with configurable Z-score parameter
 * 
 * Maintains all existing functionality while adding configurable Z-score support:
 * - Z = 0.0: Use MESA mean values (typical physiology)
 * - Z = 1.96: Use upper limits (pathological thresholds) - previous default
 * - Any Z-score: Explore any percentile of the MESA distribution
 * 
 * Backward compatibility: Default Z-score = 1.96 preserves existing behavior
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
  sourceData?: 'bsa' | 'height' | 'height16' | 'height27';
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
  scalingValue: number; // Always BSA for chart X-axis
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

/**
 * ENHANCED: Analysis options with configurable Z-score parameter
 */
export interface AnalysisOptions {
  populationRange?: {
    height: { min: number; max: number; step: number };
    bmi: { min: number; max: number; step: number };
  };
  validationTarget?: 'strom' | 'literature' | 'geometric';
  includeCorrelations?: boolean;
  generateInsights?: boolean;
  zScore?: number; // NEW: Z-score for reference value calculation (default: 1.96)
}

// =============================================================================
// Z-SCORE UTILITIES & PRESETS
// =============================================================================

/**
 * Common Z-score values for quick selection
 */
export const Z_SCORE_PRESETS = {
  LOWER_LIMIT: -1.96,    // 2.5th percentile (Lower Limit of Normal)
  MINUS_2SD: -2.0,       // Mean - 2 Standard Deviations
  MINUS_1SD: -1.0,       // Mean - 1 Standard Deviation  
  MEAN: 0.0,             // 50th percentile (Population Mean)
  PLUS_1SD: 1.0,         // Mean + 1 Standard Deviation
  PLUS_2SD: 2.0,         // Mean + 2 Standard Deviations
  UPPER_LIMIT: 1.96,     // 97.5th percentile (Upper Limit of Normal) - previous default
} as const;

/**
 * Generate human-readable labels for Z-score values
 */
export const getZScoreLabel = (zScore: number): string => {
  // Check for exact matches with presets first
  const presets = Object.entries(Z_SCORE_PRESETS).find(([_, value]) => 
    Math.abs(value - zScore) < 0.01
  );
  
  if (presets) {
    const [key] = presets;
    switch (key) {
      case 'LOWER_LIMIT': return 'Lower Limit (2.5th percentile)';
      case 'MINUS_2SD': return 'Mean - 2 SD (2.3rd percentile)';
      case 'MINUS_1SD': return 'Mean - 1 SD (15.9th percentile)';
      case 'MEAN': return 'Mean (50th percentile)';
      case 'PLUS_1SD': return 'Mean + 1 SD (84.1st percentile)';
      case 'PLUS_2SD': return 'Mean + 2 SD (97.7th percentile)';
      case 'UPPER_LIMIT': return 'Upper Limit (97.5th percentile)';
    }
  }
  
  // Handle custom values
  if (Math.abs(zScore - 0) < 0.01) return 'Mean (50th percentile)';
  if (zScore > 0) return `Mean + ${zScore.toFixed(2)} SD`;
  return `Mean - ${Math.abs(zScore).toFixed(2)} SD`;
};

/**
 * Convert Z-score to approximate percentile
 */
export const getPercentileFromZScore = (zScore: number): number => {
  // For common values, use exact percentiles
  const exactPercentiles: Record<number, number> = {
    [-1.96]: 2.5,
    [-2.0]: 2.3,
    [-1.0]: 15.9,
    [0.0]: 50.0,
    [1.0]: 84.1,
    [2.0]: 97.7,
    [1.96]: 97.5
  };
  
  const exact = exactPercentiles[Math.round(zScore * 100) / 100];
  if (exact !== undefined) return exact;
  
  // Approximation for other values
  const percentile = 50 + 50 * Math.sign(zScore) * Math.sqrt(1 - Math.exp(-2 * zScore * zScore / Math.PI));
  return Math.round(percentile * 10) / 10;
};

/**
 * Validate Z-score is within reasonable bounds
 */
export const validateZScore = (zScore: number): { value: number; warnings: string[] } => {
  const warnings: string[] = [];
  let value = zScore;
  
  if (isNaN(zScore)) {
    warnings.push('Invalid Z-score, using default (1.96)');
    value = 1.96;
  } else if (zScore < -3) {
    warnings.push('Z-score below -3 may produce unrealistic reference values');
  } else if (zScore > 3) {
    warnings.push('Z-score above 3 may produce unrealistic reference values');
  }
  
  return { value, warnings };
};

/**
 * Get descriptive context for Z-score selection
 */
export const getZScoreContext = (zScore: number): string => {
  if (Math.abs(zScore - 0) < 0.01) {
    return 'Using mean MESA values - represents typical cardiac physiology';
  } else if (Math.abs(zScore - 1.96) < 0.01) {
    return 'Using upper limits of normal - represents pathological thresholds (previous default)';
  } else if (Math.abs(zScore - (-1.96)) < 0.01) {
    return 'Using lower limits of normal - represents minimum normal values';
  } else if (zScore > 0) {
    return `Using above-average values - represents larger cardiac measurements (${getPercentileFromZScore(zScore)}th percentile)`;
  } else {
    return `Using below-average values - represents smaller cardiac measurements (${getPercentileFromZScore(zScore)}th percentile)`;
  }
};

// =============================================================================
// CANONICAL REFERENCE POPULATIONS
// =============================================================================

const CANONICAL_REFERENCE_BASE = {
  male: { height: 178, bmi: 24, weight: 76.1 },
  female: { height: 164, bmi: 24, weight: 64.6 }
};

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
// SCALING CONFIGURATIONS
// =============================================================================

/**
 * Generate standard scaling configurations with consistent allometric terminology
 */
export const getStandardConfigurations = (measurementType: MeasurementType): ScalingConfiguration[] => {
  const expectedExponents = getScalingExponents(measurementType);

  const configs: ScalingConfiguration[] = [
    // Ratiometric BSA (always uses BSA-indexed data)
    {
      id: 'ratiometric_bsa',
      name: 'Ratiometric BSA',
      approach: 'ratiometric',
      variable: 'bsa',
      exponent: 1.0,
      description: 'Current clinical standard - linear BSA indexing',
      sourceData: 'bsa'
    },

    // Allometric LBM (universal biological - uses BSA-indexed data)
    {
      id: 'allometric_lbm',
      name: expectedExponents.lbm === 1.0 
        ? 'Ratiometric LBM'
        : `Allometric LBM^${expectedExponents.lbm}`,
      approach: 'allometric',
      variable: 'lbm',
      exponent: expectedExponents.lbm,
      description: expectedExponents.lbm === 1.0
        ? 'Geometrically appropriate - both measurement and LBM are 3D/mass'
        : 'Universal biological scaling based on lean body mass',
      sourceData: 'bsa'
    }
  ];

  // Add BSA allometric ONLY if it's different from ratiometric
  if (measurementType !== 'area') {
    configs.push({
      id: 'allometric_bsa',
      name: `Allometric BSA^${expectedExponents.bsa}`,
      approach: 'allometric',
      variable: 'bsa',
      exponent: expectedExponents.bsa,
      description: 'Geometric scaling using body surface area',
      sourceData: 'bsa'
    });
  }

  // Standard height scaling
  if (expectedExponents.height === 1.0) {
    configs.push({
      id: 'allometric_height',
      name: 'Ratiometric Height',
      approach: 'allometric',
      variable: 'height',
      exponent: 1.0,
      description: 'Geometrically appropriate height scaling for 1D measurements',
      sourceData: 'height'
    });
  } else {
    configs.push({
      id: 'allometric_height',
      name: `Allometric Height^${expectedExponents.height}`,
      approach: 'allometric',
      variable: 'height',
      exponent: expectedExponents.height,
      description: measurementType === 'area' 
        ? 'Geometric ideal allometric height scaling for 2D measurements'
        : 'Theoretical geometric allometric height scaling for 3D measurements',
      sourceData: 'height'
    });
  }

  // Add empirical allometric height options for area/mass/volume measurements
  if (measurementType === 'area' || measurementType === 'mass' || measurementType === 'volume') {
    configs.push(
      {
        id: 'allometric_height_16',
        name: 'Allometric Height^1.6 (Empirical)',
        approach: 'allometric',
        variable: 'height',
        exponent: 1.6,
        description: 'Empirical allometric height scaling from literature',
        sourceData: 'height16'
      },
      {
        id: 'allometric_height_27',
        name: 'Allometric Height^2.7 (Empirical)',
        approach: 'allometric',
        variable: 'height',
        exponent: 2.7,
        description: 'Empirical allometric height scaling from literature',
        sourceData: 'height27'
      }
    );
  }

  return configs;
};

// =============================================================================
// ENHANCED COEFFICIENT CALCULATION WITH Z-SCORE
// =============================================================================

/**
 * ENHANCED: Calculate scaling coefficients with configurable Z-score for reference point selection
 * 
 * The Z-score parameter determines which percentile of the MESA reference distribution 
 * is used for coefficient derivation:
 * - Higher Z-scores (e.g., 1.96) use upper percentiles (pathological thresholds)
 * - Z-score = 0.0 uses mean values (typical physiology)
 * - Lower Z-scores (e.g., -1.96) use lower percentiles (minimum normal)
 */
const calculateCoefficients = (
  measurement: EnhancedMeasurementData,
  configuration: ScalingConfiguration,
  referencePopulations: DeweyMethodResult['referencePopulations'],
  zScore: number = 1.96 // Default maintains backward compatibility (ULN)
): ScalingCoefficients => {
  
  // Step 1: Get indexed reference values using CONFIGURABLE Z-score
  const getIndexedValues = (sex: Sex) => {
    const data = measurement[sex];
    
    switch (configuration.sourceData) {
      case 'height':
        if (!data.height) throw new Error(`Height data not available for ${measurement.name}`);
        return data.height.mean + zScore * data.height.sd;
      case 'height16':
        if (!data.height16) throw new Error(`Height^1.6 data not available for ${measurement.name}`);
        return data.height16.mean + zScore * data.height16.sd;
      case 'height27':
        if (!data.height27) throw new Error(`Height^2.7 data not available for ${measurement.name}`);
        return data.height27.mean + zScore * data.height27.sd;
      case 'bsa':
      default:
        return data.bsa.mean + zScore * data.bsa.sd;
    }
  };

  const maleIndexed = getIndexedValues('male');
  const femaleIndexed = getIndexedValues('female');

  // Step 2: Back-calculate absolute values using CORRECT scaling variable for the source data
  const getBackCalculationVariable = (sex: Sex) => {
    const pop = referencePopulations[sex];
    
    switch (configuration.sourceData) {
      case 'height':
        return pop.height / 100; // Convert to meters
      case 'height16':
        return Math.pow(pop.height / 100, 1.6); // Height^1.6 in meters
      case 'height27':
        return Math.pow(pop.height / 100, 2.7); // Height^2.7 in meters
      case 'bsa':
      default:
        return pop.bsa;
    }
  };

  const maleBackCalcVar = getBackCalculationVariable('male');
  const femaleBackCalcVar = getBackCalculationVariable('female');
  
  // Calculate absolute measurements from indexed values
  const maleAbsolute = maleIndexed * maleBackCalcVar;
  const femaleAbsolute = femaleIndexed * femaleBackCalcVar;

  // Step 3: Coefficient derivation based on scaling approach
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
    // Allometric calculation with proper scaling values
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

    // Universal coefficient ONLY for LBM (biological scaling)
    const shouldUseUniversal = configuration.variable === 'lbm';
    const universalCoefficient = shouldUseUniversal ? (maleCoefficient + femaleCoefficient) / 2 : undefined;
    
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
// POPULATION GENERATION & CHART DATA
// =============================================================================

const generatePopulationData = (
  configuration: ScalingConfiguration,
  coefficients: ScalingCoefficients,
  formulaSelection: FormulaSelectionState,
  options: AnalysisOptions
): { male: PopulationPoint[]; female: PopulationPoint[] } => {
  const range = options.populationRange || {
    height: { min: 120, max: 220, step: 1 },
    bmi: { min: 24, max: 24, step: 1 }
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
          case 'height': scalingValue = height / 100; break;
          default: scalingValue = bsa;
        }

        // Calculate measurement value
        let measurementValue: number;
        if (configuration.approach === 'ratiometric') {
          measurementValue = coefficients[sex] * scalingValue;
        } else {
          // Use universal coefficient for LBM, sex-specific for others
          const coefficient = (configuration.variable === 'lbm' && coefficients.universal) 
            ? coefficients.universal 
            : coefficients[sex];
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
            ageCategory: 'adult'
          }
        });
      }
    }
  });

  return populations;
};

const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  if (bmi < 35) return 'obese_1';
  if (bmi < 40) return 'obese_2';
  return 'obese_3';
};

const generateChartData = (
  configurations: ScalingConfiguration[],
  populationData: Record<string, { male: PopulationPoint[]; female: PopulationPoint[] }>,
  coefficients: Record<string, ScalingCoefficients>
): ChartDataPoint[] => {
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

  // Process population data
  configurations.forEach(config => {
    const data = populationData[config.id];
    const configCoefficients = coefficients[config.id];
    
    if (data && configCoefficients) {
      // Process both sexes
      (['male', 'female'] as const).forEach(sex => {
        data[sex].forEach(point => {
          const bsa = Math.round(point.bsa * 100) / 100;
          
          if (!bsaToDataMap.has(bsa)) {
            bsaToDataMap.set(bsa, { scalingValue: bsa });
          }
          
          const chartPoint = bsaToDataMap.get(bsa)!;
          
          if (config.approach === 'ratiometric') {
            chartPoint[`${config.id}_${sex}`] = configCoefficients[sex] * bsa;
          } else {
            chartPoint[`${config.id}_${sex}`] = point.measurementValue;
          }
        });
      });
    }
  });

  // Convert and extend for ratiometric lines
  const chartData = Array.from(bsaToDataMap.values()).sort((a, b) => a.scalingValue - b.scalingValue);
  const maxBSA = Math.max(...chartData.map(p => p.scalingValue));
  const extendTo = Math.max(3.5, maxBSA);
  
  for (let bsa = Math.ceil(maxBSA * 10) / 10; bsa <= extendTo; bsa += 0.1) {
    const point: ChartDataPoint = { scalingValue: bsa };
    
    configurations.forEach(config => {
      const configCoefficients = coefficients[config.id];
      if (configCoefficients) {
        if (config.approach === 'ratiometric') {
          point[`${config.id}_male`] = configCoefficients.male * bsa;
          point[`${config.id}_female`] = configCoefficients.female * bsa;
        } else {
          point[`${config.id}_male`] = undefined;
          point[`${config.id}_female`] = undefined;
        }
      }
    });
    
    chartData.push(point);
  }

  return chartData.sort((a, b) => a.scalingValue - b.scalingValue);
};

// =============================================================================
// VALIDATION & CORRELATION
// =============================================================================

const calculateValidationMetrics = (
  configuration: ScalingConfiguration,
  coefficients: ScalingCoefficients,
  populationData: { male: PopulationPoint[]; female: PopulationPoint[] },
  measurement: EnhancedMeasurementData
): ValidationMetrics => {
  const allPoints = [...populationData.male, ...populationData.female];
  
  if (allPoints.length === 0) {
    return { rSquared: 0, correlation: 0, meanAbsoluteError: 0, coefficientOfVariation: 0 };
  }

  const xValues = allPoints.map(p => p.scalingValue);
  const yValues = allPoints.map(p => p.measurementValue);
  
  const correlation = calculateCorrelation(xValues, yValues);
  const rSquared = correlation * correlation;

  const predictions = xValues.map(x => {
    if (configuration.approach === 'ratiometric') {
      return (coefficients.male + coefficients.female) / 2 * x;
    } else {
      const coefficient = coefficients.universal || (coefficients.male + coefficients.female) / 2;
      return coefficient * Math.pow(x, configuration.exponent);
    }
  });

  const absoluteErrors = yValues.map((y, i) => Math.abs(y - predictions[i]));
  const meanAbsoluteError = absoluteErrors.reduce((sum, err) => sum + err, 0) / absoluteErrors.length;

  const mean = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
  const variance = yValues.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0) / yValues.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;

  return { rSquared, correlation, meanAbsoluteError, coefficientOfVariation };
};

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

const calculateCorrelationMatrix = (
  configurations: ScalingConfiguration[],
  populationData: Record<string, { male: PopulationPoint[]; female: PopulationPoint[] }>
): CorrelationMatrix => {
  const configIds = configurations.map(c => c.id);
  const matrix: number[][] = [];
  const configurationMeasurements: Record<string, number[]> = {};
  
  configIds.forEach(configId => {
    const data = populationData[configId];
    if (data) {
      configurationMeasurements[configId] = [...data.male, ...data.female].map(p => p.measurementValue);
    }
  });

  configIds.forEach((id1, i) => {
    matrix[i] = [];
    configIds.forEach((id2, j) => {
      if (configurationMeasurements[id1] && configurationMeasurements[id2]) {
        const correlation = calculateCorrelation(configurationMeasurements[id1], configurationMeasurements[id2]);
        matrix[i][j] = correlation;
      } else {
        matrix[i][j] = i === j ? 1 : 0;
      }
    });
  });

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

      if (absCorrelation >= 0.3) {
        significantCorrelations.push({
          config1: configIds[i],
          config2: configIds[j],
          correlation,
          strength
        });
      }
    }
  }

  return { configurationIds: configIds, matrix, significantCorrelations };
};

const generateInsights = (
  measurement: EnhancedMeasurementData,
  configurations: ScalingConfiguration[],
  coefficients: Record<string, ScalingCoefficients>,
  validationMetrics: Record<string, ValidationMetrics>,
  correlationMatrix: CorrelationMatrix
): DeweyMethodResult['insights'] => {
  let bestConfig = configurations[0].id;
  let bestScore = 0;
  
  configurations.forEach(config => {
    const metrics = validationMetrics[config.id];
    const coeff = coefficients[config.id];
    
    if (metrics && coeff) {
      const score = metrics.rSquared * (coeff.similarity.percentage / 100);
      if (score > bestScore) {
        bestScore = score;
        bestConfig = config.id;
      }
    }
  });

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

  let recommendedApproach = 'allometric_lbm';
  if (measurement.type === 'area') {
    recommendedApproach = 'ratiometric_bsa';
  } else if (measurement.type === 'linear') {
    recommendedApproach = 'allometric_height';
  }

  const lbmSimilarity = coefficients['allometric_lbm']?.similarity.percentage || 0;
  const ratiometricSimilarity = coefficients['ratiometric_bsa']?.similarity.percentage || 0;
  
  let clinicalRelevance = 'moderate';
  if (Math.abs(lbmSimilarity - ratiometricSimilarity) > 20) {
    clinicalRelevance = 'high';
  } else if (Math.abs(lbmSimilarity - ratiometricSimilarity) < 5) {
    clinicalRelevance = 'low';
  }

  return { bestConfiguration: bestConfig, worstConfiguration: worstConfig, recommendedApproach, clinicalRelevance };
};

// =============================================================================
// ENHANCED MAIN FACTORY FUNCTIONS
// =============================================================================

/**
 * ENHANCED: Main factory function with configurable Z-score support
 * 
 * Now accepts zScore in options to determine reference point for coefficient derivation.
 * Maintains backward compatibility by defaulting to 1.96 (upper limits).
 */
export const generateScalingAnalysis = (
  measurement: EnhancedMeasurementData,
  formulaSelection: FormulaSelectionState,
  configurations?: ScalingConfiguration[],
  options: AnalysisOptions = {}
): DeweyMethodResult => {
  const scalingConfigurations = configurations || getStandardConfigurations(measurement.type);
  const referencePopulations = generateCanonicalReferences(formulaSelection);
  
  // Extract Z-score with backward-compatible default
  const zScore = options.zScore ?? 1.96; // Default to ULN for backward compatibility
  
  console.log(`Scaling Analysis: Using Z-score ${zScore} for coefficient derivation`);
  
  const coefficients: Record<string, ScalingCoefficients> = {};
  scalingConfigurations.forEach(config => {
    coefficients[config.id] = calculateCoefficients(
      measurement, 
      config, 
      referencePopulations, 
      zScore // Pass Z-score to coefficient calculation
    );
  });
  
  const populationData: Record<string, { male: PopulationPoint[]; female: PopulationPoint[] }> = {};
  scalingConfigurations.forEach(config => {
    populationData[config.id] = generatePopulationData(config, coefficients[config.id], formulaSelection, options);
  });
  
  const chartData = generateChartData(scalingConfigurations, populationData, coefficients);
  
  const validationMetrics: Record<string, ValidationMetrics> = {};
  scalingConfigurations.forEach(config => {
    validationMetrics[config.id] = calculateValidationMetrics(config, coefficients[config.id], populationData[config.id], measurement);
  });
  
  const correlationMatrix = options.includeCorrelations !== false 
    ? calculateCorrelationMatrix(scalingConfigurations, populationData)
    : { configurationIds: [], matrix: [], significantCorrelations: [] };
  
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

/**
 * ENHANCED: Quick comparison with Z-score support
 * 
 * Passes through Z-score to the full analysis for simplified two-approach comparison.
 */
export const generateQuickComparison = (
  measurement: EnhancedMeasurementData,
  formulaSelection: FormulaSelectionState,
  options: AnalysisOptions = {}
): DeweyMethodResult => {
  const expectedExponent = getScalingExponents(measurement.type).lbm;
  
  // Extract Z-score for logging
  const zScore = options.zScore ?? 1.96;
  console.log(`Quick Comparison: Using Z-score ${zScore} for ratiometric vs. allometric LBM`);
  
  const configurations: ScalingConfiguration[] = [
    {
      id: 'ratiometric_bsa',
      name: 'Ratiometric BSA',
      approach: 'ratiometric',
      variable: 'bsa',
      exponent: 1.0,
      description: 'Current clinical standard',
      sourceData: 'bsa'
    },
    {
      id: 'allometric_lbm',
      name: expectedExponent === 1.0 
        ? 'Ratiometric LBM'
        : `Allometric LBM^${expectedExponent}`,
      approach: 'allometric',
      variable: 'lbm',
      exponent: expectedExponent,
      description: expectedExponent === 1.0
        ? 'Geometrically appropriate scaling'
        : 'Universal biological scaling',
      sourceData: 'bsa'
    }
  ];

  // Pass through all options including Z-score to full analysis
  return generateScalingAnalysis(measurement, formulaSelection, configurations, options);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  generateScalingAnalysis,
  generateQuickComparison,
  getStandardConfigurations,
  Z_SCORE_PRESETS,
  getZScoreLabel,
  getPercentileFromZScore,
  validateZScore,
  getZScoreContext,
  getExpectedLBMExponent,
  formatCoefficient
};