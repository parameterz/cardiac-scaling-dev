// src/components/cardiacScaling/core/DeweyMethodFactory.ts

/**
 * FIXED VERSION: Dewey Method Factory - Universal Cardiac Scaling Analysis Engine
 * 
 * KEY BUG FIX: Height^1.6 and Height^2.7 back-calculation now uses correct exponents
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
// TYPE DEFINITIONS (unchanged)
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
// CANONICAL REFERENCE POPULATIONS (unchanged)
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
// PREDEFINED SCALING CONFIGURATIONS (unchanged)
// =============================================================================

export const getStandardConfigurations = (measurementType: MeasurementType): ScalingConfiguration[] => {
  const expectedExponents = getScalingExponents(measurementType);

  const configs: ScalingConfiguration[] = [
    {
      id: 'ratiometric_bsa',
      name: 'Ratiometric BSA',
      approach: 'ratiometric',
      variable: 'bsa',
      exponent: 1.0,
      description: 'Current clinical standard - linear BSA indexing',
      sourceData: 'bsa'
    },
    {
      id: 'allometric_lbm',
      name: `Allometric LBM^${expectedExponents.lbm}`,
      approach: 'allometric',
      variable: 'lbm',
      exponent: expectedExponents.lbm,
      description: 'Universal biological scaling based on lean body mass',
      sourceData: 'bsa'
    }
  ];

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

  configs.push({
    id: 'allometric_height',
    name: `Allometric Height^${expectedExponents.height}`,
    approach: 'allometric',
    variable: 'height',
    exponent: expectedExponents.height,
    description: 'Geometric height scaling',
    sourceData: 'height'
  });

  if (measurementType === 'area' || measurementType === 'mass' || measurementType === 'volume') {
    configs.push(
      {
        id: 'height_16',
        name: 'Height^1.6 (Empirical)',
        approach: 'allometric',
        variable: 'height',
        exponent: 1.6,
        description: 'Empirical height scaling from literature',
        sourceData: 'height16'
      },
      {
        id: 'height_27',
        name: 'Height^2.7 (Empirical)',
        approach: 'allometric',
        variable: 'height',
        exponent: 2.7,
        description: 'Empirical height scaling from literature',
        sourceData: 'height27'
      }
    );
  }

  if (measurementType === 'mass' || measurementType === 'volume') {
    configs.push({
      id: 'height_geometric',
      name: 'Height^3.0 (Theoretical)',
      approach: 'allometric',
      variable: 'height',
      exponent: 3.0,
      description: 'Theoretical geometric scaling for 3D measurements',
      sourceData: 'height'
    });
  }

  if (measurementType === 'area') {
    configs.push({
      id: 'height_geometric',
      name: 'Height^2.0 (Theoretical)',
      approach: 'allometric',
      variable: 'height',
      exponent: 2.0,
      description: 'Theoretical geometric scaling for 2D measurements',
      sourceData: 'height'
    });
  }

  return configs;
};

// =============================================================================
// FIXED: COEFFICIENT CALCULATION - HEIGHT EXPONENT BUG FIX
// =============================================================================

/**
 * FIXED: Calculate scaling coefficients using proper source data and exponents
 * 🐛 BUG FIX: Height^1.6 and Height^2.7 now use correct powered heights for back-calculation
 */
const calculateCoefficients = (
  measurement: EnhancedMeasurementData,
  configuration: ScalingConfiguration,
  referencePopulations: DeweyMethodResult['referencePopulations']
): ScalingCoefficients => {
  
  // Step 1 - Get indexed reference values from CORRECT source (unchanged)
  const getIndexedValues = (sex: Sex) => {
    const data = measurement[sex];
    
    switch (configuration.sourceData) {
      case 'height':
        if (!data.height) throw new Error(`Height data not available for ${measurement.name}`);
        return data.height.mean + 1.96 * data.height.sd;
      case 'height16':
        if (!data.height16) throw new Error(`Height^1.6 data not available for ${measurement.name}`);
        return data.height16.mean + 1.96 * data.height16.sd;
      case 'height27':
        if (!data.height27) throw new Error(`Height^2.7 data not available for ${measurement.name}`);
        return data.height27.mean + 1.96 * data.height27.sd;
      case 'bsa':
      default:
        return data.bsa.mean + 1.96 * data.bsa.sd;
    }
  };

  const maleIndexed = getIndexedValues('male');
  const femaleIndexed = getIndexedValues('female');

  // 🐛 FIXED: Step 2 - Back-calculate absolute values using CORRECT scaling variable
  const getBackCalculationVariable = (sex: Sex) => {
    const pop = referencePopulations[sex];
    const heightInMeters = pop.height / 100;
    
    switch (configuration.sourceData) {
      case 'height':
        return heightInMeters; // height^1.0
      case 'height16':
        return Math.pow(heightInMeters, 1.6); // 🔧 FIX: height^1.6
      case 'height27':
        return Math.pow(heightInMeters, 2.7); // 🔧 FIX: height^2.7
      case 'bsa':
      default:
        return pop.bsa;
    }
  };

  const maleBackCalcVar = getBackCalculationVariable('male');
  const femaleBackCalcVar = getBackCalculationVariable('female');
  
  const maleAbsolute = maleIndexed * maleBackCalcVar;
  const femaleAbsolute = femaleIndexed * femaleBackCalcVar;

  console.log(`🔧 Coefficient calculation for ${configuration.id}:`);
  console.log(`   Male indexed: ${maleIndexed.toFixed(3)} -> absolute: ${maleAbsolute.toFixed(2)}`);
  console.log(`   Female indexed: ${femaleIndexed.toFixed(3)} -> absolute: ${femaleAbsolute.toFixed(2)}`);
  console.log(`   Back-calc variables: M=${maleBackCalcVar.toFixed(3)}, F=${femaleBackCalcVar.toFixed(3)}`);

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

    console.log(`   Scaling values: M=${maleScalingValue.toFixed(3)}^${configuration.exponent}, F=${femaleScalingValue.toFixed(3)}^${configuration.exponent}`);
    console.log(`   Coefficients: M=${maleCoefficient.toFixed(3)}, F=${femaleCoefficient.toFixed(3)}`);

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
// REST OF THE CODE (unchanged - population generation, validation, etc.)
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
// VALIDATION & CORRELATION (unchanged)
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
    recommendedApproach = 'allometric_lbm';
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
// MAIN FACTORY FUNCTIONS (unchanged)
// =============================================================================

export const generateScalingAnalysis = (
  measurement: EnhancedMeasurementData,
  formulaSelection: FormulaSelectionState,
  configurations?: ScalingConfiguration[],
  options: AnalysisOptions = {}
): DeweyMethodResult => {
  const scalingConfigurations = configurations || getStandardConfigurations(measurement.type);
  const referencePopulations = generateCanonicalReferences(formulaSelection);
  
  console.log(`🔧 Starting scaling analysis for ${measurement.name} (${measurement.type})`);
  
  const coefficients: Record<string, ScalingCoefficients> = {};
  scalingConfigurations.forEach(config => {
    coefficients[config.id] = calculateCoefficients(measurement, config, referencePopulations);
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
      description: 'Current clinical standard',
      sourceData: 'bsa'
    },
    {
      id: 'allometric_lbm',
      name: `Allometric LBM^${expectedExponent}`,
      approach: 'allometric',
      variable: 'lbm',
      exponent: expectedExponent,
      description: 'Universal biological scaling',
      sourceData: 'bsa'
    }
  ];

  return generateScalingAnalysis(measurement, formulaSelection, configurations, options);
};

export default {
  generateScalingAnalysis,
  generateQuickComparison,
  getStandardConfigurations
};