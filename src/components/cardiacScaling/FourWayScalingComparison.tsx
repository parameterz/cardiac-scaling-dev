// src/components/cardiacScaling/FourWayScalingComparison.tsx

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

// Import core dependencies
import {
  STROM_MEASUREMENTS,
  type EnhancedMeasurementData,
} from "@/data/stromData";
import FormulaSelector, {
  FormulaValuesDisplay,
  type FormulaSelectionState,
  type FormulaSelectionCallbacks,
} from "@/components/common/FormulaSelector";

// Import the CONSISTENT ALLOMETRIC DeweyMethodFactory
import {
  generateScalingAnalysis,
  getStandardConfigurations,
  type DeweyMethodResult,
  type ScalingConfiguration,
} from "./core/DeweyMethodFactory";

// Import Data Disclosure
import DataDisclosurePanel from "./DataDisclosurePanel";

// =============================================================================
// ENHANCED COMPONENT INTERFACE
// =============================================================================

interface CategoryContext {
  categoryName: string;
  expectedApproaches: number;
  scalingInfo: string;
}

interface FourWayScalingComparisonProps {
  availableMeasurements?: EnhancedMeasurementData[];
  initialMeasurement?: string;
  categoryContext?: CategoryContext;
  // NEW: Accept formula selection as props for persistence across tabs
  formulaSelection: FormulaSelectionState;
  formulaCallbacks: FormulaSelectionCallbacks;
}

interface ToggleState {
  [configId: string]: {
    male: boolean;
    female: boolean;
  };
}

interface ConfigurationDisplay {
  id: string;
  name: string;
  description: string;
  color: {
    male: string;
    female: string;
  };
  strokeWidth: number;
  strokeDasharray?: string;
}

// =============================================================================
// CONSISTENT ALLOMETRIC COLOR PALETTE
// =============================================================================

const CONFIGURATION_COLORS: Record<string, ConfigurationDisplay> = {
  // Ratiometric approaches
  ratiometric_bsa: {
    id: "ratiometric_bsa",
    name: "Ratiometric BSA",
    description: "Current clinical standard",
    color: { male: "#60a5fa", female: "#f87171" },
    strokeWidth: 2,
    strokeDasharray: "6 3",
  },

  // Allometric approaches
  allometric_lbm: {
    id: "allometric_lbm",
    name: "Allometric LBM",
    description: "Universal biological scaling",
    color: { male: "#3b82f6", female: "#dc2626" },
    strokeWidth: 3,
  },
  allometric_bsa: {
    id: "allometric_bsa",
    name: "Allometric BSA",
    description: "Geometric BSA scaling",
    color: { male: "#398712", female: "#55c21e" },
    strokeWidth: 3,
  },
  allometric_height: {
    id: "allometric_height",
    name: "Allometric Height",
    description: "Standard height scaling",
    color: { male: "#7540bf", female: "#bd9fdf" },
    strokeWidth: 3,
  },
  allometric_height_16: {
    id: "allometric_height_16",
    name: "Height^1.6 (Empirical)",
    description: "Empirical literature findings",
    color: { male: "#9236a4", female: "#cd68e0" },
    strokeWidth: 3,
  },
  allometric_height_27: {
    id: "allometric_height_27",
    name: "Height^2.7 (Empirical)",
    description: "Empirical literature findings",
    color: { male: "#b21e4f", female: "#f8889e" },
    strokeWidth: 3,
  },
};

// =============================================================================
// MAIN COMPONENT - PROFESSIONAL STYLING
// =============================================================================

const FourWayScalingComparison: React.FC<FourWayScalingComparisonProps> = ({
  availableMeasurements = STROM_MEASUREMENTS,
  initialMeasurement = "lvdd",
  categoryContext,
  formulaSelection, // NOW PASSED AS PROP
  formulaCallbacks,  // NOW PASSED AS PROP
}) => {
  // State
  const [selectedMeasurementId, setSelectedMeasurementId] =
    useState(initialMeasurement);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);

  // REMOVED: Formula selection hook - now passed as props
  // const { selection: formulaSelection, callbacks: formulaCallbacks } =
  //   useFormulaSelection();

  // Get current measurement from available measurements
  const measurement =
    availableMeasurements.find((m) => m.id === selectedMeasurementId) ||
    availableMeasurements[0];

  // Update selected measurement when initialMeasurement changes (category switching)
  React.useEffect(() => {
    if (
      initialMeasurement &&
      availableMeasurements.find((m) => m.id === initialMeasurement)
    ) {
      setSelectedMeasurementId(initialMeasurement);
    } else if (availableMeasurements.length > 0) {
      setSelectedMeasurementId(availableMeasurements[0].id);
    }
  }, [initialMeasurement, availableMeasurements]);

  // Generate factory result with all configurations
  const factoryResult = useMemo(() => {
    if (!measurement) return null;

    console.log(
      `Analysis: Generating scaling analysis for ${measurement.name}...`
    );

    // Get all standard configurations for this measurement type
    const configurations = getStandardConfigurations(measurement.type);

    const result = generateScalingAnalysis(
      measurement,
      formulaSelection,
      configurations,
      {
        populationRange: {
          height: { min: 120, max: 220, step: 1 },
          bmi: { min: 24, max: 24, step: 1 },
        },
        includeCorrelations: true,
        generateInsights: true,
      }
    );

    console.log(
      `Analysis Complete: ${configurations.length} configurations analyzed`
    );
    return result;
  }, [measurement, formulaSelection, categoryContext]);

  // Smart toggle state - start with key approaches visible
  const [toggleState, setToggleState] = useState<ToggleState>(() => {
    if (!factoryResult) return {};

    const initialState: ToggleState = {};
    factoryResult.configurations.forEach((config) => {
      // Start with the most impactful comparison: Ratiometric BSA vs Allometric LBM
      const isKeyApproach = ["ratiometric_bsa", "allometric_lbm"].includes(
        config.id
      );
      initialState[config.id] = {
        male: isKeyApproach,
        female: isKeyApproach,
      };
    });
    return initialState;
  });

  // Update toggle state when configurations change
  React.useEffect(() => {
    if (!factoryResult) return;

    setToggleState((prevState) => {
      const newState: ToggleState = {};
      factoryResult.configurations.forEach((config) => {
        const existing = prevState[config.id];
        if (existing) {
          newState[config.id] = existing;
        } else {
          // Default for new configurations - start with key comparison
          const isKeyApproach = ["ratiometric_bsa", "allometric_lbm"].includes(
            config.id
          );
          newState[config.id] = {
            male: isKeyApproach,
            female: isKeyApproach,
          };
        }
      });
      return newState;
    });
  }, [factoryResult]);

  if (!measurement || !factoryResult) {
    return <div>Loading comprehensive scaling analysis...</div>;
  }

  // Helper functions
  const toggleConfiguration = (configId: string, sex: "male" | "female") => {
    setToggleState((prev) => ({
      ...prev,
      [configId]: {
        ...prev[configId],
        [sex]: !prev[configId]?.[sex],
      },
    }));
  };

  const toggleAllForConfig = (configId: string) => {
    const current = toggleState[configId];
    const allOn = current?.male && current?.female;
    setToggleState((prev) => ({
      ...prev,
      [configId]: {
        male: !allOn,
        female: !allOn,
      },
    }));
  };

  // Quick action presets
  const showKeyComparison = () => {
    const newState: ToggleState = {};
    factoryResult.configurations.forEach((config) => {
      const isKey = ["ratiometric_bsa", "allometric_lbm"].includes(config.id);
      newState[config.id] = { male: isKey, female: isKey };
    });
    setToggleState(newState);
  };

  const showAllApproaches = () => {
    const newState: ToggleState = {};
    factoryResult.configurations.forEach((config) => {
      newState[config.id] = { male: true, female: true };
    });
    setToggleState(newState);
  };

  const hideAllApproaches = () => {
    const newState: ToggleState = {};
    factoryResult.configurations.forEach((config) => {
      newState[config.id] = { male: false, female: false };
    });
    setToggleState(newState);
  };

  // Reference population for display
  const referencePopulation = {
    male: {
      height: factoryResult.referencePopulations.male.height,
      weight: factoryResult.referencePopulations.male.weight,
      bsa: factoryResult.referencePopulations.male.bsa,
      lbm: factoryResult.referencePopulations.male.lbm,
    },
    female: {
      height: factoryResult.referencePopulations.female.height,
      weight: factoryResult.referencePopulations.female.weight,
      bsa: factoryResult.referencePopulations.female.bsa,
      lbm: factoryResult.referencePopulations.female.lbm,
    },
  };

  return (
    <div>
      {/* Professional Header - Clean and functional */}
      <header style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px" }}>
            <label
              htmlFor="measurement-select"
              style={{
                fontWeight: "bold",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              {categoryContext
                ? `${categoryContext.categoryName}`
                : "Measurement Selection"}
            </label>
            <select
              id="measurement-select"
              value={selectedMeasurementId}
              onChange={(e) => setSelectedMeasurementId(e.target.value)}
              style={{ width: "100%" }}
            >
              {availableMeasurements.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.absoluteUnit})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button onClick={showKeyComparison} className="button-small">
              Key Comparison
            </button>
            <button
              onClick={showAllApproaches}
              className="button-small secondary"
            >
              Show All
            </button>
            <button
              onClick={hideAllApproaches}
              className="button-small secondary"
            >
              Hide All
            </button>
          </div>
        </div>
      </header>

      {/* Primary Visualization - Chart first! */}
      <section className="chart-container" style={{ marginBottom: "1.5rem" }}>
        <header style={{ marginBottom: "1rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>
            {measurement.name} - Scaling Approaches Comparison
          </h3>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--pico-muted-color)",
              margin: 0,
            }}
          >
            {categoryContext
              ? categoryContext.scalingInfo
              : "Comparative analysis of scaling methodologies"}{" "}
            • Toggle approaches below chart
          </p>
        </header>

        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={factoryResult.chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--pico-border-color)"
              opacity={0.5}
            />
            <XAxis
              dataKey="scalingValue"
              type="number"
              domain={[0, 3.5]}
              tickFormatter={(value) => value.toFixed(1)}
              label={{
                value: `Body Surface Area (m²)`,
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              domain={[0, "dataMax"]}
              label={{
                value: `${measurement.name} (${measurement.absoluteUnit})`,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (typeof value !== "number") return [value, name];

                const nameStr = String(name);
                const configId = nameStr
                  .replace("_male", "")
                  .replace("_female", "");
                const sex = nameStr.includes("_male") ? "Male" : "Female";
                const display = CONFIGURATION_COLORS[configId];

                const displayName = display
                  ? `${display.name} ${sex}`
                  : nameStr;
                return [value.toFixed(2), displayName];
              }}
              labelFormatter={(value) => `BSA: ${value?.toFixed(2)} m²`}
              contentStyle={{
                fontSize: "0.875rem",
                padding: "0.5rem",
                maxWidth: "250px",
              }}
            />

            {/* Render lines for each configuration */}
            {factoryResult.configurations.map((config) => {
              const display = CONFIGURATION_COLORS[config.id] || {
                color: { male: "#6b7280", female: "#9ca3af" },
                strokeWidth: 2,
              };
              const toggles = toggleState[config.id] || {
                male: false,
                female: false,
              };

              return (
                <React.Fragment key={config.id}>
                  {/* Male line */}
                  {toggles.male && (
                    <Line
                      dataKey={`${config.id}_male`}
                      stroke={display.color.male}
                      strokeWidth={display.strokeWidth}
                      strokeDasharray={display.strokeDasharray}
                      dot={false}
                      name={`${config.id}_male`}
                      connectNulls={false}
                    />
                  )}

                  {/* Female line */}
                  {toggles.female && (
                    <Line
                      dataKey={`${config.id}_female`}
                      stroke={display.color.female}
                      strokeWidth={display.strokeWidth}
                      strokeDasharray={display.strokeDasharray}
                      dot={false}
                      name={`${config.id}_female`}
                      connectNulls={false}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Reference lines */}
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

            {/* Reference population markers */}
            <ReferenceLine
              x={referencePopulation.male.bsa}
              stroke="#3b82f6"
              strokeWidth={1}
              strokeDasharray="2 2"
              label={{
                value: "♂",
                position: "top",
                style: { fontSize: "12px" },
              }}
            />
            <ReferenceLine
              x={referencePopulation.female.bsa}
              stroke="#dc2626"
              strokeWidth={1}
              strokeDasharray="2 2"
              label={{
                value: "♀",
                position: "top",
                style: { fontSize: "12px" },
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Scaling Approach Controls  */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h4 style={{ margin: "0 0 1rem 0" }}>Scaling Approach Controls</h4>
        <div className="metrics-grid">
          {factoryResult.configurations.map((config) => {
            const display = CONFIGURATION_COLORS[config.id] || {
              id: config.id,
              name: config.name,
              description: config.description,
              color: { male: "#6b7280", female: "#9ca3af" },
              strokeWidth: 2,
            };

            const toggles = toggleState[config.id] || {
              male: false,
              female: false,
            };
            const coefficients = factoryResult.coefficients[config.id];

            return (
              <div
                key={config.id}
                className="metric-card"
                style={{ padding: "1rem" }}
              >
                <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                  {display.name}
                </h5>

                {/* Toggle Controls - Your excellent design preserved! */}
                <div
                  className="button-group"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <button
                    onClick={() => toggleAllForConfig(config.id)}
                    className={
                      toggles.male && toggles.female ? "" : "secondary"
                    }
                    style={{ fontSize: "0.875rem", fontWeight: "bold" }}
                  >
                    {toggles.male && toggles.female
                      ? "✅ Show Both"
                      : "⬜ Show Both"}
                  </button>
                  <button
                    onClick={() => toggleConfiguration(config.id, "male")}
                    className={toggles.male ? "" : "secondary"}
                    style={{
                      fontSize: "0.875rem",
                      borderLeft: `4px solid ${display.color.male}`,
                    }}
                  >
                    {toggles.male ? "♂ Male ✓" : "♂ Male"}
                  </button>
                  <button
                    onClick={() => toggleConfiguration(config.id, "female")}
                    className={toggles.female ? "" : "secondary"}
                    style={{
                      fontSize: "0.875rem",
                      borderLeft: `4px solid ${display.color.female}`,
                    }}
                  >
                    {toggles.female ? "♀ Female ✓" : "♀ Female"}
                  </button>
                </div>

                {/* Summary statistics */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--pico-muted-color)",
                  }}
                >
                  <div>{display.description}</div>
                </div>
              </div>
            );
          })}
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
      {/* Data Disclosure Panel */}
      <section>
        <DataDisclosurePanel
          factoryResult={factoryResult}
          measurement={measurement}
          formulaSelection={formulaSelection}
        />
      </section>
    </div>
  );
};

export default FourWayScalingComparison;