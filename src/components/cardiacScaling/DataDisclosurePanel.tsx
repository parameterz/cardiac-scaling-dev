// src/components/cardiacScaling/DataDisclosurePanel.tsx

import React, { useState } from 'react';
import type { DeweyMethodResult, ScalingConfiguration } from './core/DeweyMethodFactory';
import type { EnhancedMeasurementData } from '@/data/stromData';
import type { FormulaSelectionState } from '@/components/common/FormulaSelector';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface DataDisclosurePanelProps {
  factoryResult: DeweyMethodResult;
  measurement: EnhancedMeasurementData;
  formulaSelection: FormulaSelectionState;
}

interface PopulationDataRow {
  height: number;
  weight: number;
  bmi: number;
  bsa: number;
  lbm: number;
  [key: string]: number; // Dynamic scaling predictions
}

// =============================================================================
// PRECISION FORMATTING UTILITIES
// =============================================================================

const formatters = {
  height: (val: number): string => Math.round(val).toString(),
  weight: (val: number): string => val.toFixed(2),
  bmi: (val: number): string => val.toFixed(2),
  bsa: (val: number): string => val.toFixed(3),
  lbm: (val: number): string => val.toFixed(2),
  coefficient: (val: number): string => val.toFixed(3),
  similarity: (val: number): string => val.toFixed(1),
  exponent: (val: number): string => val.toFixed(2),
  
  // Measurement-specific formatting
  measurementValue: (val: number, measurementType: string): string => {
    switch (measurementType) {
      case 'linear': return val.toFixed(2);
      case 'area': return val.toFixed(2);
      case 'mass':
      case 'volume': return val.toFixed(1);
      default: return val.toFixed(2);
    }
  }
};

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

const generateTimestamp = (): string => {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
};

const generateCSV = (
  headers: string[], 
  rows: string[][],
  metadata: {
    measurement: string;
    formulaSelection: FormulaSelectionState;
    timestamp: string;
  }
): string => {
  const metadataLines = [
    `# Cardiac Scaling Analysis Data Export`,
    `# Measurement: ${metadata.measurement}`,
    `# BSA Formula: ${metadata.formulaSelection.bsaFormula}`,
    `# LBM Formula: ${metadata.formulaSelection.lbmFormula}`,
    `# Generated: ${metadata.timestamp}`,
    `# Source: Educational analysis based on Strom et al. MESA data`,
    `#`,
  ];
  
  const csvLines = [
    ...metadataLines,
    headers.join(','),
    ...rows.map(row => row.join(','))
  ];
  
  return csvLines.join('\n');
};

const downloadCSV = (csvContent: string, filename: string): void => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.warn('CSV download failed:', error);
  }
};

const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.warn('Clipboard copy failed:', error);
    return false;
  }
};

// =============================================================================
// COEFFICIENTS SUMMARY TABLE
// =============================================================================

interface CoefficientsSummaryTableProps {
  factoryResult: DeweyMethodResult;
  measurement: EnhancedMeasurementData;
  formulaSelection: FormulaSelectionState;
}

const CoefficientsSummaryTable: React.FC<CoefficientsSummaryTableProps> = ({
  factoryResult,
  measurement,
  formulaSelection
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  const handleExportCoefficients = async (format: 'csv' | 'clipboard') => {
    try {
      const headers = [
        'Scaling Approach',
        'Variable', 
        'Exponent',
        'Male Coefficient',
        'Female Coefficient',
        'Universal Coefficient',
        'Sex Similarity %'
      ];

      const rows = factoryResult.configurations.map((config: ScalingConfiguration) => {
        const coeffs = factoryResult.coefficients[config.id];
        return [
          config.name,
          config.variable,
          formatters.exponent(config.exponent),
          formatters.coefficient(coeffs.male),
          formatters.coefficient(coeffs.female),
          coeffs.universal ? formatters.coefficient(coeffs.universal) : 'N/A',
          formatters.similarity(coeffs.similarity.percentage)
        ];
      });

      const timestamp = generateTimestamp();
      
      if (format === 'csv') {
        const csvContent = generateCSV(headers, rows, {
          measurement: measurement.name,
          formulaSelection,
          timestamp
        });
        
        const filename = `coefficients_${measurement.id}_${timestamp}.csv`;
        downloadCSV(csvContent, filename);
        
      } else if (format === 'clipboard') {
        // Tab-separated for spreadsheet pasting with context header
        const contextHeaders = [
          `# ${measurement.name} - Scaling Coefficients`,
          `# BSA: ${formulaSelection.bsaFormula}, LBM: ${formulaSelection.lbmFormula}`,
          `# Generated: ${new Date().toLocaleDateString()}`,
          ''
        ];
        
        const tsvContent = [
          ...contextHeaders,
          headers.join('\t'),
          ...rows.map(row => row.join('\t'))
        ].join('\n');
        
        const success = await copyToClipboard(tsvContent);
        setCopyFeedback(success ? '✓ Copied!' : '✗ Copy failed');
        setTimeout(() => setCopyFeedback(''), 2000);
      }
    } catch (error) {
      console.warn('Export failed:', error);
      setCopyFeedback('✗ Export failed');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h4 style={{ margin: 0 }}>Derived Scaling Coefficients</h4>
        <div className="button-group">
          <button 
            onClick={() => handleExportCoefficients('clipboard')}
            className="button-small secondary"
          >
            {copyFeedback || 'Copy to Clipboard'}
          </button>
          <button 
            onClick={() => handleExportCoefficients('csv')}
            className="button-small secondary"
          >
            Download CSV
          </button>
        </div>
      </div>

      <table className="striped">
        <thead>
          <tr>
            <th>Scaling Approach</th>
            <th>Variable</th>
            <th>Exponent</th>
            <th>Male Coeff</th>
            <th>Female Coeff</th>
            <th>Universal Coeff</th>
            <th>Sex Similarity %</th>
          </tr>
        </thead>
        <tbody>
          {factoryResult.configurations.map((config: ScalingConfiguration) => {
            const coeffs = factoryResult.coefficients[config.id];
            
            return (
              <tr key={config.id}>
                <td><strong>{config.name}</strong></td>
                <td>{config.variable.toUpperCase()}</td>
                <td>{formatters.exponent(config.exponent)}</td>
                <td>{formatters.coefficient(coeffs.male)}</td>
                <td>{formatters.coefficient(coeffs.female)}</td>
                <td>
                  {coeffs.universal ? formatters.coefficient(coeffs.universal) : '—'}
                </td>
                <td>{formatters.similarity(coeffs.similarity.percentage)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <p style={{ fontSize: '0.875rem', color: 'var(--pico-muted-color)', marginTop: '0.5rem' }}>
        Coefficients derived using canonical reference populations:<br/>
        <strong>♂ Male:</strong> {factoryResult.referencePopulations.male.height}cm, {formatters.weight(factoryResult.referencePopulations.male.weight)}kg, BMI {factoryResult.referencePopulations.male.bmi}, BSA {formatters.bsa(factoryResult.referencePopulations.male.bsa)}m² ({formulaSelection.bsaFormula}), LBM {formatters.lbm(factoryResult.referencePopulations.male.lbm)}kg ({formulaSelection.lbmFormula})<br/>
        <strong>♀ Female:</strong> {factoryResult.referencePopulations.female.height}cm, {formatters.weight(factoryResult.referencePopulations.female.weight)}kg, BMI {factoryResult.referencePopulations.female.bmi}, BSA {formatters.bsa(factoryResult.referencePopulations.female.bsa)}m² ({formulaSelection.bsaFormula}), LBM {formatters.lbm(factoryResult.referencePopulations.female.lbm)}kg ({formulaSelection.lbmFormula})
      </p>
    </div>
  );
};

// =============================================================================
// POPULATION DATA TABLE
// =============================================================================

interface PopulationDataTableProps {
  data: PopulationDataRow[];
  sex: 'male' | 'female';
  configurations: ScalingConfiguration[];
  measurement: EnhancedMeasurementData;
  formulaSelection: FormulaSelectionState;
}

const PopulationDataTable: React.FC<PopulationDataTableProps> = ({
  data,
  sex,
  configurations,
  measurement,
  formulaSelection
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  // Prepare headers and data for export
  const baseHeaders = ['Height (cm)', 'Weight (kg)', 'BMI (kg/m²)', 'BSA (m²)', 'LBM (kg)'];
  const scalingHeaders = configurations.map((config: ScalingConfiguration) => `${config.name} (${measurement.absoluteUnit})`);
  const allHeaders = [...baseHeaders, ...scalingHeaders];

  const handleExportData = async (format: 'csv' | 'clipboard') => {
    try {
      const rows = data.map(row => {
        const baseValues = [
          formatters.height(row.height),
          formatters.weight(row.weight),
          formatters.bmi(row.bmi),
          formatters.bsa(row.bsa),
          formatters.lbm(row.lbm)
        ];

        const scalingValues = configurations.map((config: ScalingConfiguration) => {
          const value = row[`${config.id}_${sex}`];
          return value !== undefined ? formatters.measurementValue(value, measurement.type) : 'N/A';
        });

        return [...baseValues, ...scalingValues];
      });

      const timestamp = generateTimestamp();
      
      if (format === 'csv') {
        const csvContent = generateCSV(allHeaders, rows, {
          measurement: `${measurement.name} (${sex})`,
          formulaSelection,
          timestamp
        });
        
        const filename = `population_data_${measurement.id}_${sex}_${timestamp}.csv`;
        downloadCSV(csvContent, filename);
        
      } else if (format === 'clipboard') {
        // Tab-separated for spreadsheet pasting with context header
        const contextHeaders = [
          `# ${measurement.name} (${sex === 'male' ? 'Male' : 'Female'}) - Population Data`,
          `# BSA: ${formulaSelection.bsaFormula}, LBM: ${formulaSelection.lbmFormula}`,
          `# Generated: ${new Date().toLocaleDateString()}`,
          ''
        ];
        
        const tsvContent = [
          ...contextHeaders,
          allHeaders.join('\t'),
          ...rows.map(row => row.join('\t'))
        ].join('\n');
        
        const success = await copyToClipboard(tsvContent);
        setCopyFeedback(success ? '✓ Copied!' : '✗ Copy failed');
        setTimeout(() => setCopyFeedback(''), 2000);
      }
    } catch (error) {
      console.warn('Export failed:', error);
      setCopyFeedback('✗ Export failed');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  const sexLabel = sex === 'male' ? '♂ Male' : '♀ Female';

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h5 style={{ margin: 0 }}>{sexLabel} Population Data ({data.length} points)</h5>
        <div className="button-group">
          <button 
            onClick={() => handleExportData('clipboard')}
            className="button-small secondary"
          >
            {copyFeedback || 'Copy to Clipboard'}
          </button>
          <button 
            onClick={() => handleExportData('csv')}
            className="button-small secondary"
          >
            Download CSV
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="striped">
          <thead>
            <tr>
              <th>Height<br/>(cm)</th>
              <th>Weight<br/>(kg)</th>
              <th>BMI<br/>(kg/m²)</th>
              <th>BSA<br/>(m²)</th>
              <th>LBM<br/>(kg)</th>
              {configurations.map((config: ScalingConfiguration) => (
                <th key={config.id}>
                  {config.name}<br/>({measurement.absoluteUnit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{formatters.height(row.height)}</td>
                <td>{formatters.weight(row.weight)}</td>
                <td>{formatters.bmi(row.bmi)}</td>
                <td>{formatters.bsa(row.bsa)}</td>
                <td>{formatters.lbm(row.lbm)}</td>
                {configurations.map((config: ScalingConfiguration) => {
                  const value = row[`${config.id}_${sex}`];
                  return (
                    <td key={config.id}>
                      {value !== undefined ? formatters.measurementValue(value, measurement.type) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const DataDisclosurePanel: React.FC<DataDisclosurePanelProps> = ({
  factoryResult,
  measurement,
  formulaSelection
}) => {
  const [showDataTables, setShowDataTables] = useState(false);

  // Prepare population data for tables
  const preparePopulationData = (sex: 'male' | 'female'): PopulationDataRow[] => {
    try {
      // Get population data from first configuration (they should all have same population points)
      const firstConfig = factoryResult.configurations[0];
      if (!firstConfig || !factoryResult.populationData[firstConfig.id]) {
        console.warn('No population data available');
        return [];
      }

      const baseData = factoryResult.populationData[firstConfig.id][sex] || [];
      
      return baseData.map(point => {
        const row: PopulationDataRow = {
          height: point.height,
          weight: point.weight,
          bmi: point.bmi,
          bsa: point.bsa,
          lbm: point.lbm
        };

        // Add measurement predictions from each configuration
        factoryResult.configurations.forEach((config: ScalingConfiguration) => {
          const configData = factoryResult.populationData[config.id]?.[sex];
          const matchingPoint = configData?.find(p => p.height === point.height);
          if (matchingPoint) {
            row[`${config.id}_${sex}`] = matchingPoint.measurementValue;
          }
        });

        return row;
      });
    } catch (error) {
      console.warn('Error preparing population data:', error);
      return [];
    }
  };

  const maleData = preparePopulationData('male');
  const femaleData = preparePopulationData('female');

  return (
    <section style={{ marginTop: '2rem' }}>
      {/* Metadata Header */}
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--pico-muted-color)' }}>
        <strong>{measurement.name}</strong> • 
        BSA: {formulaSelection.bsaFormula} • 
        LBM: {formulaSelection.lbmFormula} • 
        Generated: {new Date().toLocaleDateString()}
      </div>

      {/* Main Disclosure Accordion */}
      <details>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Methodology & Data Tables
        </summary>
        
        <div style={{ marginTop: '1.5rem' }}>
          {/* Coefficients Summary */}
          <CoefficientsSummaryTable
            factoryResult={factoryResult}
            measurement={measurement}
            formulaSelection={formulaSelection}
          />

          {/* Population Data Tables - Nested Accordion */}
          <details 
            style={{ marginTop: '2rem' }}
            open={showDataTables}
            onToggle={(e) => setShowDataTables(e.currentTarget.open)}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
              Complete Population Dataset
            </summary>
            
            <div style={{ marginTop: '1.5rem' }}>
              {/* Male Data Table */}
              <PopulationDataTable
                data={maleData}
                sex="male"
                configurations={factoryResult.configurations}
                measurement={measurement}
                formulaSelection={formulaSelection}
              />

              {/* Female Data Table */}
              <div style={{ marginTop: '2rem' }}>
                <PopulationDataTable
                  data={femaleData}
                  sex="female"
                  configurations={factoryResult.configurations}
                  measurement={measurement}
                  formulaSelection={formulaSelection}
                />
              </div>
              
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--pico-muted-color)', 
                marginTop: '1rem',
                fontStyle: 'italic'
              }}>
                Population generated across height range 120-220cm with BMI {factoryResult.referencePopulations.male.bmi} kg/m². 
                All values calculated using canonical reference methodology.
              </p>
            </div>
          </details>
        </div>
      </details>
    </section>
  );
};

export default DataDisclosurePanel;