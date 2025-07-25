// src/utils/bodyComposition/formulaRegistry.ts

/**
 * Comprehensive registry of body composition calculation formulas
 * Combines BSA and LBM calculations with unified API
 */

// Types
export type Sex = 'male' | 'female';
export type Ethnicity = 'white' | 'black' | 'hispanic' | 'mexican' | 'asian' | 'other';

// =============================================================================
// BSA CALCULATIONS
// =============================================================================

// BSA calculation methods registry
const bsaCalculators = {
  dubois: (weight: number, height: number) => {
    // DuBois formula: BSA (m²) = 0.007184 × height(cm)^0.725 × weight(kg)^0.425
    return 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);
  },
  
  mosteller: (weight: number, height: number) => {
    // Mosteller formula: BSA (m²) = sqrt((height(cm) × weight(kg))/3600)
    return Math.sqrt((height * weight) / 3600);
  },
  
  haycock: (weight: number, height: number) => {
    // Haycock formula: BSA (m²) = 0.024265 × height(cm)^0.3964 × weight(kg)^0.5378
    return 0.024265 * Math.pow(height, 0.3964) * Math.pow(weight, 0.5378);
  },
  
  gehan: (weight: number, height: number) => {
    // Gehan & George formula
    return 0.0235 * Math.pow(height, 0.42246) * Math.pow(weight, 0.51456);
  },
  
  boyd: (weight: number, height: number) => {
    // Boyd formula (complex logarithmic)
    const wt = weight * 1000;
    const exponent = 0.7285 - 0.0188 * (Math.LOG10E * Math.log(wt));
    return 0.0003207 * Math.pow(height, 0.3) * Math.pow(wt, exponent);
  },
  
  dreyer: (weight: number, height: number) => {
    // Dreyer formula (weight-only)
    return 0.1 * Math.pow(weight, 2 / 3);
  },
  
  livingston: (weight: number, height: number) => {
    // Livingston & Lee formula
    return 0.1173 * Math.pow(weight, 0.6466);
  }
};

// BSA formula metadata
export const BSA_FORMULA_NAMES = {
  mosteller: 'Mosteller (1987)',  
  dubois: 'Du Bois & Du Bois (1916)',
  haycock: 'Haycock et al. (1978)',
  gehan: 'Gehan & George (1970)',
  boyd: 'Boyd (1935)',
  dreyer: 'Dreyer (1915)',
  livingston: 'Livingston & Lee (2001)'
};

// =============================================================================
// LBM CALCULATIONS
// =============================================================================

// Race coefficients for Lee formula (2017)
const LeeRaceCoefficients = {
  male: {
    white: 0, // reference
    black: 1.821,
    hispanic: 0.32,
    mexican: -0.441,
    asian: -0.784,
    other: -0.784
  },
  female: {
    white: 0, // reference
    black: 1.128,
    hispanic: -0.047,
    mexican: -0.448,
    asian: -0.384,
    other: -0.384
  }
};

/**
 * Helper function to get a safe ethnicity value
 */
function getSafeEthnicity(ethnicity: string | undefined): Ethnicity {
  if (!ethnicity) return 'white';
  
  const ethn = ethnicity.toLowerCase();
  
  if (ethn === 'white' || ethn === 'caucasian') return 'white';
  if (ethn === 'black' || ethn === 'african' || ethn === 'african american') return 'black';
  if (ethn === 'hispanic' || ethn === 'latino' || ethn === 'latina') return 'hispanic';
  if (ethn === 'mexican') return 'mexican';
  if (ethn === 'asian' || ethn === 'east asian' || ethn === 'south asian') return 'asian';
  
  return 'other';
}

// LBM calculation methods registry
const lbmCalculators = {
  boer: (weight: number, height: number, sex: Sex) => {
    // Boer (1984) formula
    if (sex === 'male') {
      return 0.407 * weight + 0.267 * height - 19.2;
    } else {
      return 0.252 * weight + 0.473 * height - 48.3;
    }
  },
  
  hume: (weight: number, height: number, sex: Sex) => {
    // Hume & Weyers (1971) formula
    if (sex === 'male') {
      return 0.3281 * weight + 0.33929 * height - 29.5336;
    } else {
      return 0.29569 * weight + 0.41813 * height - 43.2933;
    }
  },
  
  yu: (weight: number, height: number, sex: Sex, age: number = 50) => {
    // Yu et al. (2013) formula with BMI adjustment
    const bmi = weight / Math.pow(height / 100, 2);
    const sexCoefficient = sex === 'male' ? 9.940015 : 0;
    
    return (
      22.932326 +
      0.684668 * weight -
      1.137156 * bmi -
      0.009213 * age +
      sexCoefficient
    );
  },
  
  lee: (weight: number, height: number, sex: Sex, age: number = 50, ethnicity: string = 'white') => {
    // Lee et al. (2017) formula with ethnicity adjustments
    const safeEthnicity = getSafeEthnicity(ethnicity);
    const raceCoefficient = LeeRaceCoefficients[sex][safeEthnicity];
    
    if (sex === 'male') {
      return -14.729 - (0.071 * age) + (0.210 * height) + (0.468 * weight) + raceCoefficient;
    } else {
      return -14.292 - (0.046 * age) + (0.201 * height) + (0.347 * weight) + raceCoefficient;
    }
  },
  
  kuch: (weight: number, height: number, sex: Sex) => {
    // Kuch (2001) formula - calculates FFM, not LBM
    const heightInMeters = height / 100;
    
    if (sex === 'male') {
      return 5.1 * Math.pow(heightInMeters, 1.14) * Math.pow(weight, 0.41);
    } else {
      return 5.34 * Math.pow(heightInMeters, 1.47) * Math.pow(weight, 0.33);
    }
  },
  
  janmahasatian: (weight: number, height: number, sex: Sex) => {
    // Janmahasatian et al. (2005) formula - calculates FFM
    const bmi = weight / Math.pow(height / 100, 2);
    
    if (sex === 'female') {
      return (9270 * weight) / (8780 + 244 * bmi);
    } else {
      return (9270 * weight) / (6680 + 216 * bmi);
    }
  }
};

// LBM formula metadata
export const LBM_FORMULA_NAMES = {
  boer: 'Boer (1984)',
  hume: 'Hume & Weyers (1971)',
  yu: 'Yu et al. (2013)',
  lee: 'Lee et al. (2017)',
  kuch: 'Kuch (2001)',
  janmahasatian: 'Janmahasatian et al. (2005)'
};

// =============================================================================
// UNIFIED API
// =============================================================================

/**
 * Calculate BSA using selected formula
 * @param formulaId - ID of the formula to use
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @returns BSA in m²
 */
export const calculateBSA = (
  formulaId: string,
  weight: number,
  height: number
): number => {
  const calculator = bsaCalculators[formulaId as keyof typeof bsaCalculators] || bsaCalculators.dubois;
  return calculator(weight, height);
};

/**
 * Calculate LBM using selected formula
 * @param formulaId - ID of the formula to use
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @param sex - 'male' or 'female'
 * @param age - Age in years (optional, default 50)
 * @param ethnicity - Ethnicity string (optional, default 'white')
 * @returns LBM in kg
 */
export const calculateLBM = (
  formulaId: string,
  weight: number,
  height: number,
  sex: Sex,
  age: number = 50,
  ethnicity: string = 'white'
): number => {
  const calculator = lbmCalculators[formulaId as keyof typeof lbmCalculators] || lbmCalculators.boer;
  
  // Handle formulas with different parameter requirements
  if (formulaId === 'yu' || formulaId === 'lee') {
    return calculator(weight, height, sex, age, ethnicity);
  } else {
    return calculator(weight, height, sex);
  }
};

// =============================================================================
// FORMULA INFORMATION
// =============================================================================

export interface FormulaInfo {
  id: string;
  name: string;
  year: number;
  parameters: string[];
  notes?: string;
}

export const BSA_FORMULA_INFO: FormulaInfo[] = [
  { id: 'boyd', name: 'Boyd', year: 1935, parameters: ['weight', 'height'], notes: 'Complex logarithmic formula' },
  { id: 'dreyer', name: 'Dreyer', year: 1915, parameters: ['weight'], notes: 'Weight-only formula' },
  { id: 'dubois', name: 'Du Bois & Du Bois', year: 1916, parameters: ['weight', 'height'], notes: 'Most cited formula' },
  { id: 'gehan', name: 'Gehan & George', year: 1970, parameters: ['weight', 'height'], notes: 'Cancer research focus' },
  { id: 'haycock', name: 'Haycock et al.', year: 1978, parameters: ['weight', 'height'], notes: 'Good for pediatrics' },
  { id: 'livingston', name: 'Livingston & Lee', year: 2001, parameters: ['weight'], notes: 'Modern weight-based' },
  { id: 'mosteller', name: 'Mosteller', year: 1987, parameters: ['weight', 'height'], notes: 'Default MESA formula' },
];

export const LBM_FORMULA_INFO: FormulaInfo[] = [
  { id: 'boer', name: 'Boer', year: 1984, parameters: ['weight', 'height', 'sex'], notes: 'Most commonly used' },
  { id: 'hume', name: 'Hume & Weyers', year: 1971, parameters: ['weight', 'height', 'sex'], notes: 'Classic formula' },
  { id: 'janmahasatian', name: 'Janmahasatian et al.', year: 2005, parameters: ['weight', 'height', 'sex'], notes: 'BMI-adjusted FFM' },
  { id: 'kuch', name: 'Kuch', year: 2001, parameters: ['weight', 'height', 'sex'], notes: 'Calculates FFM, not LBM' },
  { id: 'lee', name: 'Lee et al.', year: 2017, parameters: ['weight', 'height', 'sex', 'age', 'ethnicity'], notes: 'Most comprehensive' },
  { id: 'yu', name: 'Yu et al.', year: 2013, parameters: ['weight', 'height', 'sex', 'age'], notes: 'Includes age and BMI' },
];

// =============================================================================
// EXPORTS
// =============================================================================

// Export calculators for direct use if needed
export { bsaCalculators, lbmCalculators };


// Default exports
export default {
  calculateBSA,
  calculateLBM,
  BSA_FORMULA_NAMES,
  LBM_FORMULA_NAMES,
  BSA_FORMULA_INFO,
  LBM_FORMULA_INFO
};