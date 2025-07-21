# Interactive Cardiac Scaling Tool - Development Roadmap

## Project Overview
Building a revolutionary interactive tool that demonstrates universal biological scaling relationships for cardiac measurements, exposing flaws in ratiometric BSA scaling and providing clinically practical alternatives.

## Core Innovation (Refined)
- **Universal LBM coefficients** derived by averaging sex-specific calculations
  - Linear measurements: LBM^0.33 (e.g., 1.166 for LVDd)
  - Mass/Volume measurements: LBM^1.0 
- **Sex-specific BSA coefficients** account for body composition differences
  - Linear: BSA^0.5 (~3.22 cm/m for both sexes)
  - Mass/Volume: BSA^1.5 
- **Dynamic coefficient generation** using Dewey et al. methodology
  - Back-calculate from multiple published indices (robust approach)
  - Auto-detect measurement type → apply appropriate exponents
- **Ratiometric scaling artifacts** exposed through interactive visualization

## Key Scientific Insights

### Universal Biology Principle
- **LBM coefficients should be universal** (same for both sexes) - represents true biological relationship
- **BSA coefficients remain sex-specific** - compensate for body composition differences at same BSA
- **Validation approach**: Calculate separate male/female LBM coefficients, then average
  - If similar → supports universal biology hypothesis
  - If different → investigate further

### Measurement-Type Differentiation  
- **Linear measurements** (dimensions): LBM^0.33, BSA^0.5
- **Mass/Volume measurements**: LBM^1.0, BSA^1.5
- **Different physics** require different scaling exponents

### Robust Back-Calculation Strategy
- **Linear**: Average BSA + Height indices for stronger foundation
- **Mass/Volume**: Average BSA + Height^1.6 indices when available  
- **Fallback**: Use available indices if complete set unavailable
- **Validation**: Test across multiple Strom measurements

---

## Phase 1: Foundation Infrastructure
**Goal:** Establish robust data foundation and calculation utilities

### 1.1 Strom Reference Data Module
**Priority:** Critical (blocks everything else)
**Estimated effort:** 3-4 hours
**Files:**
- `src/data/stromData.ts`
- `src/data/referencePopulations.ts`
- `src/data/measurementDefinitions.ts`

**Tasks:**
- [ ] **Structure Strom Table 3 data** with measurement type classification:
  - **Linear measurements**: LVDd, IVSd, LVPW (BSA + Height indices)
  - **Mass measurements**: LVM (BSA + Height^1.6 indices if available)
  - **Volume measurements**: LA volume, LV volumes (BSA + Height^1.6 indices)
- [ ] **Reference population definitions** (178cm♂, 164cm♀, BMI 25)
- [ ] **Measurement metadata**:
  - Type classification (linear/mass/volume)
  - Expected LBM exponents (0.33 for linear, 1.0 for mass/volume)
  - Expected BSA exponents (0.5 for linear, 1.5 for mass/volume)
  - Available indices per measurement
- [ ] **Data validation functions** and consistency checks
- [ ] **Fallback handling** for missing height indices

**Acceptance Criteria:**
- All Strom measurements accessible with type classification
- Reference population calculations match hand calculations
- Measurement metadata drives dynamic coefficient generation
- Data structure extensible for future studies
- Clear handling of missing/incomplete index data

### 1.2 Enhanced Formula Registry
**Priority:** Critical
**Estimated effort:** 2-3 hours  
**Files:**
- `src/utils/bodyComposition/bsaFormulas.ts`
- `src/utils/bodyComposition/lbmFormulas.ts`

**Tasks:**
- [ ] Expand BSA calculator registry (Du Bois, Mosteller, Haycock, etc.)
- [ ] Expand LBM calculator registry (Boer, Hume, Lee, Yu, etc.)
- [ ] Add formula metadata (year, validation notes, preferred populations)
- [ ] Create formula comparison utilities

**Acceptance Criteria:**
- All formulas produce expected results for reference subjects
- Registry easily extensible for new formulas
- Formula metadata available for user education

### 1.3 Dynamic Allometric Coefficient Engine (Dewey Method)
**Priority:** Critical (core innovation)
**Estimated effort:** 4-5 hours
**Files:**
- `src/utils/cardiacScaling/backCalculations.ts`
- `src/utils/cardiacScaling/universalCoefficients.ts`
- `src/utils/cardiacScaling/allometricGenerator.ts`

**Tasks:**
- [ ] **Measurement-Type Detection**: Classify as linear vs mass/volume
- [ ] **Multi-Index Back-Calculation**:
  - Linear: Average BSA + Height indices → absolute values
  - Mass/Volume: Average BSA + Height^1.6 indices → absolute values
- [ ] **Universal LBM Coefficient Derivation**:
  - Calculate male LBM coefficient (absolute ÷ LBM^exponent)
  - Calculate female LBM coefficient (absolute ÷ LBM^exponent)  
  - Average male + female → Universal LBM coefficient
- [ ] **Sex-Specific BSA Coefficient Generation**:
  - Linear: BSA^0.5 coefficients (remain sex-specific)
  - Mass/Volume: BSA^1.5 coefficients (remain sex-specific)
- [ ] **Validation Pipeline**: Test against multiple Strom measurements
- [ ] **Error handling** for missing height indices, edge cases

**Acceptance Criteria:**
- **Linear measurements**: Universal LBM^0.33 ≈ 1.166, Sex-specific BSA^0.5 ≈ 3.22 cm/m
- **Mass measurements**: Universal LBM^1.0, Sex-specific BSA^1.5 coefficients
- Robust across all Strom measurements (LVDd, IVSd, LVPW, LVM)
- Coefficient similarity validates universal biology hypothesis
- All calculations transparent and auditable

---

## Phase 2: Core Interactive Tool
**Goal:** Functional demonstration of scaling concepts

### 2.1 Dynamic Data Generation Pipeline  
**Priority:** High
**Estimated effort:** 3-4 hours
**Files:**
- `src/utils/dataGeneration/populationGenerator.ts`
- `src/utils/dataGeneration/measurementPredictor.ts`
- `src/utils/dataGeneration/allometricScaling.ts`

**Tasks:**
- [ ] **Population Generation**: Height range (120-220cm), BMI-driven weights
- [ ] **Body Composition Calculation**: BSA/LBM for entire population
- [ ] **Dynamic Allometric Prediction**:
  - Linear measurements: Universal LBM^0.33 + Sex-specific BSA^0.5
  - Mass measurements: Universal LBM^1.0 + Sex-specific BSA^1.5
- [ ] **Measurement-Specific Scaling**:
  - Auto-detect measurement type from metadata
  - Apply appropriate exponents (0.33/0.5 vs 1.0/1.5)
  - Generate predictions across population range
- [ ] **Validation Statistics**: Population means, coefficient verification
- [ ] **Transparency Features**: Show derived coefficients, calculation steps

**Acceptance Criteria:**
- Generates predictions for any Strom measurement dynamically
- Universal LBM coefficients consistent across population
- Sex-specific BSA coefficients account for body composition differences
- Population statistics match expected physiological ranges
- Clear distinction between linear vs mass measurement behaviors

### 2.2 Interactive Visualization Component
**Priority:** High (core demonstration)
**Estimated effort:** 4-5 hours
**Files:**
- `src/components/cardiacScaling/visualization/ScalingChart.tsx`
- `src/components/cardiacScaling/visualization/RatiometricLineGenerator.tsx`

**Tasks:**
- [ ] Fixed-axis chart (BSA: 0-3.5, LVDd: 0-8cm)
- [ ] Curved line rendering (LBM^0.33, BSA^0.5)
- [ ] Click-to-generate ratiometric lines from origin
- [ ] Real-time slope calculation and display
- [ ] Impossible prediction highlighting (>6cm LVDd)

**Acceptance Criteria:**
- Smooth curve rendering for both sexes
- Ratiometric lines accurately drawn from (0,0)
- Click interaction responsive and intuitive
- Visual warnings for implausible predictions
- Performance good for real-time updates

### 2.3 Tabbed Interface Structure
**Priority:** Medium
**Estimated effort:** 3-4 hours
**Files:**
- `src/components/cardiacScaling/InteractiveScalingTool.tsx`
- `src/components/cardiacScaling/tabs/DataPipelineTab.tsx`
- `src/components/cardiacScaling/tabs/CoefficientAnalysisTab.tsx`
- `src/components/cardiacScaling/tabs/InteractiveVisualizationTab.tsx`

**Tasks:**
- [ ] Clean tab navigation with progress indicators
- [ ] Data pipeline transparency (tables + statistics)
- [ ] Coefficient analysis breakdown
- [ ] Interactive plot with educational context
- [ ] Responsive mobile layout

**Acceptance Criteria:**
- All tabs functional and informative
- Smooth transitions between tabs
- Educational context clear for each phase
- Mobile-friendly interface

---

## Phase 3: Advanced Features
**Goal:** Comprehensive tool with multiple measurements and exploration

### 3.1 Multi-Measurement Support
**Priority:** Medium-High
**Estimated effort:** 3-4 hours
**Files:**
- `src/data/measurementDefinitions.ts`
- `src/utils/cardiacScaling/multiMeasurementCalculator.ts`

**Tasks:**
- [ ] IVSd, LVPW, LVM coefficient derivation
- [ ] Linear vs mass measurement handling (0.33 vs 1.0 exponents)
- [ ] Cross-measurement validation
- [ ] Measurement-specific visualization ranges

**Acceptance Criteria:**
- All Strom measurements supported
- Appropriate exponents for linear (0.33) vs mass (1.0)
- Consistent coefficient derivation across measurements
- Clear educational differences between measurement types

### 3.2 Interactive Allometric Explorer
**Priority:** High (game-changing feature)
**Estimated effort:** 4-6 hours
**Files:**
- `src/components/cardiacScaling/advanced/AllometricExplorer.tsx`
- `src/utils/cardiacScaling/curveFitting.ts`

**Tasks:**
- [ ] Real-time exponent adjustment (0.1 to 2.0)
- [ ] Scaling variable selection (BSA, LBM, Height)
- [ ] Live curve fitting to reference points
- [ ] R² and fit quality metrics
- [ ] Discovery mode for user exploration

**Acceptance Criteria:**
- Smooth real-time curve updates
- Clear demonstration of optimal exponents (0.33, 0.5)
- Poor fits obviously visible (straight lines, wrong curves)
- Educational value for scaling concept discovery
- Performance optimized for real-time interaction

### 3.3 Published Study Matcher
**Priority:** Medium
**Estimated effort:** 3-4 hours
**Files:**
- `src/components/cardiacScaling/advanced/PublishedStudyMatcher.tsx`
- `src/data/publishedStudies.ts`

**Tasks:**
- [ ] Database of published reference values
- [ ] Click-to-reproduce functionality
- [ ] Show how ratiometric lines match studies
- [ ] Population characteristics for each study
- [ ] Validation of our approach against literature

**Acceptance Criteria:**
- Reproduces at least 5 major published studies
- Clear demonstration of population sampling effects
- Educational value for literature interpretation
- Validates universal coefficient approach

---

## Phase 4: Clinical Integration
**Goal:** Practical clinical tools and educational resources

### 4.1 Clinical Scenario Generator
**Priority:** Medium
**Estimated effort:** 2-3 hours
**Files:**
- `src/components/cardiacScaling/clinical/ClinicalScenarios.tsx`
- `src/data/clinicalVignettes.ts`

**Tasks:**
- [ ] Pre-built patient scenarios (obese, tall, pediatric)
- [ ] Side-by-side scaling method comparison
- [ ] Clinical decision impact demonstration
- [ ] Educational narrative for each scenario

**Acceptance Criteria:**
- Compelling clinical cases that show scaling impact
- Clear demonstration of diagnostic differences
- Educational value for clinicians
- Easy to understand for non-experts

### 4.2 Downloadable Reports
**Priority:** Low-Medium
**Estimated effort:** 2-3 hours
**Files:**
- `src/components/cardiacScaling/reports/ReportGenerator.tsx`
- `src/utils/export/dataExporter.ts`

**Tasks:**
- [ ] PDF coefficient derivation reports
- [ ] CSV data export functionality
- [ ] Methodology documentation
- [ ] Citation-ready figures

**Acceptance Criteria:**
- Professional-quality PDF output
- Complete data transparency
- Suitable for research collaboration
- Methodology clearly documented

---

## Phase 5: Integration & Polish
**Goal:** Seamless integration with existing site and production readiness

### 5.1 Website Integration
**Priority:** High
**Estimated effort:** 2-3 hours
**Files:**
- `src/pages/cardiac-scaling/index.tsx`
- `src/pages/cardiac-scaling/interactive-tool.tsx`
- `src/pages/cardiac-scaling/methodology.tsx`

**Tasks:**
- [ ] Landing page with project overview
- [ ] Navigation integration
- [ ] SEO optimization
- [ ] Performance optimization

**Acceptance Criteria:**
- Seamless integration with existing site design
- Fast loading and smooth performance
- Good SEO for discoverability
- Clear value proposition on landing page

### 5.2 Testing & Validation
**Priority:** Critical
**Estimated effort:** 3-4 hours
**Files:**
- `src/tests/cardiacScaling/`
- `src/utils/validation/`

**Tasks:**
- [ ] Unit tests for all calculations
- [ ] Integration tests for UI components
- [ ] Validation against known datasets
- [ ] Performance benchmarks
- [ ] Cross-browser compatibility

**Acceptance Criteria:**
- 100% test coverage for calculation utilities
- All UI components tested
- Performance meets targets
- Compatible across modern browsers
- Validated against external datasets

---

## Critical Dependencies & Milestones

### Blocking Dependencies
1. **Strom Data → Everything** (Phase 1.1 blocks all subsequent work)
2. **Back-calculation Engine → Interactive Features** (Phase 1.3 required for Phase 2+)
3. **Basic Visualization → Advanced Features** (Phase 2.2 required for Phase 3+)

### Key Milestones
- **M1:** Foundation Complete (End of Phase 1) - Can calculate all coefficients
- **M2:** MVP Interactive Tool (End of Phase 2) - Can demonstrate core concepts
- **M3:** Full Feature Set (End of Phase 3) - Comprehensive exploration tool
- **M4:** Production Ready (End of Phase 5) - Polished, tested, integrated

### Risk Mitigation
- **Performance:** Optimize calculation loops early (Phase 2.1)
- **Complexity:** Keep UI simple initially, add features incrementally
- **Validation:** Test against hand calculations at each phase
- **User Experience:** Get feedback on Phase 2 before building Phase 3

---

## Success Metrics

### Technical Success
- [ ] Universal coefficient calculations validated (±1% accuracy)
- [ ] Interactive visualization performs smoothly (60fps)
- [ ] All major browsers supported
- [ ] Mobile responsive design

### Educational Success  
- [ ] Users can discover optimal exponents independently
- [ ] Ratiometric scaling flaws clearly demonstrated
- [ ] Clinical impact obvious through scenarios
- [ ] Literature validation compelling

### Scientific Impact
- [ ] Reproduces published studies accurately
- [ ] Provides new insights into scaling relationships
- [ ] Supports universal biology hypothesis
- [ ] Creates foundation for future research

---