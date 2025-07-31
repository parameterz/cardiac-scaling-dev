// src/components/cardiacScaling/LVMassComponentAnalysis.tsx

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
// ASE LV MASS CALCULATION
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
// DATA STRUCTURES
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

// NEW: Component props interface
interface LVMassComponentAnalysisProps {
  formulaSelection: FormulaSelectionState;
  formulaCallbacks: FormulaSelectionCallbacks;
}

// =============================================================================
// STYLING CONSTANTS
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
// DATA GENERATION
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
// MAIN COMPONENT
// =============================================================================

const LVMassComponentAnalysis: React.FC<LVMassComponentAnalysisProps> = ({
  formulaSelection, // NOW PASSED AS PROP
  formulaCallbacks,  // NOW PASSED AS PROP
}) => {
  // REMOVED: Formula selection hook - now passed as props
  // const { selection: formulaSelection, callbacks: formulaCallbacks } =
  //   useFormulaSelection();

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
  const massConfigs = getStandardConfigurations("mass"); // Use mass type for more options

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

      {/* Controls */}
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
          {/* Linear Scaling Method */}
          <div>
            <label htmlFor="linear-method-select">
              <strong>Linear Component Scaling</strong>
            </label>
            <select
              id="linear-method-select"
              value={linearConfigId}
              onChange={(e) => setLinearConfigId(e.target.value)}
              style={{ width: "100%" }}
            >
              {linearConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--pico-muted-color)",
                marginTop: "0.25rem",
              }}
            >
              Applied to IVS, LVD, LVPW measurements
            </div>
          </div>

          {/* Mass Scaling Method */}
          <div>
            <label htmlFor="mass-method-select">
              <strong>LV Mass Scaling</strong>
            </label>
            <select
              id="mass-method-select"
              value={massConfigId}
              onChange={(e) => setMassConfigId(e.target.value)}
              style={{ width: "100%" }}
            >
              {massConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--pico-muted-color)",
                marginTop: "0.25rem",
              }}
            >
              Applied to direct LV mass reference values
            </div>
          </div>
        </div>
      </section>

      {/* Charts Container */}
      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Linear Components Chart */}
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

            {/* Component Toggles */}
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

          {/* LV Mass Chart */}
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

      {/* Advanced Controls - Progressive disclosure */}
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

      {/* Analysis Summary */}
      <section
        style={{
          background: "var(--pico-code-background-color)",
          padding: "1.5rem",
          borderRadius: "var(--pico-border-radius)",
          marginTop: "2rem",
        }}
      >
        <h3>Methodological Approach</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div>
            <h4>Linear Component Path</h4>
            <ol style={{ fontSize: "0.9rem" }}>
              <li>Apply scaling method to IVS, LVD, LVPW</li>
              <li>Calculate LV mass using ASE formula</li>
              <li>Results shown as dashed lines</li>
            </ol>
          </div>
          <div>
            <h4>Direct Mass Path</h4>
            <ol style={{ fontSize: "0.9rem" }}>
              <li>Apply scaling method directly to LV mass</li>
              <li>Use published reference values</li>
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
      </section>
    </div>
  );
};

export default LVMassComponentAnalysis;