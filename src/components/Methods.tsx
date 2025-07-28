// src/components/Methods.tsx

import React from 'react';

const Methods: React.FC = () => {
  return (
    <div>
      {/* Header */}
      <header>
        <h2>🔬 Scaling Theory & Methodology</h2>
        <p>
          Deep dive into the mathematical foundations, biological rationale, and systematic 
          approach underlying this cardiac scaling analysis.
        </p>
      </header>

      {/* Scientific Rationale */}
      <section className="insight-success">
        <header>
          <h3>🧬 Biological Foundation</h3>
        </header>
        
        <p>
          <strong>Lean Body Mass (LBM) represents the most biologically plausible driver for cardiovascular scaling.</strong> 
          Unlike total body weight or surface area, LBM reflects metabolically active tissue mass - 
          the tissue that actually demands cardiac output and drives cardiac adaptation.
        </p>

        <div className="metrics-grid">
          <div>
            <h4>Why LBM Makes Biological Sense</h4>
            <ul>
              <li>Metabolically active tissue drives oxygen demand</li>
              <li>Cardiac output scales with metabolic demand</li>
              <li>Heart size adapts to functional requirements</li>
              <li>LBM excludes metabolically inert fat mass</li>
            </ul>
          </div>
          <div>
            <h4>Practical Implementation</h4>
            <ul>
              <li>LBM estimated using prediction equations</li>
              <li>Same approach as BSA calculation</li>
              <li>Multiple validated formulas available</li>
              <li>Accounts for age, sex, ethnicity variations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mathematical Framework */}
      <section className="transparency-panel">
        <header>
          <h3>📐 Mathematical Framework: Ratiometric vs. Allometric</h3>
        </header>
        
        <h4>Ratiometric Scaling (Exponent = 1.0)</h4>
        <p>
          <strong>Simple division</strong> creates a linear relationship through the origin. 
          Geometrically appropriate when measurement and scaling variable exist in the same dimensional space.
        </p>
        
        <div className="insight-success">
          <h5>✅ Geometrically Appropriate Ratiometric Relationships</h5>
          <ul>
            <li><strong>Linear measurements ÷ Height</strong> (both 1D)</li>
            <li><strong>Area measurements ÷ BSA</strong> (both 2D) - Current practice is correct!</li>
            <li><strong>Mass/Volume measurements ÷ LBM</strong> (both 3D)</li>
          </ul>
        </div>

        <h4>Allometric Scaling (Exponent ≠ 1.0)</h4>
        <p>
          <strong>Power law relationships</strong> transform scaling variables between dimensional spaces 
          using theoretically-derived or empirically-determined exponents.
        </p>

        <div className="chart-container">
          <table>
            <thead>
              <tr>
                <th>Measurement Type</th>
                <th>LBM Scaling</th>
                <th>BSA Scaling</th>
                <th>Height Scaling</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Linear (1D)</strong></td>
                <td>LBM<sup>0.33</sup> (allometric)</td>
                <td>BSA<sup>0.5</sup> (allometric)</td>
                <td>Height<sup>1.0</sup> (ratiometric ✓)</td>
              </tr>
              <tr style={{ backgroundColor: 'var(--pico-ins-color)', opacity: 0.1 }}>
                <td><strong>Area (2D)</strong></td>
                <td>LBM<sup>0.67</sup> (allometric)</td>
                <td>BSA<sup>1.0</sup> (ratiometric ✓)</td>
                <td>Height<sup>2.0</sup> (allometric)</td>
              </tr>
              <tr>
                <td><strong>Mass/Volume (3D)</strong></td>
                <td>LBM<sup>1.0</sup> (ratiometric ✓)</td>
                <td>BSA<sup>1.5</sup> (allometric)</td>
                <td>Height<sup>1.6-3.0</sup> (empirical/theoretical)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* The Dewey Methodology */}
      <section className="insight-info">
        <header>
          <h3>🧮 The Dewey Methodology</h3>
        </header>
        
        <p>
          The Dewey methodology provides a systematic approach to derive and compare scaling coefficients 
          across different approaches, testing both geometric theory and biological hypotheses.
        </p>

        <h4>Step-by-Step Process</h4>
        <ol>
          <li>
            <strong>Reference Population Definition:</strong> Use canonical populations 
            (178cm♂, 164cm♀, BMI 24) as coefficient derivation baseline
          </li>
          <li>
            <strong>Back-calculation:</strong> Convert published BSA-indexed values to absolute measurements 
            using reference population characteristics
          </li>
          <li>
            <strong>Coefficient Derivation:</strong> Calculate scaling coefficients for alternative approaches 
            (LBM^x, Height^x, BSA^x)
          </li>
          <li>
            <strong>Population Testing:</strong> Apply coefficients across physiological ranges 
            (height 120-220cm, BMI 16-45)
          </li>
          <li>
            <strong>Validation:</strong> Compare derived relationships with published data and 
            geometric/biological predictions
          </li>
        </ol>

        <div className="insight-warning">
          <h4>🔍 Key Hypothesis Testing</h4>
          <p>
            <strong>Universal Biology Hypothesis:</strong> LBM-based scaling should produce nearly identical 
            coefficients for males and females, reflecting universal biological relationships independent 
            of sex-specific body composition differences.
          </p>
        </div>
      </section>

      {/* Height Exponent Mystery */}
      <section className="transparency-panel">
        <header>
          <h3>🤔 The Height Exponent Mystery</h3>
        </header>
        
        <p>
          For mass and volume measurements, pure geometric theory predicts Height<sup>3.0</sup> scaling, 
          but empirical studies consistently find lower exponents. This analysis explores multiple 
          height exponents found in the literature.
        </p>

        <div className="metrics-grid">
          <div className="metric-card">
            <h5>Height<sup>3.0</sup> - Theoretical</h5>
            <p>Pure geometric scaling for 3D measurements</p>
            <p><strong>Prediction:</strong> Perfect cube-law scaling</p>
          </div>
          <div className="metric-card">
            <h5>Height<sup>2.7</sup> - Empirical</h5>
            <p>Commonly found in cardiac mass studies</p>
            <p><strong>Reality:</strong> Deviation from pure geometry</p>
          </div>
          <div className="metric-card">
            <h5>Height<sup>1.6</sup> - Empirical</h5>
            <p>Alternative exponent from literature</p>
            <p><strong>Question:</strong> Optimal empirical scaling?</p>
          </div>
        </div>

        <div className="insight-info">
          <h4>Biological Explanations for Deviation</h4>
          <ul>
            <li>Hearts don't scale with perfect geometric similarity</li>
            <li>Functional demands don't follow pure cube-law</li>
            <li>Body composition effects (fat vs. muscle)</li>
            <li>Fitness and conditioning adaptations</li>
            <li>Age and pathology influences</li>
          </ul>
        </div>
      </section>

      {/* Data Sources */}
      <section className="insight-success">
        <header>
          <h3>📊 Data Sources & Validation</h3>
        </header>
        
        <h4>Primary Data: MESA Study</h4>
        <p>
          The Multi-Ethnic Study of Atherosclerosis provides comprehensive cardiac measurements with 
          multiple indexation approaches, allowing direct comparison of scaling methodologies.
        </p>

        <div className="metrics-grid">
          <div>
            <h5>Study Characteristics</h5>
            <ul>
              <li>Large, diverse population (N=608)</li>
              <li>Normal cardiac participants</li>
              <li>Multiple ethnic groups</li>
              <li>Comprehensive measurements</li>
            </ul>
          </div>
          <div>
            <h5>Indexation Methods Provided</h5>
            <ul>
              <li>BSA (current standard)</li>
              <li>Height^1.0</li>
              <li>Height^1.6 (empirical)</li>
              <li>Height^2.7 (empirical)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Citations */}
      <section>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            📚 Complete References
          </summary>
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--pico-code-background-color)', borderRadius: 'var(--pico-border-radius)' }}>
            <h4>Primary Data Source</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Strom JB, Zhao Y, Farrell A, et al.</strong> Reference Values for Indexed Echocardiographic 
              Chamber Sizes in Older Adults: The Multi-Ethnic Study of Atherosclerosis. 
              <em>J Am Heart Assoc.</em> 2024;13:e034029. 
              <a href="https://doi.org/10.1161/JAHA.124.034029" target="_blank" rel="noopener noreferrer">
                doi:10.1161/JAHA.124.034029
              </a>
            </p>

            <h4>Scaling Theory & Methodology</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Dewey FE, Rosenthal D, Murphy DJ Jr, Froelicher VF, Ashley EA.</strong> Does size matter? 
              Clinical applications of scaling cardiac size and function for body size. 
              <em>Circulation.</em> 2008;117:2279-2287. 
              <a href="https://doi.org/10.1161/CIRCULATIONAHA.107.736785" target="_blank" rel="noopener noreferrer">
                doi:10.1161/CIRCULATIONAHA.107.736785
              </a>
            </p>

            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Gutgesell HP, Rembold CM.</strong> Growth of the human heart relative to body surface area. 
              <em>Am J Cardiol.</em> 1990;65:662-668. 
              <a href="https://doi.org/10.1016/0002-9149(90)91048-B" target="_blank" rel="noopener noreferrer">
                doi:10.1016/0002-9149(90)91048-B
              </a>
            </p>

            <h4>Body Composition Formulas</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong>Boer P.</strong> Estimated lean body mass as an index for normalization of body fluid volumes in humans. 
              <em>Am J Physiol.</em> 1984;247:F632-F636.
            </p>

            <p style={{ fontSize: '0.9rem' }}>
              <strong>Lee DH, Keum N, Hu FB, et al.</strong> Development and validation of anthropometric prediction 
              equations for lean body mass, fat mass and percent fat in adults using the National Health and 
              Nutrition Examination Survey (NHANES) 1999-2006. 
              <em>Br J Nutr.</em> 2017;118:858-866.
            </p>
          </div>
        </details>
      </section>

      {/* Important Disclaimers */}
      <section className="insight-danger">
        <h3>⚠️ Educational Scope & Limitations</h3>
        <div className="metrics-grid">
          <div>
            <h4>🚨 Not for Clinical Use</h4>
            <p>
              This tool is for <strong>educational exploration only</strong>. All data is derivative 
              from published literature. Do not use for patient care or clinical decisions.
            </p>
          </div>
          <div>
            <h4>📚 Research & Learning</h4>
            <p>
              This analysis demonstrates scaling principles and methodological approaches. 
              Results should inform understanding of scaling theory, not clinical practice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Methods;