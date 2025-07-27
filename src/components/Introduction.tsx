// src/components/Introduction.tsx

import React from 'react';

const Introduction: React.FC = () => {
  return (
    <section>
      <article>
        <header>
          <h2>Cardiac Scaling Analysis: From Ratiometric to Allometric Approaches</h2>
        </header>

        <p>
          This laboratory explores the transition from traditional ratiometric scaling to 
          allometric relationships in cardiac measurements, based on the geometric principles 
          outlined in the "theory of similarity" and implemented through the Dewey methodology.
        </p>

        {/* Section 1: Mathematical Foundation */}
        <section className="transparency-panel">
          <header>
            <h3>Ratiometric vs. Allometric Scaling: Mathematical Foundation</h3>
          </header>
          
          <h4>Ratiometric Scaling = Linear Equation Through Origin</h4>
          <p>
            Current clinical practice uses <strong>ratiometric scaling</strong> - simple division by body surface area. 
            This creates a linear relationship that passes through the origin (zero-intercept).
          </p>
          
          <div className="insight-info">
            <h5>Example: LV Mass Indexing</h5>
            <p>If the upper limit of normal (ULN) for LV mass indexed to BSA is <strong>95 g/m²</strong>:</p>
            <div className="coefficient-display" style={{ textAlign: 'center', padding: '1rem', margin: '1rem 0' }}>
              LV Mass = 95 × BSA
            </div>
            <p>For someone with BSA = 2.0 m²: LV Mass = 95 × 2.0 = <strong>190 g</strong></p>
            <p>This is the equation of a line: <strong>y = mx</strong> where:</p>
            <ul style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <li>y = LV Mass (dependent variable)</li>
              <li>m = 95 (slope = indexed coefficient)</li>
              <li>x = BSA (independent variable)</li>
              <li>y-intercept = 0 (line passes through origin)</li>
            </ul>
          </div>

          <h4>Allometric Scaling = Power Law Relationship</h4>
          <p>
            <strong>Allometric scaling</strong> uses power law relationships that account for geometric 
            scaling principles from biology and physics.
          </p>
          
          <div className="coefficient-display" style={{ textAlign: 'center', padding: '1rem', margin: '1rem 0' }}>
            y = a × x<sup>b</sup>
          </div>
          <p>Where:</p>
          <ul style={{ fontSize: '0.9rem' }}>
            <li><strong>a</strong> = scaling coefficient (derived from reference data)</li>
            <li><strong>x</strong> = scaling variable (LBM, BSA, or Height)</li>
            <li><strong>b</strong> = scaling exponent (based on dimensionality: 0.33, 0.67, 1.0, 1.5, etc.)</li>
          </ul>

          <div className="insight-warning">
            <h5>The Critical Question</h5>
            <p>
              Ratiometric scaling assumes <strong>all cardiac measurements</strong> scale linearly with BSA 
              (exponent = 1.0). But should a 1-dimensional measurement like wall thickness really scale 
              the same way as a 3-dimensional measurement like ventricular mass?
            </p>
          </div>
        </section>

        {/* Section 2: Theory of Similarity */}
        <section className="insight-info">
          <header>
            <h3>Theory of Similarity: Geometric Foundation</h3>
          </header>
          
          <blockquote>
            <p>
              "[A] theoretical argument against indiscriminate use of ratiometric approaches 
              in cardiovascular scaling is drawn from the theory of similarity, which states 
              that relative geometries determine in part the relationships between body size variables. 
              For instance, the LV mass index, which scales a 3-dimensional variable (LV mass) to a 
              2-dimensional variable (BSA) via simple division, is incompatible with the geometric 
              relationship between the 2 variables. Because ventricular mass is related to the major 
              dimension raised to the third power, and BSA is related to the body major dimension 
              raised to the second power, LV mass should be proportional to [BSA]<sup>3/2</sup>."
            </p>
            <footer>
              <cite>
                — <a href="https://doi.org/10.1161/circulationaha.107.736785" target="_blank" rel="noopener noreferrer">
                  Dewey et al., Circulation (2008)
                </a>
              </cite>
            </footer>
          </blockquote>

          <h4>Expected Geometric Scaling Relationships</h4>
          <div className="chart-container">
            <table>
              <thead>
                <tr>
                  <th>Measurement Type</th>
                  <th>LBM Scaling</th>
                  <th>BSA Scaling</th>
                  <th>Height Scaling</th>
                  <th>Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Linear (1D)</strong></td>
                  <td>LBM<sup>0.33</sup> ≈ ∛LBM</td>
                  <td>BSA<sup>0.5</sup> = √BSA</td>
                  <td>Height<sup>1.0</sup> = Height</td>
                  <td>LV dimensions, wall thickness, vessel diameters</td>
                </tr>
                <tr>
                  <td><strong>Area (2D)</strong></td>
                  <td>LBM<sup>0.67</sup></td>
                  <td>BSA<sup>1.0</sup> = BSA</td>
                  <td>Height<sup>2.0</sup> = Height²</td>
                  <td>Chamber areas, valve areas</td>
                </tr>
                <tr>
                  <td><strong>Mass/Volume (3D)</strong></td>
                  <td>LBM<sup>1.0</sup> = LBM</td>
                  <td>BSA<sup>1.5</sup> </td>
                  <td>Height<sup>1.6-2.7</sup></td>
                  <td>LV mass, chamber volumes, stroke volume</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="insight-warning">
            <h4>The Ratiometric Problem</h4>
            <p>
              Traditional BSA indexing treats <strong>all</strong> measurements as BSA<sup>1.0</sup> 
              (simple division). This only makes geometric sense for <strong>area measurements</strong>. 
              For linear measurements, we should use √BSA, and for mass/volume 
              measurements, we should use BSA<sup>1.5</sup>.
            </p>
          </div>

          <h4>Mathematical Notation Guide</h4>
          <dl>
            <dt>BSA<sup>0.5</sup> = √BSA</dt>
            <dd>Square root of body surface area</dd>
            <dt>LBM<sup>0.33</sup> ≈ ∛LBM</dt>
            <dd>Cube root of lean body mass</dd>
            <dt>BSA<sup>1.5</sup></dt>
            <dd>BSA to the 1.5 power</dd>
            <dt>Height<sup>2.0</sup> = Height²</dt>
            <dd>Height squared</dd>
          </dl>
        </section>

        {/* Section 3: Dewey Methodology */}
        <section className="transparency-panel">
          <header>
            <h3>The Dewey Methodology: Systematic Coefficient Derivation</h3>
          </header>
          
          <p>
            Rather than guess at scaling relationships, we use a systematic approach to derive 
            coefficients from published reference data. This methodology provides transparency 
            and reproducibility in scaling analysis.
          </p>

          <h4>Step 1: Canonical Reference Populations</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <h5>Male Reference</h5>
              <dl>
                <dt>Height:</dt><dd>178 cm</dd>
                <dt>BMI:</dt><dd>24 kg/m² (healthy weight)</dd>
                <dt>Weight:</dt><dd>76.1 kg</dd>
              </dl>
            </div>
            <div className="metric-card">
              <h5>Female Reference</h5>
              <dl>
                <dt>Height:</dt><dd>164 cm</dd>
                <dt>BMI:</dt><dd>24 kg/m² (healthy weight)</dd>
                <dt>Weight:</dt><dd>64.6 kg</dd>
              </dl>
            </div>
          </div>
          
          <p>
            <strong>Why BMI 24?</strong> We use healthy-weight individuals to avoid confounding 
            effects of obesity or underweight conditions on cardiac scaling relationships.
          </p>

          <h4>Step 2: Body Composition Calculation</h4>
          <p>
            Using established formulas, we calculate BSA and lean body mass (LBM) for our 
            reference populations. Multiple formula options are available to test robustness.
          </p>

          <h4>Step 3: Back-Calculation of Absolute Values</h4>
          <div className="coefficient-display" style={{ textAlign: 'center', padding: '1rem', margin: '1rem 0' }}>
            Absolute Value = Indexed Value × Scaling Variable
          </div>
          <p>
            We reverse-engineer absolute measurements from published BSA-indexed reference values 
            (using Strom et al. MESA data) to determine what actual measurement our reference 
            individuals should have.
          </p>

          <h4>Step 4: Coefficient Derivation</h4>
          <div className="coefficient-display" style={{ textAlign: 'center', padding: '1rem', margin: '1rem 0' }}>
            Coefficient = Absolute Value ÷ (Scaling Variable)<sup>exponent</sup>
          </div>
          <p>
            We calculate scaling coefficients for different approaches (Height, BSA, LBM) using 
            the appropriate geometric exponents from the theory of similarity.
          </p>

          <h4>Step 5: Universal Testing</h4>
          <p>
            For LBM scaling, we test whether male and female coefficients converge to a universal 
            value, supporting the hypothesis that biological scaling relationships transcend sex 
            when properly normalized to body composition.
          </p>
        </section>

        {/* Section 4: Educational Scope & Limitations */}
        <section className="insight-warning">
          <header>
            <h3>Educational Scope & Important Limitations</h3>
          </header>
          
          <div className="insight-danger">
            <h4>Not for Clinical Use</h4>
            <p>
              This work is <strong>highly derivative</strong> and intended purely for educational 
              exploration of scaling principles. We are <strong>not proposing</strong> that these 
              coefficients be used clinically. All reference data comes from published literature 
              (Strom et al., MESA Study) and this analysis is exploratory in nature.
            </p>
          </div>

          <h4>What This Laboratory Demonstrates</h4>
          <ul>
            <li>
              <strong>Geometric Scaling Principles:</strong> How dimensional analysis affects 
              cardiac measurement relationships
            </li>
            <li>
              <strong>Methodological Transparency:</strong> Complete step-by-step coefficient 
              derivation using the Dewey approach
            </li>
            <li>
              <strong>Comparative Analysis:</strong> Traditional ratiometric vs. allometric 
              scaling approaches
            </li>
            <li>
              <strong>Formula Impact:</strong> How different BSA and LBM formulas affect 
              scaling relationships
            </li>
          </ul>

          <h4>Data Sources & Attribution</h4>
          <dl>
            <dt>Primary Data:</dt>
            <dd>
              <a href="https://doi.org/10.1161/JAHA.123.034029" target="_blank" rel="noopener noreferrer">
                Strom JB, et al. Reference Values for Indexed Echocardiographic Chamber Sizes 
                in Older Adults: The Multi-Ethnic Study of Atherosclerosis. J Am Heart Assoc. 2024;13:e034029.
              </a>
            </dd>
            <dt>Theoretical Framework:</dt>
            <dd>
              <a href="https://doi.org/10.1161/circulationaha.107.736785" target="_blank" rel="noopener noreferrer">
                Dewey FE, et al. Does size matter? Clinical applications of scaling cardiac size 
                and function for body size. Circulation. 2008;117:2279-2287.
              </a>
            </dd>
          </dl>

          <div className="insight-success">
            <h4>Ready to Explore?</h4>
            <p>
              Return to the interactive analysis tabs to see these principles in action. 
              You'll observe how different scaling approaches affect the apparent differences 
              between male and female cardiac measurements, and how universal biological 
              relationships emerge when proper scaling is applied.
            </p>
          </div>
        </section>

        <details>
          <summary>Additional Technical Details</summary>
          <div>
            <h4>Formula Options Available</h4>
            <div className="metrics-grid">
              <div className="metric-card">
                <h5>BSA Formulas</h5>
                <ul>
                  <li>Du Bois & Du Bois (1916) - Most cited</li>
                  <li>Mosteller (1987) - MESA default</li>
                  <li>Haycock et al. (1978) - Pediatric focus</li>
                  <li>Gehan & George (1970) - Cancer research</li>
                  <li>Boyd (1935) - Complex logarithmic</li>
                  <li>Dreyer (1915) - Weight-only</li>
                  <li>Livingston & Lee (2001) - Modern weight-based</li>
                </ul>
              </div>
              <div className="metric-card">
                <h5>LBM Formulas</h5>
                <ul>
                  <li>Boer (1984) - Most commonly used</li>
                  <li>Hume & Weyers (1971) - Classic</li>
                  <li>Yu et al. (2013) - Includes age and BMI</li>
                  <li>Lee et al. (2017) - Most comprehensive</li>
                  <li>Janmahasatian et al. (2005) - BMI-adjusted</li>
                  <li>Kuch (2001) - Fat-free mass</li>
                </ul>
              </div>
            </div>

            <h4>Height Exponent Mystery</h4>
            <p>
              For mass and volume measurements, pure geometric scaling would predict Height<sup>3.0</sup>, 
              but empirical studies consistently find exponents around 1.6-2.7. This suggests cardiac 
              scaling doesn't follow perfect geometric similarity.
            </p>

            <h4>Implementation Details</h4>
            <ul>
              <li>All calculations use 97.5 percentile reference values for upper normal limits</li>
              <li>Population curves generated across height range 120-220cm with fixed BMI</li>
              <li>BMI 24 reference standard ensures healthy-weight baseline</li>
              <li>Multiple formula options test robustness of scaling relationships</li>
            </ul>
          </div>
        </details>
      </article>
    </section>
  );
};

export default Introduction;