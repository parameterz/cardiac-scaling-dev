// src/components/Introduction.tsx

import React from 'react';

const Introduction: React.FC = () => {
  return (
    <section>
      <article>
        <header>
          <h2>🔬 Cardiac Scaling Analysis: From Ratiometric to Allometric</h2>
        </header>

        <p>
          This laboratory explores the transition from traditional ratiometric scaling to 
          allometric relationships in cardiac measurements, based on the geometric principles 
          outlined in the "theory of similarity" and implemented through the Dewey methodology.
        </p>

        {/* Section 1: Mathematical Foundation - UPDATED */}
        <section className="transparency-panel">
          <header>
            <h3>📊 Ratiometric vs. Allometric Scaling: Mathematical Foundation</h3>
          </header>
          
          <h4>Ratiometric Scaling = Linear Relationship (Allometric Exponent 1.0)</h4>
          <p>
            <strong>Ratiometric scaling</strong> is simply division by a scaling variable, creating 
            a linear relationship through the origin. Mathematically, this is equivalent to 
            <strong>allometric scaling with exponent 1.0</strong>.
          </p>
          
          <div className="insight-info">
            <h5>📝 Mathematical Equivalence</h5>
            <div className="coefficient-display" style={{ textAlign: 'center', padding: '1rem', margin: '1rem 0' }}>
              Ratiometric: y = (measurement/BSA) × BSA = coefficient × BSA<sup>1.0</sup>
            </div>
            <div className="coefficient-display" style={{ textAlign: 'center', padding: '1rem', margin: '1rem 0' }}>
              Allometric: y = coefficient × BSA<sup>exponent</sup>
            </div>
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
              When exponent = 1.0: Allometric = Ratiometric
            </p>
          </div>

          <h4>When is Ratiometric Scaling Geometrically Appropriate?</h4>
          <p>
            Ratiometric scaling (exponent = 1.0) is <strong>geometrically correct</strong> when the 
            measurement and scaling variable exist in the same dimensional space:
          </p>
          
          <div className="chart-container">
            <table>
              <thead>
                <tr>
                  <th>Measurement Type</th>
                  <th>Geometric Space</th>
                  <th>Appropriate Ratiometric Scaling</th>
                  <th>Why It Works</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Linear (1D)</strong></td>
                  <td>One dimension</td>
                  <td>Height (1D scaling variable)</td>
                  <td>Both are 1D - direct proportional relationship</td>
                </tr>
                <tr style={{ backgroundColor: 'var(--pico-ins-color)', opacity: 0.1 }}>
                  <td><strong>Area (2D)</strong></td>
                  <td>Two dimensions</td>
                  <td>BSA (2D scaling variable)</td>
                  <td>Both are 2D - BSA is literally surface area</td>
                </tr>
                <tr>
                  <td><strong>Mass/Volume (3D)</strong></td>
                  <td>Three dimensions</td>
                  <td>LBM (3D/mass scaling variable)</td>
                  <td>Both represent 3D space/tissue mass</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4>Allometric Scaling = Geometric Transformation</h4>
          <p>
            <strong>Allometric scaling</strong> uses exponents ≠ 1.0 to transform a scaling variable 
            from one dimensional space to match the measurement's dimensional space.
          </p>
          
          <div className="insight-warning">
            <h5>🔧 Dimensional Transformation Examples</h5>
            <ul>
              <li><strong>BSA^0.5</strong> transforms 2D surface area → 1D linear dimension</li>
              <li><strong>Height^2.0</strong> transforms 1D height → 2D area space</li>
              <li><strong>LBM^0.33</strong> transforms 3D mass → 1D linear dimension</li>
              <li><strong>BSA^1.5</strong> transforms 2D surface area → 3D volume space</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Updated Theory of Similarity */}
        <section className="insight-info">
          <header>
            <h3>📐 Theory of Similarity: Geometric Foundation</h3>
          </header>
          
          <blockquote>
            <p>
              "[A] theoretical argument against indiscriminate use of ratiometric approaches 
              in cardiovascular scaling is drawn from the theory of similarity, which states 
              that relative geometries determine in part the relationships between body size variables..."
            </p>
            <footer>
              <cite>
                — <a href="https://doi.org/10.1161/circulationaha.107.736785" target="_blank" rel="noopener noreferrer">
                  Dewey et al., Circulation (2008)
                </a>
              </cite>
            </footer>
          </blockquote>

          <h4>Complete Scaling Relationships (Including When Ratiometric is Appropriate)</h4>
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
                  <td>LBM<sup>0.33</sup></td>
                  <td>BSA<sup>0.5</sup></td>
                  <td>Height<sup>1.0</sup> <span style={{ color: 'var(--cardiac-success)' }}>(ratiometric ✓)</span></td>
                  <td>LV dimensions, wall thickness</td>
                </tr>
                <tr style={{ backgroundColor: 'var(--pico-ins-color)', opacity: 0.1 }}>
                  <td><strong>Area (2D)</strong></td>
                  <td>LBM<sup>0.67</sup></td>
                  <td>BSA<sup>1.0</sup> <span style={{ color: 'var(--cardiac-success)' }}>(ratiometric ✓)</span></td>
                  <td>Height<sup>2.0</sup></td>
                  <td>Chamber areas, valve areas</td>
                </tr>
                <tr>
                  <td><strong>Mass/Volume (3D)</strong></td>
                  <td>LBM<sup>1.0</sup> <span style={{ color: 'var(--cardiac-success)' }}>(ratiometric ✓)</span></td>
                  <td>BSA<sup>1.5</sup></td>
                  <td>Height<sup>1.6-2.7</sup> <small>(empirical)</small></td>
                  <td>LV mass, chamber volumes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="insight-success">
            <h4>✅ Key Insight: Three Geometrically Correct Ratiometric Relationships</h4>
            <ul>
              <li><strong>Linear measurements ÷ Height</strong> - Both are 1D</li>
              <li><strong>Area measurements ÷ BSA</strong> - Both are 2D (current clinical standard gets this right!)</li>
              <li><strong>Mass/Volume measurements ÷ LBM</strong> - Both are 3D</li>
            </ul>
          </div>

          <div className="insight-warning">
            <h4>⚠️ The Clinical Problem</h4>
            <p>
              Current practice uses <strong>BSA ratiometric scaling for ALL measurements</strong>, 
              which is only geometrically correct for area measurements. For linear measurements, 
              we should use Height ratiometric scaling or BSA^0.5. For mass/volume measurements, 
              we should use LBM ratiometric scaling or BSA^1.5.
            </p>
          </div>
        </section>

        {/* Section 3: Updated Dewey Methodology */}
        <section className="transparency-panel">
          <header>
            <h3>🧮 The Dewey Methodology: From Geometric Theory to Clinical Coefficients</h3>
          </header>
          
          <p>
            The Dewey methodology systematically derives scaling coefficients using geometric 
            principles, testing both when ratiometric scaling is appropriate and when allometric 
            transformation is needed.
          </p>

          <h4>Scaling Variable Selection Strategy</h4>
          <div className="metrics-grid">
            <div className="metric-card">
              <h5>Option 1: Match Dimensionality (Ratiometric)</h5>
              <ul>
                <li>Linear → Height (both 1D)</li>
                <li>Area → BSA (both 2D)</li>
                <li>Mass/Volume → LBM (both 3D)</li>
              </ul>
              <p><strong>Advantage:</strong> Geometrically intuitive</p>
            </div>
            <div className="metric-card">
              <h5>Option 2: Transform Dimensionality (Allometric)</h5>
              <ul>
                <li>Linear → BSA^0.5 or LBM^0.33</li>
                <li>Area → Height^2.0 or LBM^0.67</li>
                <li>Mass/Volume → BSA^1.5 or Height^1.6-2.7</li>
              </ul>
              <p><strong>Advantage:</strong> Standardized scaling variable</p>
            </div>
          </div>

          <h4>Universal Biological Hypothesis</h4>
          <p>
            Our analysis tests whether <strong>LBM-based scaling produces universal coefficients</strong> 
            across sexes, regardless of whether we use ratiometric LBM scaling (for mass/volume) 
            or allometric LBM transformation (for linear/area measurements).
          </p>
        </section>

        {/* Section 4: Educational Scope - Updated */}
        <section className="insight-warning">
          <header>
            <h3>⚖️ Educational Scope & Important Terminology</h3>
          </header>
          
          <div className="insight-success">
            <h4>🎯 Clarified Terminology</h4>
            <dl>
              <dt><strong>Ratiometric Scaling:</strong></dt>
              <dd>Simple division (coefficient × variable^1.0). Geometrically appropriate when measurement and scaling variable have same dimensionality.</dd>
              
              <dt><strong>Allometric Scaling:</strong></dt>
              <dd>Power law relationships (coefficient × variable^exponent) where exponent ≠ 1.0. Used to transform scaling variables between dimensional spaces.</dd>
              
              <dt><strong>Geometric Scaling:</strong></dt>
              <dd>Using theoretical geometric relationships to determine exponents (e.g., Height^2.0 for areas, Height^3.0 for volumes).</dd>
              
              <dt><strong>Empirical Scaling:</strong></dt>
              <dd>Using data-derived exponents that may deviate from pure geometric theory (e.g., Height^1.6 or Height^2.7 for cardiac mass).</dd>
            </dl>
          </div>

          <div className="insight-danger">
            <h4>🚨 Not for Clinical Use</h4>
            <p>
              This work is <strong>highly derivative</strong> and intended purely for educational 
              exploration of scaling principles. We demonstrate that ratiometric scaling can be 
              geometrically appropriate when properly applied, while current clinical practice 
              may overcorrect by using BSA ratiometric scaling for non-area measurements.
            </p>
          </div>

          <div className="insight-info">
            <h4>🔍 What You'll Discover</h4>
            <ul>
              <li><strong>Area measurements:</strong> Current BSA indexing is geometrically correct</li>
              <li><strong>Linear measurements:</strong> Height ratiometric or BSA^0.5 may be more appropriate</li>
              <li><strong>Mass/Volume measurements:</strong> LBM ratiometric or BSA^1.5 may be more appropriate</li>
              <li><strong>Universal biology:</strong> LBM scaling shows remarkable sex similarity across all measurement types</li>
            </ul>
          </div>
        </section>

        <details>
          <summary>🔍 Mathematical Examples of Scaling Transformations</summary>
          <div>
            <h4>How Allometric Exponents Transform Dimensional Spaces</h4>
            <div className="metrics-grid">
              <div className="metric-card">
                <h5>BSA^0.5 for Linear Measurements</h5>
                <p><strong>Problem:</strong> LV wall thickness (1D) vs BSA (2D)</p>
                <p><strong>Solution:</strong> √BSA transforms 2D → 1D space</p>
                <code>Thickness = coefficient × √BSA</code>
              </div>
              
              <div className="metric-card">
                <h5>Height^2.0 for Area Measurements</h5>
                <p><strong>Problem:</strong> LA area (2D) vs Height (1D)</p>
                <p><strong>Solution:</strong> Height² transforms 1D → 2D space</p>
                <code>Area = coefficient × Height²</code>
              </div>
              
              <div className="metric-card">
                <h5>LBM^0.33 for Linear Measurements</h5>
                <p><strong>Problem:</strong> LV diameter (1D) vs LBM (3D)</p>
                <p><strong>Solution:</strong> ∛LBM transforms 3D → 1D space</p>
                <code>Diameter = coefficient × ∛LBM</code>
              </div>
              
              <div className="metric-card">
                <h5>BSA^1.5 for Volume Measurements</h5>
                <p><strong>Problem:</strong> LV volume (3D) vs BSA (2D)</p>
                <p><strong>Solution:</strong> BSA^1.5 transforms 2D → 3D space</p>
                <code>Volume = coefficient × BSA^1.5</code>
              </div>
            </div>
            
            <div className="insight-success">
              <h4>The Elegant Solution</h4>
              <p>
                Rather than memorizing different formulas, we can use <strong>one scaling variable (LBM)</strong> 
                with appropriate geometric exponents, or match dimensional spaces with ratiometric scaling. 
                Both approaches respect the underlying geometric relationships.
              </p>
            </div>
          </div>
        </details>
      </article>
    </section>
  );
};

export default Introduction;