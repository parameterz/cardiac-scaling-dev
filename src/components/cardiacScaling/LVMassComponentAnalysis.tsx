// src/components/cardiacScaling/LVMassComponentAnalysis.tsx
// ENHANCED: Added source badges, methodology panel, and transparency features

import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { BookOpen, Calculator } from "lucide-react"; // NEW: Professional icons

import FormulaSelector, {
  FormulaValuesDisplay,
  type FormulaSelectionState,
  type FormulaSelectionCallbacks,
} from "@/components/common/FormulaSelector";
import {
  generateScalingAnalysis,
  getStandardConfigurations,
  type ScalingConfiguration,
  type DeweyMethodResult,
} from "./core/DeweyMethodFactory";
import { getMeasurement } from "@/data/stromData";
import type { EnhancedMeasurementData } from "@/data/stromData";

// =============================================================================
// ASE LV MASS CALCULATION (unchanged)
// =============================================================================

/**
 * ASE LV Mass calculation formula
 * @param ivs - Interventricular septal thickness (cm)
 * @param lvd - LV internal dimension (cm)
 * @param lvpw - LV posterior wall thickness (cm)
 * @returns LV mass in grams
 */
export const calculateLVMass = (
  ivs: number,
  lvd: number,
  lvpw: number
): number => {
  const sum = ivs + lvd + lvpw;
  const mass = 0.8 * (1.04 * Math.pow(sum, 3) - Math.pow(lvd, 3)) + 0.6;
  return parseFloat(mass.toFixed(1));
};

// =============================================================================
// DATA STRUCTURES (unchanged)
// =============================================================================

interface ComponentAnalysisPoint {
  bsa: number;
  height: number;

  // Linear component values (scaled)
  maleIvs: number;
  femaleIvs: number;
  maleLvd: number;
  femaleLvd: number;
  maleLvpw: number;
  femaleLvpw: number;

  // Mass values
  malePublishedMass: number; // Direct mass scaling (solid)
  femalePublishedMass: number;
  maleCalculatedMass: number; // Calculated from components (dashed)
  femaleCalculatedMass: number;
}

interface ToggleState {
  ivs: boolean;
  lvd: boolean;
  lvpw: boolean;
}

interface LVMassComponentAnalysisProps {
  formulaSelection: FormulaSelectionState;
  formulaCallbacks: FormulaSelectionCallbacks;
}

// =============================================================================
// NEW: SOURCE BADGE COMPONENT (reused from FourWayScaling)
// =============================================================================

interface SourceBadgeProps {
  dataSource: 'published' | 'derived';
  size?: number;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ dataSource, size = 14 }) => {
  return (
    <span className="source-badge">
      {dataSource === 'published' ? (
        <>
          <BookOpen size={size} />
          MESA
        </>
      ) : (
        <>
          <Calculator size={size} />
          Derived
        </>
      )}
    </span>
  );
};

// =============================================================================
// NEW: LV MASS METHODOLOGY PANEL
// =============================================================================

interface LVMassMethodologyPanelProps {
  linearConfigs: ScalingConfiguration[];
  massConfigs: ScalingConfiguration[];
}

const LVMassMethodologyPanel: React.FC<LVMassMethodologyPanelProps> = ({ 
  linearConfigs, 
  massConfigs 
}) => {
  return (
    <details style={{ marginBottom: '2rem' }}>
      <summary style={{ 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        fontSize: '1rem',
        marginBottom: '0.5rem'
      }}>
        📚 LV Mass Analysis Methodology
      </summary>
      
      <div style={{ 
        marginTop: '1rem',
        background: 'var(--pico-code-background-color)',
        padding: '1.5rem',
        borderRadius: 'var(--pico-border-radius)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Component-Based Path */}
          <div style={{
            borderLeft: '4px solid #059669',
            paddingLeft: '1rem'
          }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
              <Calculator size={16} />
              Component-Based Calculation
            </h5>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Linear components (IVS, LVD, LVPW) are scaled individually using the selected method, 
              then combined using the ASE formula to calculate total LV mass.
            </p>
            <div style={{ 
              fontSize: '0.85rem', 
              fontFamily: 'var(--pico-font-family-monospace)',
              background: 'var(--pico-card-background-color)',
              padding: '0.5rem',
              borderRadius: '3px'
            }}>
              LVM = 0.8 × [1.04 × (IVS + LVD + LVPW)³ - LVD³] + 0.6
            </div>
          </div>

          {/* Direct Mass Path */}
          <div style={{
            borderLeft: '4px solid #3b82f6',
            paddingLeft: '1rem'
          }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
              <BookOpen size={16} />
              Direct MESA Scaling
            </h5>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              LV mass is scaled directly using published MESA reference values 
              or derived coefficients from the Dewey methodology.
            </p>
            <div style={{ 
              fontSize: '0.85rem', 
              color: 'var(--pico-muted-color)',
              fontStyle: 'italic'
            }}>
              Uses <strong>mean MESA values</strong> (Z-score = 0.0) for realistic component relationships, 
              rather than upper limits (Z-score = 1.96)
            </div>
          </div>
        </div>

        {/* Data Source Classification */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--pico-border-color)'
        }}>
          <div>
            <h6 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={14} />
              Published Methods
            </h6>
            <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: '1.25rem' }}>
              {linearConfigs.filter(c => c.dataSource === 'published').map(config => (
                <li key={config.id}>{config.name}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h6 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={14} />
              Derived Methods
            </h6>
            <ul style={{ fontSize: '0.85rem', margin: 0, paddingLeft: '1.25rem' }}>
              {linearConfigs.filter(c => c.dataSource === 'derived').map(config => (
                <li key={config.id}>{config.name}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Methodological Note */}
        <div style={{ 
          marginTop: '1rem',
          fontSize: '0.8rem',
          color: 'var(--pico-muted-color)',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          <strong>Why Two Paths?</strong> Comparing component-based calculation with direct scaling 
          reveals how geometric relationships between linear measurements and total mass 
          are preserved across different scaling methodologies.
        </div>
      </div>
    </details>
  );
};

// =============================================================================
// STYLING CONSTANTS (unchanged)
// =============================================================================

const COLORS = {
  male: "#3b82f6", // Blue
  female: "#dc2626", // Red
  ivs: {
    male: "#7c3aed", // Purple
    female: "#a855f7",
  },
  lvpw: {
    male: "#059669", // Green
    female: "#10b981",
  },
};

const LINE_STYLES = {
  lvd: { strokeDasharray: undefined }, // Solid
  ivs: { strokeDasharray: "8 4" }, // Dashed
  lvpw: { strokeDasharray: "3 3" }, // Dotted
  published: { strokeDasharray: undefined }, // Solid
  calculated: { strokeDasharray: "8 4" }, // Dashed
};

// =============================================================================
// DATA GENERATION (unchanged)
// =============================================================================

const generateComponentAnalysisData = (
  linearConfigId: string,
  massConfigId: string,
  formulaSelection: FormulaSelectionState
): ComponentAnalysisPoint[] => {
  // Get the measurements
  const ivsData = getMeasurement("ivsd")!; // Septal wall thickness
  const lvdData = getMeasurement("lvdd")!; // LV end-diastolic dimension
  const lvpwData = getMeasurement("lvpw")!; // Posterior wall thickness
  const massData = getMeasurement("lvm")!; // LV mass

  // Use EXACT same population range as other tabs, but with MEAN values (Z=0)
  const populationOptions = {
    populationRange: {
      height: { min: 120, max: 220, step: 1 },
      bmi: { min: 24, max: 24, step: 1 },
    },
    zScore: 0.0, // Use mean MESA values instead of upper limits (Z=1.96)
    includeCorrelations: false,
    generateInsights: false,
  };

  // Generate analyses for each measurement with explicit population range
  const ivsAnalysis = generateScalingAnalysis(
    ivsData,
    formulaSelection,
    undefined,
    populationOptions
  );
  const lvdAnalysis = generateScalingAnalysis(
    lvdData,
    formulaSelection,
    undefined,
    populationOptions
  );
  const lvpwAnalysis = generateScalingAnalysis(
    lvpwData,
    formulaSelection,
    undefined,
    populationOptions
  );
  const massAnalysis = generateScalingAnalysis(
    massData,
    formulaSelection,
    undefined,
    populationOptions
  );

  // Get population data for selected configurations
  const ivsPopulation = ivsAnalysis.populationData[linearConfigId];
  const lvdPopulation = lvdAnalysis.populationData[linearConfigId];
  const lvpwPopulation = lvpwAnalysis.populationData[linearConfigId];
  const massPopulation = massAnalysis.populationData[massConfigId];

  if (!ivsPopulation || !lvdPopulation || !lvpwPopulation || !massPopulation) {
    return [];
  }

  const result: ComponentAnalysisPoint[] = [];

  // Check if we're using ratiometric BSA (ONLY these get origin + extension)
  const linearIsRatiometric = linearConfigId === "ratiometric_bsa";
  const massIsRatiometric = massConfigId === "ratiometric_bsa";

  // Add origin point ONLY for ratiometric BSA approaches
  if (linearIsRatiometric || massIsRatiometric) {
    result.push({
      bsa: 0,
      height: 0,

      // Linear components at origin (only if ratiometric)
      maleIvs: linearIsRatiometric ? 0 : NaN,
      femaleIvs: linearIsRatiometric ? 0 : NaN,
      maleLvd: linearIsRatiometric ? 0 : NaN,
      femaleLvd: linearIsRatiometric ? 0 : NaN,
      maleLvpw: linearIsRatiometric ? 0 : NaN,
      femaleLvpw: linearIsRatiometric ? 0 : NaN,

      // Mass values at origin (only if ratiometric)
      malePublishedMass: massIsRatiometric ? 0 : NaN,
      femalePublishedMass: massIsRatiometric ? 0 : NaN,
      maleCalculatedMass: linearIsRatiometric ? 0 : NaN,
      femaleCalculatedMass: linearIsRatiometric ? 0 : NaN,
    });
  }

  // Process ALL population data points (120-220cm, 1cm steps)
  const maxLength = Math.min(
    ivsPopulation.male.length,
    lvdPopulation.male.length,
    lvpwPopulation.male.length,
    massPopulation.male.length
  );

  for (let i = 0; i < maxLength; i++) {
    const ivsPoint = ivsPopulation.male[i];
    const lvdPoint = lvdPopulation.male[i];
    const lvpwPoint = lvpwPopulation.male[i];
    const massPoint = massPopulation.male[i];

    // Corresponding female points
    const ivsPointF = ivsPopulation.female[i];
    const lvdPointF = lvdPopulation.female[i];
    const lvpwPointF = lvpwPopulation.female[i];
    const massPointF = massPopulation.female[i];

    if (!ivsPointF || !lvdPointF || !lvpwPointF || !massPointF) continue;

    // Calculate LV mass from scaled linear components
    const maleCalculatedMass = calculateLVMass(
      ivsPoint.measurementValue,
      lvdPoint.measurementValue,
      lvpwPoint.measurementValue
    );

    const femaleCalculatedMass = calculateLVMass(
      ivsPointF.measurementValue,
      lvdPointF.measurementValue,
      lvpwPointF.measurementValue
    );

    // Add ALL population points (no filtering - show actual data only)
    result.push({
      bsa: ivsPoint.bsa,
      height: ivsPoint.height,

      // Linear components (actual DeweyMethodFactory data)
      maleIvs: ivsPoint.measurementValue,
      femaleIvs: ivsPointF.measurementValue,
      maleLvd: lvdPoint.measurementValue,
      femaleLvd: lvdPointF.measurementValue,
      maleLvpw: lvpwPoint.measurementValue,
      femaleLvpw: lvpwPointF.measurementValue,

      // Mass values (actual DeweyMethodFactory data)
      malePublishedMass: massPoint.measurementValue,
      femalePublishedMass: massPointF.measurementValue,
      maleCalculatedMass,
      femaleCalculatedMass,
    });
  }

  // Extend ratiometric BSA lines beyond population range (to ~3.5 BSA)
  const maxPopulationBSA = Math.max(
    ...result.filter((p) => p.bsa > 0).map((p) => p.bsa)
  );
  const extendTo = Math.max(3.5, maxPopulationBSA * 1.1);

  if (linearIsRatiometric || massIsRatiometric) {
    // Get coefficients for ratiometric extension
    const linearCoeffs = {
      maleIvs: ivsAnalysis.coefficients[linearConfigId]?.male || 0,
      femaleIvs: ivsAnalysis.coefficients[linearConfigId]?.female || 0,
      maleLvd: lvdAnalysis.coefficients[linearConfigId]?.male || 0,
      femaleLvd: lvdAnalysis.coefficients[linearConfigId]?.female || 0,
      maleLvpw: lvpwAnalysis.coefficients[linearConfigId]?.male || 0,
      femaleLvpw: lvpwAnalysis.coefficients[linearConfigId]?.female || 0,
    };

    const massCoeffs = {
      male: massAnalysis.coefficients[massConfigId]?.male || 0,
      female: massAnalysis.coefficients[massConfigId]?.female || 0,
    };

    // Add extension points for ratiometric BSA approaches only
    for (
      let bsa = Math.ceil(maxPopulationBSA * 10) / 10;
      bsa <= extendTo;
      bsa += 0.1
    ) {
      result.push({
        bsa,
        height: 0, // Not meaningful for extended points

        // Linear component extensions (only for ratiometric)
        maleIvs: linearIsRatiometric ? linearCoeffs.maleIvs * bsa : NaN,
        femaleIvs: linearIsRatiometric ? linearCoeffs.femaleIvs * bsa : NaN,
        maleLvd: linearIsRatiometric ? linearCoeffs.maleLvd * bsa : NaN,
        femaleLvd: linearIsRatiometric ? linearCoeffs.femaleLvd * bsa : NaN,
        maleLvpw: linearIsRatiometric ? linearCoeffs.maleLvpw * bsa : NaN,
        femaleLvpw: linearIsRatiometric ? linearCoeffs.femaleLvpw * bsa : NaN,

        // Mass extensions (only for ratiometric)
        malePublishedMass: massIsRatiometric ? massCoeffs.male * bsa : NaN,
        femalePublishedMass: massIsRatiometric ? massCoeffs.female * bsa : NaN,
        maleCalculatedMass: linearIsRatiometric
          ? calculateLVMass(
              linearCoeffs.maleIvs * bsa,
              linearCoeffs.maleLvd * bsa,
              linearCoeffs.maleLvpw * bsa
            )
          : NaN,
        femaleCalculatedMass: linearIsRatiometric
          ? calculateLVMass(
              linearCoeffs.femaleIvs * bsa,
              linearCoeffs.femaleLvd * bsa,
              linearCoeffs.femaleLvpw * bsa
            )
          : NaN,
      });
    }
  }

  return result.sort((a, b) => a.bsa - b.bsa);
};

// =============================================================================
// MAIN COMPONENT - ENHANCED
// =============================================================================

const LVMassComponentAnalysis: React.FC<LVMassComponentAnalysisProps> = ({
  formulaSelection,
  formulaCallbacks,
}) => {
  // Scaling method selections
  const [linearConfigId, setLinearConfigId] = useState("ratiometric_bsa");
  const [massConfigId, setMassConfigId] = useState("ratiometric_bsa");

  // Toggle states for linear components
  const [toggleState, setToggleState] = useState<ToggleState>({
    ivs: true,
    lvd: true,
    lvpw: true,
  });

  // UI state for accordion
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // Get available configurations
  const linearConfigs = getStandardConfigurations("linear");
  const massConfigs = getStandardConfigurations("mass");

  // NEW: Get configuration metadata for selected methods
  const getConfigurationInfo = (configId: string, configs: ScalingConfiguration[]) => {
    return configs.find(c => c.id === configId);
  };

  const linearConfigInfo = getConfigurationInfo(linearConfigId, linearConfigs);
  const massConfigInfo = getConfigurationInfo(massConfigId, massConfigs);

  // Generate data
  const analysisData = useMemo(() => {
    return generateComponentAnalysisData(
      linearConfigId,
      massConfigId,
      formulaSelection
    );
  }, [linearConfigId, massConfigId, formulaSelection]);

  // Get reference population for display (using any measurement for the reference populations)
  const referenceAnalysis = useMemo(() => {
    const ivsData = getMeasurement("ivsd")!;
    return generateScalingAnalysis(ivsData, formulaSelection);
  }, [formulaSelection]);

  const referencePopulation = {
    male: {
      height: referenceAnalysis.referencePopulations.male.height,
      weight: referenceAnalysis.referencePopulations.male.weight,
      bsa: referenceAnalysis.referencePopulations.male.bsa,
      lbm: referenceAnalysis.referencePopulations.male.lbm,
    },
    female: {
      height: referenceAnalysis.referencePopulations.female.height,
      weight: referenceAnalysis.referencePopulations.female.weight,
      bsa: referenceAnalysis.referencePopulations.female.bsa,
      lbm: referenceAnalysis.referencePopulations.female.lbm,
    },
  };

  // Toggle helper
  const toggleComponent = (component: keyof ToggleState) => {
    setToggleState((prev) => ({
      ...prev,
      [component]: !prev[component],
    }));
  };

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: "2rem" }}>
        <hgroup>
          <h2>LV Mass Component Analysis</h2>
          <p>
            Comparison of LV mass calculated from scaled linear components
            versus direct mass scaling using <strong>mean MESA data</strong>{" "}
            (Z-score = 0.0) for realistic component relationships.
          </p>
        </hgroup>
      </header>

      {/* NEW: Methodology Panel */}
      <LVMassMethodologyPanel 
        linearConfigs={linearConfigs} 
        massConfigs={massConfigs} 
      />

      {/* ENHANCED: Controls with Source Badges */}
      <section style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            background: "var(--pico-card-background-color)",
            padding: "1.5rem",
            borderRadius: "var(--pico-border-radius)",
          }}
        >
          {/* Linear Scaling Method with Badge */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <label htmlFor="linear-method-select">
                <strong>Linear Component Scaling</strong>
              </label>
              {linearConfigInfo && (
                <SourceBadge dataSource={linearConfigInfo.dataSource} size={12} />
              )}
            </div>
            <select
              id="linear-method-select"
              value={linearConfigId}
              onChange={(e) => setLinearConfigId(e.target.value)}
              style={{ width: "100%" }}
            >
              {linearConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name} {config.dataSource === 'published' ? '[MESA]' : '[Derived]'}
                </option>
              ))}
            </select>
            <div style={{
              fontSize: "0.875rem",
              color: "var(--pico-muted-color)",
              marginTop: "0.25rem",
            }}>
              Applied to IVS, LVD, LVPW measurements
              {linearConfigInfo && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontStyle: 'italic', 
                  marginTop: '0.25rem',
                  color: 'var(--pico-primary)'
                }}>
                  {linearConfigInfo.methodologyNote}
                </div>
              )}
            </div>
          </div>

          {/* Mass Scaling Method with Badge */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <label htmlFor="mass-method-select">
                <strong>LV Mass Scaling</strong>
              </label>
              {massConfigInfo && (
                <SourceBadge dataSource={massConfigInfo.dataSource} size={12} />
              )}
            </div>
            <select
              id="mass-method-select"
              value={massConfigId}
              onChange={(e) => setMassConfigId(e.target.value)}
              style={{ width: "100%" }}
            >
              {massConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name} {config.dataSource === 'published' ? '[MESA]' : '[Derived]'}
                </option>
              ))}
            </select>
            <div style={{
              fontSize: "0.875rem",
              color: "var(--pico-muted-color)",
              marginTop: "0.25rem",
            }}>
              Applied to direct LV mass reference values
              {massConfigInfo && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontStyle: 'italic', 
                  marginTop: '0.25rem',
                  color: 'var(--pico-primary)'
                }}>
                  {massConfigInfo.methodologyNote}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Charts Container (unchanged) */}
      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Linear Components Chart (unchanged) */}
          <div className="chart-container">
            <header style={{ marginBottom: "1rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>
                Linear Component Measurements
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--pico-muted-color)",
                  margin: 0,
                }}
              >
                IVS, LVD, LVPW scaled using{" "}
                {linearConfigs.find((c) => c.id === linearConfigId)?.name}
              </p>
            </header>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analysisData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--pico-border-color)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="bsa"
                  domain={[0, 3.5]}
                  type="number"
                  tickFormatter={(value) => value.toFixed(1)}
                  label={{
                    value: "Body Surface Area (m²)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  domain={[0, "dataMax"]}
                  label={{
                    value: "Measurement (cm)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number"
                      ? value.toFixed(2) + " cm"
                      : value,
                    name,
                  ]}
                  labelFormatter={(value) =>
                    `BSA: ${
                      typeof value === "number" ? value.toFixed(1) : value
                    } m²`
                  }
                />

                {/* LVD Lines (Solid) */}
                {toggleState.lvd && (
                  <>
                    <Line
                      dataKey="maleLvd"
                      stroke={COLORS.male}
                      strokeWidth={3}
                      {...LINE_STYLES.lvd}
                      dot={false}
                      name="LVD Male"
                      connectNulls={false}
                    />
                    <Line
                      dataKey="femaleLvd"
                      stroke={COLORS.female}
                      strokeWidth={3}
                      {...LINE_STYLES.lvd}
                      dot={false}
                      name="LVD Female"
                      connectNulls={false}
                    />
                  </>
                )}

                {/* IVS Lines (Dashed) */}
                {toggleState.ivs && (
                  <>
                    <Line
                      dataKey="maleIvs"
                      stroke={COLORS.ivs.male}
                      strokeWidth={2}
                      {...LINE_STYLES.ivs}
                      dot={false}
                      name="IVS Male"
                      connectNulls={false}
                    />
                    <Line
                      dataKey="femaleIvs"
                      stroke={COLORS.ivs.female}
                      strokeWidth={2}
                      {...LINE_STYLES.ivs}
                      dot={false}
                      name="IVS Female"
                      connectNulls={false}
                    />
                  </>
                )}

                {/* LVPW Lines (Dotted) */}
                {toggleState.lvpw && (
                  <>
                    <Line
                      dataKey="maleLvpw"
                      stroke={COLORS.lvpw.male}
                      strokeWidth={2}
                      {...LINE_STYLES.lvpw}
                      dot={false}
                      name="LVPW Male"
                      connectNulls={false}
                    />
                    <Line
                      dataKey="femaleLvpw"
                      stroke={COLORS.lvpw.female}
                      strokeWidth={2}
                      {...LINE_STYLES.lvpw}
                      dot={false}
                      name="LVPW Female"
                      connectNulls={false}
                    />
                  </>
                )}

                <ReferenceLine
                  x={0}
                  stroke="var(--pico-muted-color)"
                  strokeWidth={1}
                />
                <ReferenceLine
                  y={0}
                  stroke="var(--pico-muted-color)"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--pico-muted-color)",
                marginTop: "0.5rem",
              }}
            >
              <strong>Line styles:</strong> LVD (solid), IVS (dashed), LVPW
              (dotted)
            </div>

            {/* Component Toggles (unchanged) */}
            <div className="button-group" style={{ marginBottom: "1rem" }}>
              <button
                onClick={() => toggleComponent("lvd")}
                className={toggleState.lvd ? "" : "secondary"}
                style={{
                  fontSize: "0.875rem",
                  borderLeft: `4px solid ${COLORS.male}`,
                  borderRight: `4px solid ${COLORS.female}`,
                }}
              >
                {toggleState.lvd ? "LVD ✓" : "LVD"}
              </button>
              <button
                onClick={() => toggleComponent("ivs")}
                className={toggleState.ivs ? "" : "secondary"}
                style={{
                  fontSize: "0.875rem",
                  borderLeft: `4px solid ${COLORS.ivs.male}`,
                  borderRight: `4px solid ${COLORS.ivs.female}`,
                }}
              >
                {toggleState.ivs ? "IVS ✓" : "IVS"}
              </button>
              <button
                onClick={() => toggleComponent("lvpw")}
                className={toggleState.lvpw ? "" : "secondary"}
                style={{
                  fontSize: "0.875rem",
                  borderLeft: `4px solid ${COLORS.lvpw.male}`,
                  borderRight: `4px solid ${COLORS.lvpw.female}`,
                }}
              >
                {toggleState.lvpw ? "LVPW ✓" : "LVPW"}
              </button>
            </div>
          </div>

          {/* LV Mass Chart (unchanged) */}
          <div className="chart-container">
            <header style={{ marginBottom: "1rem" }}>
              <h3 style={{ margin: "0 0 0.5rem 0" }}>LV Mass Comparison</h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--pico-muted-color)",
                  margin: 0,
                }}
              >
                Published scaling vs calculated from components
              </p>
            </header>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analysisData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--pico-border-color)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="bsa"
                  domain={[0, 3.5]}
                  type="number"
                  tickFormatter={(value) => value.toFixed(1)}
                  label={{
                    value: "Body Surface Area (m²)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  domain={[0, "dataMax"]}
                  label={{
                    value: "LV Mass (g)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(1) + "g" : value,
                    name,
                  ]}
                  labelFormatter={(value) =>
                    `BSA: ${
                      typeof value === "number" ? value.toFixed(1) : value
                    } m²`
                  }
                />

                {/* Published Mass Lines (Solid) */}
                <Line
                  dataKey="malePublishedMass"
                  stroke={COLORS.male}
                  strokeWidth={3}
                  {...LINE_STYLES.published}
                  dot={false}
                  name="Published Male"
                  connectNulls={false}
                />
                <Line
                  dataKey="femalePublishedMass"
                  stroke={COLORS.female}
                  strokeWidth={3}
                  {...LINE_STYLES.published}
                  dot={false}
                  name="Published Female"
                  connectNulls={false}
                />

                {/* Calculated Mass Lines (Dashed) */}
                <Line
                  dataKey="maleCalculatedMass"
                  stroke={COLORS.male}
                  strokeWidth={3}
                  {...LINE_STYLES.calculated}
                  dot={false}
                  name="Calculated Male"
                  connectNulls={false}
                />
                <Line
                  dataKey="femaleCalculatedMass"
                  stroke={COLORS.female}
                  strokeWidth={3}
                  {...LINE_STYLES.calculated}
                  dot={false}
                  name="Calculated Female"
                  connectNulls={false}
                />

                <ReferenceLine
                  x={0}
                  stroke="var(--pico-muted-color)"
                  strokeWidth={1}
                />
                <ReferenceLine
                  y={0}
                  stroke="var(--pico-muted-color)"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>

            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--pico-muted-color)",
                marginTop: "0.5rem",
              }}
            >
              <strong>Line styles:</strong> Published (solid), Calculated from
              components (dashed)
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Controls - Progressive disclosure (unchanged) */}
      <section>
        <details
          open={showAdvancedControls}
          onToggle={(e) => setShowAdvancedControls(e.currentTarget.open)}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Advanced Controls and Formula Selection
          </summary>

          <div style={{ marginTop: "1rem" }}>
            <FormulaSelector
              selection={formulaSelection}
              callbacks={formulaCallbacks}
              layout="grid"
            />

            <div style={{ marginTop: "1rem" }}>
              <FormulaValuesDisplay
                selection={formulaSelection}
                referencePopulation={referencePopulation}
                showDetailed={false}
              />
            </div>
          </div>
        </details>
      </section>

      {/* ENHANCED: Analysis Summary with Source Context */}
      <section
        style={{
          background: "var(--pico-code-background-color)",
          padding: "1.5rem",
          borderRadius: "var(--pico-border-radius)",
          marginTop: "2rem",
        }}
      >
        <h3>Methodological Summary</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={16} />
              Component-Based Path
            </h4>
            <ol style={{ fontSize: "0.9rem" }}>
              <li>Apply scaling method to IVS, LVD, LVPW</li>
              <li>Calculate LV mass using ASE formula</li>
              <li>Results shown as dashed lines</li>
            </ol>
          </div>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} />
              Direct Mass Path
            </h4>
            <ol style={{ fontSize: "0.9rem" }}>
              <li>Apply scaling method directly to LV mass</li>
              <li>Use published reference values or derived coefficients</li>
              <li>Results shown as solid lines</li>
            </ol>
          </div>
          <div>
            <h4>ASE Formula</h4>
            <p
              style={{
                fontSize: "0.9rem",
                fontFamily: "var(--pico-font-family-monospace)",
              }}
            >
              LVM = 0.8 × [1.04 × (IVS + LVD + LVPW)³ - LVD³] + 0.6
            </p>
          </div>
        </div>
        
        {/* NEW: Current Configuration Summary */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--pico-border-color)',
          fontSize: '0.85rem',
          color: 'var(--pico-muted-color)'
        }}>
          <strong>Current Configuration:</strong><br/>
          Linear Components: {linearConfigInfo?.name} {linearConfigInfo && `[${linearConfigInfo.dataSource}]`}<br/>
          LV Mass: {massConfigInfo?.name} {massConfigInfo && `[${massConfigInfo.dataSource}]`}<br/>
          Data Source: Mean MESA values (Z-score = 0.0) for realistic physiological relationships
        </div>
      </section>
    </div>
  );
};

export default LVMassComponentAnalysis;