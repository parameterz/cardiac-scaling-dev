// src/data/stromData.ts

/**
 * Strom et al. Table 3 Reference Data - DRY Version
 * Multi-Ethnic Study of Atherosclerosis (MESA) normal reference limits
 * 
 * Source: Strom JB, et al. Reference Values for Indexed Echocardiographic 
 * Chamber Sizes in Older Adults: The Multi-Ethnic Study of Atherosclerosis. 
 * J Am Heart Assoc. 2024;13:e034029.
 */

import { getReferencePopulation, type PopulationCharacteristics } from './populationDefinitions';

export type Sex = 'male' | 'female';
export type IndexationType = 'bsa' | 'bmi' | 'height' | 'height16' | 'height27';
export type MeasurementType = 'linear' | 'area' | 'mass' | 'volume';

export interface IndexedValue {
  mean: number;
  sd: number;
}

/**
 * Core measurement data - only essential information stored
 * Everything else (type, indexed units) is derived automatically
 */
export interface MeasurementData {
  id: string;
  name: string;
  absoluteUnit: string;  // 'cm', 'cm²', 'g', 'mL' - this determines everything else
  male: {
    bsa: IndexedValue;
    bmi?: IndexedValue;
    height?: IndexedValue;
    height16?: IndexedValue;
    height27?: IndexedValue;
  };
  female: {
    bsa: IndexedValue;
    bmi?: IndexedValue;
    height?: IndexedValue;
    height16?: IndexedValue;
    height27?: IndexedValue;
  };
}

/**
 * Enhanced measurement with derived properties
 */
export interface EnhancedMeasurementData extends MeasurementData {
  type: MeasurementType;
  getIndexedUnit: (indexType: IndexationType) => string;
}

// =============================================================================
// DRY DERIVATION SYSTEM
// =============================================================================

/**
 * Map absolute units to measurement types
 */
const UNIT_TYPE_MAP: Record<string, MeasurementType> = {
  // Linear measurements (1D)
  'cm': 'linear',
  'mm': 'linear',
  'm': 'linear', //meters can also be used for linear measurements
  
  // Area measurements (2D)
  'cm²': 'area',
  'cm2': 'area',
  'mm²': 'area',
  
  // Mass measurements (3D - tissue)
  'g': 'mass',
  'kg': 'mass',
  
  // Volume measurements (3D - chamber/flow)
  'mL': 'volume',
  'ml': 'volume',
  'L': 'volume',
  'L/min': 'volume'
};

/**
 * Generate indexed unit from absolute unit and index type
 */
const generateIndexedUnit = (absoluteUnit: string, indexType: IndexationType): string => {
  const indexUnitMap = {
    bsa: 'm²',
    height: 'm',
    bmi: 'kg/m²',
    height16: 'm^1.6',
    height27: 'm^2.7'
  };
  
  return `${absoluteUnit}/${indexUnitMap[indexType]}`;
};

/**
 * Derive measurement type from absolute unit
 */
export const deriveMeasurementType = (absoluteUnit: string): MeasurementType => {
  const type = UNIT_TYPE_MAP[absoluteUnit];
  if (!type) {
    throw new Error(`Unknown absolute unit: ${absoluteUnit}. Supported units: ${Object.keys(UNIT_TYPE_MAP).join(', ')}`);
  }
  return type;
};

/**
 * Enhance measurement with derived properties
 */
export const enhanceMeasurement = (measurement: MeasurementData): EnhancedMeasurementData => {
  const type = deriveMeasurementType(measurement.absoluteUnit);
  
  return {
    ...measurement,
    type,
    getIndexedUnit: (indexType: IndexationType) => generateIndexedUnit(measurement.absoluteUnit, indexType)
  };
};

// =============================================================================
// STROM MEASUREMENTS (DRY - ONLY ESSENTIAL DATA)
// =============================================================================

/**
 * Raw Strom data - only absoluteUnit + reference values
 * Type and indexed units derived automatically
 */
export const STROM_MEASUREMENTS_RAW: MeasurementData[] = [
  // =============================================================================
  // LINEAR MEASUREMENTS (absoluteUnit: 'cm' → type: 'linear')
  // =============================================================================
  {
    id: 'lvdd',
    name: 'LV End-Diastolic Dimension',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 2.3, sd: 0.3 },
      height: { mean: 2.57, sd: 0.29 }
    },
    female: {
      bsa: { mean: 2.4, sd: 0.3 },
      height: { mean: 2.57, sd: 0.28 }
    }
  },
  {
    id: 'lvsd',
    name: 'LV End-Systolic Dimension',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 1.6, sd: 0.2 },
      height: { mean: 1.73, sd: 0.23 }
    },
    female: {
      bsa: { mean: 1.6, sd: 0.2 },
      height: { mean: 1.70, sd: 0.21 }
    }
  },
  {
    id: 'ivsd',
    name: 'Septal Wall Thickness',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 0.61, sd: 0.11 },
      height: { mean: 0.68, sd: 0.13 }
    },
    female: {
      bsa: { mean: 0.60, sd: 0.13 },
      height: { mean: 0.64, sd: 0.14 }
    }
  },
  {
    id: 'lvpw',
    name: 'Posterior Wall Thickness',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 0.50, sd: 0.07 },
      height: { mean: 0.55, sd: 0.08 }
    },
    female: {
      bsa: { mean: 0.51, sd: 0.07 },
      height: { mean: 0.54, sd: 0.07 }
    }
  },
  {
    id: 'lvot',
    name: 'LV Outflow Tract Diameter',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 1.16, sd: 0.11 },
      height: { mean: 1.28, sd: 0.10 }
    },
    female: {
      bsa: { mean: 1.16, sd: 0.11 },
      height: { mean: 1.23, sd: 0.09 }
    }
  },
  {
    id: 'ivc_max',
    name: 'Maximum IVC Diameter',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 0.80, sd: 0.16 },
      height: { mean: 0.89, sd: 0.18 }
    },
    female: {
      bsa: { mean: 0.86, sd: 0.18 },
      height: { mean: 0.91, sd: 0.19 }
    }
  },
  {
    id: 'ivc_min',
    name: 'Minimum IVC Diameter',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 0.28, sd: 0.09 },
      height: { mean: 0.31, sd: 0.11 }
    },
    female: {
      bsa: { mean: 0.29, sd: 0.10 },
      height: { mean: 0.30, sd: 0.11 }
    }
  },
  {
    id: 'tapse',
    name: 'Tricuspid Annular Plane Systolic Excursion',
    absoluteUnit: 'cm',
    male: {
      bsa: { mean: 1.16, sd: 0.20 },
      height: { mean: 1.29, sd: 0.19 }
    },
    female: {
      bsa: { mean: 1.26, sd: 0.23 },
      height: { mean: 1.33, sd: 0.20 }
    }
  },

  // =============================================================================
  // AREA MEASUREMENTS (absoluteUnit: 'cm²' → type: 'area')
  // =============================================================================
  {
    id: 'raesa',
    name: 'Right Atrial End-Systolic Area',
    absoluteUnit: 'cm²',
    male: {
      bsa: { mean: 9.43, sd: 1.89 },
      height: { mean: 10.50, sd: 2.10 },
      height16: { mean: 7.59, sd: 1.54 },
      height27: { mean: 4.20, sd: 0.95 }
    },
    female: {
      bsa: { mean: 8.55, sd: 1.50 },
      height: { mean: 9.09, sd: 1.67 },
      height16: { mean: 6.85, sd: 1.28 },
      height27: { mean: 4.09, sd: 0.84 }
    }
  },
  {
    id: 'rveda',
    name: 'RV End-Diastolic Area',
    absoluteUnit: 'cm²',
    male: {
      bsa: { mean: 10.65, sd: 1.61 },
      height: { mean: 11.89, sd: 1.98 },
      height16: { mean: 8.59, sd: 1.44 },
      height27: { mean: 4.75, sd: 0.92 }
    },
    female: {
      bsa: { mean: 9.52, sd: 1.35 },
      height: { mean: 10.12, sd: 1.58 },
      height16: { mean: 7.63, sd: 1.20 },
      height27: { mean: 4.55, sd: 0.80 }
    }
  },
  {
    id: 'rvesa',
    name: 'RV End-Systolic Area',
    absoluteUnit: 'cm²',
    male: {
      bsa: { mean: 6.47, sd: 1.05 },
      height: { mean: 7.23, sd: 1.28 },
      height16: { mean: 5.22, sd: 0.94 },
      height27: { mean: 2.89, sd: 0.60 }
    },
    female: {
      bsa: { mean: 5.58, sd: 0.81 },
      height: { mean: 5.94, sd: 0.98 },
      height16: { mean: 4.48, sd: 0.74 },
      height27: { mean: 2.67, sd: 0.49 }
    }
  },

  // =============================================================================
  // MASS MEASUREMENTS (absoluteUnit: 'g' → type: 'mass')
  // =============================================================================
  {
    id: 'lvm',
    name: 'LV Mass',
    absoluteUnit: 'g',
    male: {
      bsa: { mean: 84.8, sd: 17.7 },
      height: { mean: 95.12, sd: 22.92 },
      height16: { mean: 68.75, sd: 17.0 },
      height27: { mean: 38.03, sd: 10.95 }
    },
    female: {
      bsa: { mean: 72.20, sd: 15.3 },
      height: { mean: 77.26, sd: 19.28 },
      height16: { mean: 58.20, sd: 14.54 },
      height27: { mean: 34.71, sd: 9.04 }
    }
  },

  // =============================================================================
  // VOLUME MEASUREMENTS (absoluteUnit: 'mL' or 'L/min' → type: 'volume')
  // =============================================================================
  {
    id: 'lvedv',
    name: 'Biplane LV End-Diastolic Volume',
    absoluteUnit: 'mL',
    male: {
      bsa: { mean: 45.0, sd: 7.9 },
      height: { mean: 50.33, sd: 9.83 },
      height16: { mean: 36.34, sd: 7.07 },
      height27: { mean: 20.06, sd: 4.39 }
    },
    female: {
      bsa: { mean: 38.9, sd: 6.3 },
      height: { mean: 41.38, sd: 7.58 },
      height16: { mean: 31.15, sd: 5.58 },
      height27: { mean: 18.55, sd: 3.50 }
    }
  },
  {
    id: 'lvesv',
    name: 'Biplane LV End-Systolic Volume',
    absoluteUnit: 'mL',
    male: {
      bsa: { mean: 17.0, sd: 3.8 },
      height: { mean: 19.27, sd: 4.62 },
      height16: { mean: 13.91, sd: 3.30 },
      height27: { mean: 7.67, sd: 1.95 }
    },
    female: {
      bsa: { mean: 14.0, sd: 2.9 },
      height: { mean: 15.16, sd: 3.53 },
      height16: { mean: 11.40, sd: 2.60 },
      height27: { mean: 6.79, sd: 1.58 }
    }
  },
  {
    id: 'lasv',
    name: 'Biplane LA End-Systolic Volume',
    absoluteUnit: 'mL',
    male: {
      bsa: { mean: 26.5, sd: 6.5 },
      height: { mean: 29.57, sd: 7.62 }, 
      height16: { mean: 21.36, sd: 5.48 },
      height27: { mean: 11.79, sd: 3.18 }
    },
    female: {
      bsa: { mean: 25.6, sd: 5.7 },
      height: { mean: 27.37, sd: 6.77 },
      height16: { mean: 21.61, sd: 5.07 },
      height27: { mean: 12.29, sd: 3.12 }
    }
  },
  {
    id: 'sv',
    name: 'Stroke Volume',
    absoluteUnit: 'mL',
    male: {
      bsa: { mean: 44.16, sd: 9.08 },
      height: { mean: 49.31, sd: 10.63 },
      height16: { mean: 35.65, sd: 7.82 },
      height27: { mean: 19.71, sd: 4.89 }
    },
    female: {
      bsa: { mean: 41.44, sd: 8.42 },
      height: { mean: 44.12, sd: 9.61 },
      height16: { mean: 33.25, sd: 7.29 },
      height27: { mean: 19.84, sd: 4.62 }
    }
  },
  {
    id: 'co',
    name: 'Cardiac Output',
    absoluteUnit: 'L/min',
    male: {
      bsa: { mean: 2.72, sd: 0.64 },
      height: { mean: 3.04, sd: 0.75 },
      height16: { mean: 2.20, sd: 0.55 },
      height27: { mean: 1.22, sd: 0.34 }
    },
    female: {
      bsa: { mean: 2.63, sd: 0.63 },
      height: { mean: 2.80, sd: 0.70 },
      height16: { mean: 2.11, sd: 0.53 },
      height27: { mean: 1.26, sd: 0.34 }
    }
  }
];

/**
 * Enhanced measurements with derived properties
 */
export const STROM_MEASUREMENTS: EnhancedMeasurementData[] = 
  STROM_MEASUREMENTS_RAW.map(enhanceMeasurement);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get measurement by ID
 */
export const getMeasurement = (id: string): EnhancedMeasurementData | undefined => {
  return STROM_MEASUREMENTS.find(m => m.id === id);
};

/**
 * Get measurements by type
 */
export const getMeasurementsByType = (type: MeasurementType): EnhancedMeasurementData[] => {
  return STROM_MEASUREMENTS.filter(m => m.type === type);
};

/**
 * Convenience functions
 */
export const getLinearMeasurements = () => getMeasurementsByType('linear');
export const getAreaMeasurements = () => getMeasurementsByType('area'); 
export const getMassMeasurements = () => getMeasurementsByType('mass');
export const getVolumeMeasurements = () => getMeasurementsByType('volume');

/**
 * Get measurements with specific index available
 */
export const getMeasurementsWithIndex = (indexType: IndexationType): EnhancedMeasurementData[] => {
  return STROM_MEASUREMENTS.filter(m => 
    m.male[indexType] !== undefined && m.female[indexType] !== undefined
  );
};

/**
 * Get indexed unit for any measurement and index type
 */
export const getIndexedUnit = (measurement: EnhancedMeasurementData, indexType: IndexationType): string => {
  return measurement.getIndexedUnit(indexType);
};

/**
 * Dataset summary
 */
export const getDatasetSummary = () => {
  return {
    total: STROM_MEASUREMENTS.length,
    byType: {
      linear: getLinearMeasurements().length,
      area: getAreaMeasurements().length,
      mass: getMassMeasurements().length,
      volume: getVolumeMeasurements().length
    },
    withIndices: {
      bsa: getMeasurementsWithIndex('bsa').length,
      height: getMeasurementsWithIndex('height').length,
      bmi: getMeasurementsWithIndex('bmi').length,
      height16: getMeasurementsWithIndex('height16').length,
      height27: getMeasurementsWithIndex('height27').length
    
    },
    source: 'Strom JB, et al. MESA Study (J Am Heart Assoc. 2024)'
  };
};

/**
 * Get reference population (delegates to canonical source)
 */
export const getStromReferencePopulation = (sex: Sex): PopulationCharacteristics => {
  return getReferencePopulation(sex);
};

export default {
  STROM_MEASUREMENTS,
  STROM_MEASUREMENTS_RAW,
  getMeasurement,
  getMeasurementsByType,
  getLinearMeasurements,
  getAreaMeasurements,
  getMassMeasurements,
  getVolumeMeasurements,
  getMeasurementsWithIndex,
  getDatasetSummary,
  deriveMeasurementType,
  enhanceMeasurement,
  getIndexedUnit,
  getStromReferencePopulation
};