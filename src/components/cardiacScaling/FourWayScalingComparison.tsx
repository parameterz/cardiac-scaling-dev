// src/components/cardiacScaling/FourWayScalingComparison.tsx
// CHANGES: Added Lucide icons, source badges, and methodology explanation panel

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

// Import the ENHANCED DeweyMethodFactory with dataSource metadata
import {
  generateScalingAnalysis,
  getStandardConfigurations,
  type DeweyMethodResult,
  type ScalingConfiguration,
} from "./core/DeweyMethodFactory";

// Import Data Disclosure
import DataDisclosurePanel from "./DataDisclosurePanel";

// =============================================================================
// ENHANCED COMPONENT INTERFACE (unchanged)
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
// CONSISTENT ALLOMETRIC COLOR PALETTE (unchanged)
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
// NEW: SOURCE BADGE COMPONENT
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
// NEW: METHODOLOGY EXPLANATION PANEL
// =============================================================================

interface MethodologyPanelProps {
  configurations: ScalingConfiguration[];
}

const MethodologyPanel: React.FC<MethodologyPanelProps> = ({ configurations }) => {
  const publishedConfigs = configurations.filter(c => c.dataSource === 'published');
  const derivedConfigs = configurations.filter(c => c.dataSource === 'derived');

  return (
    <details style={{ marginBottom: '1.5rem' }}>
      <summary style={{ 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        fontSize: '1rem',
        marginBottom: '0.5rem'
      }}>
        📚 Data Sources & Methodology
      </summary>
      
      <div style={{ 
        marginTop: '1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Published MESA Data */}
        <div style={{
          background: 'var(--pico-code-background-color)',
          padding: '1rem',
          borderRadius: 'var(--pico-border-radius)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <h5 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} />
            Published MESA Data
          </h5>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            These approaches use the exact scaling relationships published by Strom et al., 
            applying the reference values as originally indexed in the MESA study.
          </p>
          
          {publishedConfigs.length > 0 && (
            <div>
              <strong style={{ fontSize: '0.85rem' }}>Available methods:</strong>
              <ul style={{ fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                {publishedConfigs.map(config => (
                  <li key={config.id}>{config.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Derived Methods */}
        <div style={{
          background: 'var(--pico-code-background-color)',
          padding: '1rem',
          borderRadius: 'var(--pico-border-radius)',
          borderLeft: '4px solid #059669'
        }}>
          <h5 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={16} />
            Derived Methods (Dewey Methodology)
          </h5>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
            These approaches use coefficients derived by back-calculating absolute values 
            from MESA BSA-indexed data, then applying alternative scaling relationships 
            based on geometric theory and biological principles.
          </p>
          
          {derivedConfigs.length > 0 && (
            <div>
              <strong style={{ fontSize: '0.85rem' }}>Available methods:</strong>
              <ul style={{ fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                {derivedConfigs.map(config => (
                  <li key={config.id}>{config.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Methodological Notes */}
      <div style={{ 
        marginTop: '1.5rem',
        fontSize: '0.85rem',
        color: 'var(--pico-muted-color)',
        fontStyle: 'italic'
      }}>
        <strong>Methodology Reference:</strong> Dewey FE, et al. Does size matter? Clinical applications of scaling cardiac size and function for body size. <em>Circulation.</em> 2008;117:2279-2287.
      </div>
    </details>
  );
};

// =============================================================================
// MAIN COMPONENT - WITH ENHANCED CONFIGURATION DISPLAY
// =============================================================================

const FourWayScalingComparison: React.FC<FourWayScalingComparisonProps> = ({
  availableMeasurements = STROM_MEASUREMENTS,
  initialMeasurement = "lvdd",
  categoryContext,
  formulaSelection,
  formulaCallbacks,
}) => {
  // State (unchanged)
  const [selectedMeasurementId, setSelectedMeasurementId] = useState(initialMeasurement);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);

  // Get current measurement from available measurements (unchanged)
  const measurement = availableMeasurements.find((m) => m.id === selectedMeasurementId) || availableMeasurements[0];

  // Update selected measurement when initialMeasurement changes (unchanged)
  React.useEffect(() => {
    if (initialMeasurement && availableMeasurements.find((m) => m.id === initialMeasurement)) {
      setSelectedMeasurementId(initialMeasurement);
    } else if (availableMeasurements.length > 0) {
      setSelectedMeasurementId(availableMeasurements[0].id);
    }
  }, [initialMeasurement, availableMeasurements]);

  // Generate factory result with all configurations (unchanged)
  const factoryResult = useMemo(() => {
    if (!measurement) return null;

    console.log(`Analysis: Generating scaling analysis for ${measurement.name}...`);

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

    console.log(`Analysis Complete: ${configurations.length} configurations analyzed`);
    return result;
  }, [measurement, formulaSelection, categoryContext]);

  // Smart toggle state (unchanged)
  const [toggleState, setToggleState] = useState<ToggleState>(() => {
    if (!factoryResult) return {};

    const initialState: ToggleState = {};
    factoryResult.configurations.forEach((config) => {
      const isKeyApproach = ["ratiometric_bsa", "allometric_lbm"].includes(config.id);
      initialState[config.id] = {
        male: isKeyApproach,
        female: isKeyApproach,
      };
    });
    return initialState;
  });

  // Update toggle state when configurations change (unchanged)
  React.useEffect(() => {
    if (!factoryResult) return;

    setToggleState((prevState) => {
      const newState: ToggleState = {};
      factoryResult.configurations.forEach((config) => {
        const existing = prevState[config.id];
        if (existing) {
          newState[config.id] = existing;
        } else {
          const isKeyApproach = ["ratiometric_bsa", "allometric_lbm"].includes(config.id);
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

  // Helper functions (unchanged)
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

  // Quick action presets (unchanged)
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

  // Reference population for display (unchanged)
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
      {/* Professional Header - Clean and functional (unchanged) */}
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

      {/* NEW: Methodology Explanation Panel */}
      <MethodologyPanel configurations={factoryResult.configurations} />

      {/* Primary Visualization - Chart first! (unchanged) */}
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

            {/* Render lines for each configuration (unchanged) */}
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

            {/* Reference lines (unchanged) */}
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

            {/* Reference population markers (unchanged) */}
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

      {/* ENHANCED: Scaling Approach Controls with Source Badges */}
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
                {/* ENHANCED: Header with Source Badge */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <h5 style={{ margin: 0, fontSize: "1rem" }}>
                    {display.name}
                  </h5>
                  <SourceBadge dataSource={config.dataSource} />
                </div>

                {/* Toggle Controls - Preserved excellent design! */}
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

                {/* ENHANCED: Description with Methodology Note */}
                <div style={{ fontSize: "0.75rem", color: "var(--pico-muted-color)" }}>
                  <div style={{ marginBottom: '0.25rem' }}>{display.description}</div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
                    {config.methodologyNote}
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Data Disclosure Panel (unchanged) */}
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