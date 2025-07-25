// src/components/common/FormulaSelector.tsx

"use client";
import React from 'react';
import { 
  BSA_FORMULA_INFO, 
  LBM_FORMULA_INFO,
  type FormulaInfo 
} from '@/utils/bodyComposition/formulaRegistry';

// =============================================================================
// TYPES
// =============================================================================

export interface FormulaSelectionState {
  bsaFormula: string;
  lbmFormula: string;
  ethnicity: string;
  age: number;
}

export interface FormulaSelectionCallbacks {
  onBSAFormulaChange: (formula: string) => void;
  onLBMFormulaChange: (formula: string) => void;
  onEthnicityChange: (ethnicity: string) => void;
  onAgeChange: (age: number) => void;
}

export interface FormulaSelectorProps {
  selection: FormulaSelectionState;
  callbacks: FormulaSelectionCallbacks;
  showAge?: boolean;
  showEthnicity?: boolean; // Force show ethnicity even if Lee not selected
  className?: string;
  layout?: 'grid' | 'vertical' | 'horizontal';
}

// =============================================================================
// ETHNICITY OPTIONS
// =============================================================================

const ETHNICITY_OPTIONS = [
  { value: 'white', label: 'White/Caucasian' },
  { value: 'black', label: 'Black/African American' },
  { value: 'hispanic', label: 'Hispanic/Latino' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'asian', label: 'Asian' },
  { value: 'other', label: 'Other' }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if the selected LBM formula requires ethnicity
 */
const requiresEthnicity = (lbmFormula: string): boolean => {
  return lbmFormula === 'lee';
};

/**
 * Check if the selected LBM formula uses age
 */
const usesAge = (lbmFormula: string): boolean => {
  return lbmFormula === 'lee' || lbmFormula === 'yu';
};

/**
 * Get formula info by ID
 */
const getFormulaInfo = (formulas: FormulaInfo[], id: string): FormulaInfo | undefined => {
  return formulas.find(f => f.id === id);
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const FormulaSelector: React.FC<FormulaSelectorProps> = ({
  selection,
  callbacks,
  showAge = false,
  showEthnicity = false,
  className = '',
  layout = 'grid'
}) => {
  const selectedBSAInfo = getFormulaInfo(BSA_FORMULA_INFO, selection.bsaFormula);
  const selectedLBMInfo = getFormulaInfo(LBM_FORMULA_INFO, selection.lbmFormula);
  
  const needsEthnicity = showEthnicity || requiresEthnicity(selection.lbmFormula);
  const needsAge = showAge || usesAge(selection.lbmFormula);
  
  // Determine grid columns based on what's shown
  const getGridCols = () => {
    let cols = 2; // BSA + LBM always shown
    if (needsEthnicity) cols++;
    if (needsAge) cols++;
    return cols;
  };
  
  const containerClass = layout === 'grid' 
    ? `controls-grid` 
    : layout === 'horizontal' 
    ? 'd-flex gap-md'
    : '';

  const gridStyle = layout === 'grid' ? {
    gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`
  } : {};

  return (
    <div className={`${containerClass} ${className}`} style={gridStyle}>
      {/* BSA Formula Selection */}
      <div>
        <label htmlFor="bsa-formula-select">
          BSA Formula ({BSA_FORMULA_INFO.length} available)
        </label>
        <select
          id="bsa-formula-select"
          value={selection.bsaFormula}
          onChange={(e) => callbacks.onBSAFormulaChange(e.target.value)}
        >
          {BSA_FORMULA_INFO.map(formula => (
            <option key={formula.id} value={formula.id}>
              {formula.name}
            </option>
          ))}
        </select>
        {selectedBSAInfo && (
          <div className="formula-info">
            {selectedBSAInfo.year} • Parameters: {selectedBSAInfo.parameters.join(', ')}
          </div>
        )}
        {selectedBSAInfo?.notes && (
          <div className="formula-notes">
            {selectedBSAInfo.notes}
          </div>
        )}
      </div>

      {/* LBM Formula Selection */}
      <div>
        <label htmlFor="lbm-formula-select">
          LBM Formula ({LBM_FORMULA_INFO.length} available)
        </label>
        <select
          id="lbm-formula-select"
          value={selection.lbmFormula}
          onChange={(e) => callbacks.onLBMFormulaChange(e.target.value)}
        >
          {LBM_FORMULA_INFO.map(formula => (
            <option key={formula.id} value={formula.id}>
              {formula.name}
            </option>
          ))}
        </select>
        {selectedLBMInfo && (
          <div className="formula-info">
            {selectedLBMInfo.year} • Parameters: {selectedLBMInfo.parameters.join(', ')}
          </div>
        )}
        {selectedLBMInfo?.notes && (
          <div className="formula-notes">
            {selectedLBMInfo.notes}
          </div>
        )}
      </div>

      {/* Ethnicity Selection - Show when Lee formula selected or forced */}
      {needsEthnicity && (
        <div>
          <label htmlFor="ethnicity-select">
            Ethnicity {requiresEthnicity(selection.lbmFormula) && <span style={{ color: 'var(--cardiac-danger)' }}>*</span>}
          </label>
          <select
            id="ethnicity-select"
            value={selection.ethnicity}
            onChange={(e) => callbacks.onEthnicityChange(e.target.value)}
            style={{
              borderColor: requiresEthnicity(selection.lbmFormula) ? 'var(--cardiac-danger)' : undefined
            }}
          >
            {ETHNICITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="formula-info">
            {requiresEthnicity(selection.lbmFormula) 
              ? 'Required for Lee et al. (2017) formula' 
              : 'Used when available'
            }
          </div>
          {requiresEthnicity(selection.lbmFormula) && (
            <div className="formula-notes">
              Lee formula includes ethnicity-specific adjustments
            </div>
          )}
        </div>
      )}

      {/* Age Selection - Show when Yu or Lee formulas selected or forced */}
      {needsAge && (
        <div>
          <label htmlFor="age-input">
            Age {usesAge(selection.lbmFormula) && <span style={{ color: 'var(--cardiac-warning)' }}>*</span>}
          </label>
          <input
            id="age-input"
            type="number"
            min="18"
            max="100"
            value={selection.age}
            onChange={(e) => callbacks.onAgeChange(parseInt(e.target.value) || 50)}
            style={{
              borderColor: usesAge(selection.lbmFormula) ? 'var(--cardiac-warning)' : undefined
            }}
          />
          <div className="formula-info">
            {usesAge(selection.lbmFormula) 
              ? `Required for ${selectedLBMInfo?.name} formula` 
              : 'Used when available'
            }
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// CALCULATED VALUES DISPLAY COMPONENT
// =============================================================================

interface FormulaValuesDisplayProps {
  selection: FormulaSelectionState;
  referencePopulation: {
    male: { height: number; weight: number; bsa: number; lbm: number };
    female: { height: number; weight: number; bsa: number; lbm: number };
  };
  showDetailed?: boolean;
}

export const FormulaValuesDisplay: React.FC<FormulaValuesDisplayProps> = ({
  selection,
  referencePopulation,
  showDetailed = false
}) => {
  const selectedBSAInfo = getFormulaInfo(BSA_FORMULA_INFO, selection.bsaFormula);
  const selectedLBMInfo = getFormulaInfo(LBM_FORMULA_INFO, selection.lbmFormula);

  if (!showDetailed) {
    return (
      <div className="metric-card">
        <h4>Formula Values</h4>
        <dl>
          <dt>Male BSA:</dt>
          <dd className="coefficient-display">{referencePopulation.male.bsa.toFixed(3)} m²</dd>
          <dt>Female BSA:</dt>
          <dd className="coefficient-display">{referencePopulation.female.bsa.toFixed(3)} m²</dd>
          <dt>Male LBM:</dt>
          <dd className="coefficient-display">{referencePopulation.male.lbm.toFixed(1)} kg</dd>
          <dt>Female LBM:</dt>
          <dd className="coefficient-display">{referencePopulation.female.lbm.toFixed(1)} kg</dd>
        </dl>
      </div>
    );
  }

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <h4>BSA Calculation Details</h4>
        <dl>
          <dt>Formula:</dt>
          <dd>{selectedBSAInfo?.name}</dd>
          <dt>Year:</dt>
          <dd>{selectedBSAInfo?.year}</dd>
          <dt>Male result:</dt>
          <dd className="coefficient-display">{referencePopulation.male.bsa.toFixed(3)} m²</dd>
          <dt>Female result:</dt>
          <dd className="coefficient-display">{referencePopulation.female.bsa.toFixed(3)} m²</dd>
        </dl>
        {selectedBSAInfo?.notes && (
          <div className="formula-notes">
            <strong>Notes:</strong> {selectedBSAInfo.notes}
          </div>
        )}
      </div>

      <div className="metric-card">
        <h4>LBM Calculation Details</h4>
        <dl>
          <dt>Formula:</dt>
          <dd>{selectedLBMInfo?.name}</dd>
          <dt>Year:</dt>
          <dd>{selectedLBMInfo?.year}</dd>
          <dt>Parameters used:</dt>
          <dd>{selectedLBMInfo?.parameters.join(', ')}</dd>
          {usesAge(selection.lbmFormula) && (
            <>
              <dt>Age:</dt>
              <dd>{selection.age} years</dd>
            </>
          )}
          {requiresEthnicity(selection.lbmFormula) && (
            <>
              <dt>Ethnicity:</dt>
              <dd>{ETHNICITY_OPTIONS.find(e => e.value === selection.ethnicity)?.label}</dd>
            </>
          )}
          <dt>Male result:</dt>
          <dd className="coefficient-display">{referencePopulation.male.lbm.toFixed(1)} kg</dd>
          <dt>Female result:</dt>
          <dd className="coefficient-display">{referencePopulation.female.lbm.toFixed(1)} kg</dd>
        </dl>
        {selectedLBMInfo?.notes && (
          <div className="formula-notes">
            <strong>Notes:</strong> {selectedLBMInfo.notes}
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Custom hook for managing formula selection state
 */
export const useFormulaSelection = (
  initialBSA = 'dubois',
  initialLBM = 'boer',
  initialEthnicity = 'white',
  initialAge = 50
) => {
  const [selection, setSelection] = React.useState<FormulaSelectionState>({
    bsaFormula: initialBSA,
    lbmFormula: initialLBM,
    ethnicity: initialEthnicity,
    age: initialAge
  });

  const callbacks: FormulaSelectionCallbacks = {
    onBSAFormulaChange: (formula: string) => 
      setSelection(prev => ({ ...prev, bsaFormula: formula })),
    onLBMFormulaChange: (formula: string) => 
      setSelection(prev => ({ ...prev, lbmFormula: formula })),
    onEthnicityChange: (ethnicity: string) => 
      setSelection(prev => ({ ...prev, ethnicity })),
    onAgeChange: (age: number) => 
      setSelection(prev => ({ ...prev, age }))
  };

  return { selection, callbacks, setSelection };
};

export default FormulaSelector;