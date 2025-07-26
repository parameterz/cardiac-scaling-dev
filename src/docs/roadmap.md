# Cardiac Scaling Analysis Laboratory - Project Roadmap

## 🎯 Project Vision

Create an interactive, educational platform for exploring cardiac measurement scaling approaches across different methodologies. The tool will provide factual, data-driven comparisons without advocating for specific approaches, allowing users to understand the implications of different scaling choices.

## 🔬 Core Scientific Framework

### Four Scaling Approaches
1. **Ratiometric BSA**: Current clinical standard (linear indexing to BSA)
2. **Allometric LBM**: Biological scaling using lean body mass
3. **Allometric BSA**: Geometric scaling using body surface area  
4. **Allometric Height**: Pure geometric scaling using height

### Measurement Categorization by Physics
- **1D Linear**: Dimensions, diameters, thicknesses (LVDd, wall thickness, vessel diameters)
- **2D Area**: Chamber areas, valve areas, cross-sectional areas
- **3D Mass/Volume**: Tissue masses, chamber volumes, flow rates

### Expected Scaling Relationships
| Type | LBM | BSA | Height |
|------|-----|-----|--------|
| Linear | ^0.33 | ^0.5 | ^1.0 |
| Area | ^0.67 | ^1.0 | ^2.0 |
| Mass/Volume | ^1.0 | ^1.5 | ^1.6-2.7 |

## 🏗️ Architecture Overview

### Component Structure
```
├── Core/
│   ├── DeweyMethodFactory.ts        # Universal coefficient calculation
│   ├── PopulationGenerator.ts       # Height/BMI range populations  
│   ├── CoefficientCalculator.ts     # Scaling coefficient derivation
│   └── ValidationEngine.ts          # Compare derived vs published values
├── Visualization/
│   ├── ScalingChart.tsx             # Main chart component
│   ├── MetricsPanel.tsx             # Correlation stats, R² analysis
│   ├── ChartLegend.tsx              # Dynamic legend with toggle states
│   └── TransparencyPanel.tsx        # Step-by-step calculations
├── Controls/
│   ├── MeasurementSelector.tsx      # Measurement choice with metadata
│   ├── FormulaSelector.tsx          # BSA/LBM formula selection
│   ├── ToggleControls.tsx           # Show/hide scaling approaches
│   └── DimensionalTabs.tsx          # 1D/2D/3D organization
└── Layout/
    ├── TabManager.tsx               # Tab state management
    └── ComparisonDashboard.tsx      # Main container component
```

### Data Generation Pipeline
1. **Reference Population Setup**: Calculate BSA/LBM for canonical populations (178cm♂, 164cm♀, **BMI 24**)
2. **Coefficient Derivation**: Back-calculate absolute values from indexed literature data
3. **Population Generation**: Create curves across height (120-220cm) and BMI (16-45) ranges
4. **Cross-Method Analysis**: Generate correlation matrices between all approaches

### Reference Population Standard
All coefficient derivation uses **BMI 24** for both male (178cm) and female (164cm) canonical populations, ensuring:
- Healthy-weight baseline (normal BMI range without extremes)
- Unbiased scaling relationships (no weight-related cardiac adaptations)
- Reproducible reference point across all measurements
- Validation consistency with literature (most studies use normal-weight cohorts)

## 📊 User Interface Design

### Tab Organization
**Tab 1: Linear Measurements (1D)**
- Default: Ratiometric BSA vs Allometric LBM
- Buttons: Show BSA^0.5 | Show Height^1.0
- Key insight: BSA indexing shows geometric limitations for dimensions

**Tab 2: Area Measurements (2D)**  
- Default: Ratiometric BSA vs Allometric LBM
- Buttons: Show BSA^1.0 | Show Height^2.0
- Key insight: BSA^1.0 should theoretically be optimal for areas

**Tab 3: Mass/Volume Measurements (3D)**
- Default: Ratiometric BSA vs Allometric LBM  
- Buttons: Show BSA^1.5 | Show Height^1.6 | Show Height^2.7
- Key insight: Height exponent mystery - empirical vs theoretical scaling

### Toggle Control System
Each scaling approach gets independent toggles:
- ☑️ Male curves
- ☑️ Female curves  
- ☑️ Show approach (master toggle)

**Smart defaults**: Start with 2 approaches visible, progressive disclosure

### Metrics Dashboard
- **Sex Similarity Scores**: Percentage agreement between male/female coefficients
- **Cross-Method Correlations**: R² between different scaling approaches
- **Population Breakdowns**: Performance across BMI ranges, height extremes
- **Validation Status**: Comparison with published literature values

## 🔍 The Dewey Method Factory

### Core Functionality
```typescript
generateAllometricScaling({
  measurement: EnhancedMeasurementData,
  scalingVariable: 'lbm' | 'bsa' | 'height',
  exponent: number,
  bsaFormula: string,
  lbmFormula: string,
  populationRange: { height: Range, bmi: Range }
})
```

### Process Flow
1. **Reference Populations**: Calculate BSA/LBM for canonical individuals
2. **Back-Calculation**: Convert indexed values to absolute measurements  
3. **Coefficient Derivation**: Calculate scaling coefficients (universal for LBM, sex-specific for BSA/Height)
4. **Population Generation**: Apply coefficients across physiological ranges
5. **Validation**: Compare derived coefficients with published values

### Output Structure
```typescript
{
  coefficients: { male: number, female: number, universal?: number },
  populationData: PopulationPoint[],
  chartData: ChartDataPoint[],
  validationMetrics: { publishedMatch: number, rSquared: number },
  correlationMatrix: CorrelationData
}
```

## 📈 Analytical Capabilities

### Cross-Method Validation
- **Four-way correlations**: All scaling approaches against each other
- **Population-specific analysis**: Performance across BMI/height ranges
- **Clinical decision points**: Where scaling choice affects interpretation

### Validation Opportunities
- **Literature Consistency**: Compare Dewey-derived coefficients vs Strom published values
- **Formula Robustness**: Test coefficient stability across BSA/LBM formula choices
- **Geometric Validation**: Verify BSA^1.0 optimality for area measurements

### Research Insights
- **Height Exponent Mystery**: Interactive exploration of Height^1.6 vs Height^2.7 for mass/volume
- **Universal Biology**: Test LBM coefficient universality across sexes
- **Clinical Relevance**: Population ranges where scaling choice matters most

## 🎓 Educational Value

### Progressive Understanding
1. **Geometric Limitations**: Why BSA indexing has physics constraints
2. **Biological Scaling**: How body composition affects cardiac measurements  
3. **Methodological Choices**: Impact of formula selection on scaling relationships
4. **Clinical Translation**: When scaling approach affects patient interpretation

### Transparency Features
- **Step-by-step calculations**: Complete Dewey method exposition
- **Validation dashboard**: Compare derived vs published coefficients
- **Formula impact analysis**: Show robustness across methodological choices
- **Population effect visualization**: Where body composition matters most

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Current)
- [x] Basic ratiometric vs allometric LBM comparison
- [x] Dewey method proof of concept
- [x] MESA data integration
- [ ] Component architecture refactoring

### Phase 2: Core Expansion
- [ ] DeweyMethodFactory implementation
- [ ] Four-way scaling comparison
- [ ] Tab-based organization (1D/2D/3D)
- [ ] Toggle control system
- [ ] Validation engine

### Phase 3: Advanced Analytics  
- [ ] Cross-method correlation analysis
- [ ] Population-specific breakdowns
- [ ] Height exponent exploration
- [ ] Formula robustness testing

### Phase 4: Clinical Translation
- [ ] Clinical decision support insights
- [ ] Publication-ready statistics
- [ ] Population range recommendations
- [ ] Export functionality

## 📝 Development Checklist

### Core Components
- [ ] Extract data generation into DeweyMethodFactory
- [ ] Create PopulationGenerator for height/BMI ranges
- [ ] Build CoefficientCalculator with validation
- [ ] Implement ScalingChart with toggle support
- [ ] Create MetricsPanel for correlation analysis
- [ ] Build TabManager for 1D/2D/3D organization

### Data Integration
- [ ] Implement all four scaling approaches
- [ ] Add height^1.6 and height^2.7 options for mass/volume
- [ ] Create comprehensive validation against Strom data
- [ ] Build correlation matrix calculations
- [ ] Add population-specific analysis

### User Experience
- [ ] Implement progressive disclosure with smart defaults
- [ ] Create intuitive toggle control system
- [ ] Add transparency panel with step-by-step calculations
- [ ] Build educational tooltips and explanations
- [ ] Create export functionality for charts and data

### Quality Assurance
- [ ] Validate Dewey method against published coefficients
- [ ] Test formula robustness across BSA/LBM choices
- [ ] Verify geometric relationships (BSA^1.0 for areas)
- [ ] Cross-check correlation calculations
- [ ] Performance testing with large population ranges

## 🔬 Scientific Validation Targets

### Expected Validations
- Dewey-derived height coefficients should match Strom published values within 2-5%
- BSA^1.0 should show optimal correlation for area measurements
- LBM coefficients should demonstrate high sex similarity (>90%)
- Height^2.7 should outperform Height^1.6 for mass/volume in correlation analysis

### Open Questions to Explore
- What height exponent truly optimizes mass/volume scaling?
- How robust are LBM coefficients across different formula choices?
- Which populations show maximum scaling approach divergence?
- Can we identify clinical decision thresholds where scaling choice matters?

## 📚 References & Data Sources

### Primary Data
- **Strom et al. (2024)**: MESA normal reference limits with multiple indexation methods
- **Dewey et al. (2008)**: Theoretical framework for allometric scaling in cardiology

### Formula Sources  
- **BSA Formulas**: Du Bois (1916), Mosteller (1987), Haycock (1978), Gehan (1970)
- **LBM Formulas**: Boer (1984), Hume (1971), Yu (2013), Lee (2017)

### Validation Targets
- Published height coefficients from Strom et al.
- Geometric scaling theory predictions
- Cross-study coefficient consistency

---

*This roadmap represents the evolution from simple ratiometric comparison to comprehensive scaling methodology analysis, maintaining scientific rigor while enhancing educational value.*