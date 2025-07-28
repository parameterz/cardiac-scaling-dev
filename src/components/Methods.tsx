// src/components/Methods.tsx

import React from "react";

const Methods: React.FC = () => {
  return (
    <div>
      {/* Biological Rationale */}
      <section>
        <h3>Biological Foundation for Lean Body Mass Scaling</h3>

        <p>
          <blockquote>
            The cardiovascular system has evolved for effective distribution of
            metabolic substrates to tissue with high metabolic potential.
          </blockquote>
          <cite>Dewey et al., Circulation (2008)</cite>
        </p>
        <p>
          <strong>
            Lean body mass (LBM) represents the most biologically plausible
            scaling variable for cardiovascular parameters.
          </strong>{" "}
          Unlike total body weight or surface area, LBM reflects metabolically
          active tissue mass—the tissue that drives cardiac output demands and
          adaptive responses.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            margin: "2rem 0",
          }}
        >
          <div>
            <h4>Biological Rationale</h4>
            <ul>
              <li>Metabolically active tissue drives oxygen demand</li>
              <li>Cardiac output scales with metabolic requirements</li>
              <li>Heart size adapts to functional demands</li>
              <li>LBM excludes metabolically inert fat mass</li>
            </ul>
          </div>
          <div>
            <h4>Clinical Implementation</h4>
            <ul>
              <li>LBM estimated using validated prediction equations</li>
              <li>Comparable complexity to BSA calculation</li>
              <li>Multiple validated formulas available</li>
              <li>Can account for age, sex, and ethnicity variations</li>
            </ul>
          </div>
        </div>
      </section>

{/* Mathematical Framework */}
<section>
  <h3>Mathematical Framework: From Clinical Workflow to Geometric Constraints</h3>

  <h4>The Linear Equation Behind Ratiometric Indexing</h4>
  <p>
    Clinical practice uses ratiometric scaling (BSA indexing) extensively: "normal LV mass ≤ 95 g/m²" 
    or "normal LA volume ≤ 34 mL/m²." When applying these limits, clinicians multiply 
    the indexed value by patient BSA to determine absolute thresholds. This reveals 
    the underlying mathematical constraint: <code>y = m * x + b</code> where the y-intercept (b)
    is zero, forcing all measurements to scale as straight lines through the origin.
  </p>

  <h4>Ratiometric Scaling (Exponent = 1.0)</h4>
  <p>
    Simple division creates a linear relationship through the origin,
    geometrically appropriate when the measurement and scaling variable
    exist in the same dimensional space.
  </p>

  <blockquote>
    <p>
      <strong>
        Geometrically Appropriate Ratiometric Relationships:
      </strong>
    </p>
    <ul>
      <li>Linear measurements ÷ Height (both one-dimensional)</li>
      <li>Area measurements ÷ BSA (both two-dimensional)</li>
      <li>Mass/Volume measurements ÷ LBM (both three-dimensional)</li>
    </ul>
    <footer>
      Current clinical practice only correctly applies ratiometric BSA indexing to area
      measurements.
    </footer>
  </blockquote>

  <h4>Allometric Scaling (Exponent ≠ 1.0)</h4>
  <p>
    Power law relationships <code>y = a × x^b</code> transform scaling variables between
    dimensional spaces using theoretically-derived or empirically-determined exponents.
    This creates curves rather than straight lines, allowing measurements to follow 
    geometric principles.
  </p>

  <div style={{ overflowX: "auto", margin: "1.5rem 0" }}>
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
          <td>
            <strong>Linear (1D)</strong>
          </td>
          <td>
            LBM<sup>0.33</sup> (allometric)
          </td>
          <td>
            BSA<sup>0.5</sup> (allometric)
          </td>
          <td>
            Height<sup>1.0</sup> (ratiometric)
          </td>
        </tr>
        <tr>
          <td>
            <strong>Area (2D)</strong>
          </td>
          <td>
            LBM<sup>0.67</sup> (allometric)
          </td>
          <td>
            BSA<sup>1.0</sup> (ratiometric)
          </td>
          <td>
            Height<sup>2.0</sup> (allometric)
          </td>
        </tr>
        <tr>
          <td>
            <strong>Mass/Volume (3D)</strong>
          </td>
          <td>
            LBM<sup>1.0</sup> (ratiometric)
          </td>
          <td>
            BSA<sup>1.5</sup> (allometric)
          </td>
          <td>
            Height<sup>1.6-3.0</sup> (variable)
          </td>
        </tr>
      </tbody>
    </table>
  </div>


</section>

      {/* Dewey Methodology */}
      <section>
        <h3>Implementation of the Dewey Methodology</h3>

        <p>
          Inspired by their 2008 paper{" "}
          <a
            href="https://doi.org/10.1161/CIRCULATIONAHA.107.736785"
            target="_blank"
            rel="noopener noreferrer"
          >
            Does Size Matter? Clinical Applications of Scaling Cardiac Size and
            Function for Body Size
          </a>
          , the "Dewey methodology" provides a systematic approach for deriving
          and comparing scaling coefficients across different normalization
          strategies, enabling empirical testing of both geometric theory and
          biological hypotheses.
        </p>

        <h4>Methodological Steps</h4>
        <ol>
          <li>
            <strong>Reference Population Definition:</strong> Establish
            canonical populations (178cm male, 164cm female, BMI 24) as the
            coefficient derivation baseline
          </li>
          <li>
            <strong>Back-calculation:</strong> Convert published BSA-indexed
            reference values to absolute measurements using reference population
            characteristics
          </li>
          <li>
            <strong>Coefficient Derivation:</strong> Calculate scaling
            coefficients for alternative normalization approaches (LBM
            <sup>x</sup>, Height<sup>x</sup>, BSA<sup>x</sup>)
          </li>
          <li>
            <strong>Population Testing:</strong> Apply derived coefficients
            across physiological ranges
          </li>
          <li>
            Compare derived relationships with published data and theoretical
            predictions
          </li>
        </ol>

        <aside
          style={{
            borderLeft: "3px solid var(--pico-primary)",
            paddingLeft: "1rem",
            margin: "1.5rem 0",
            fontSize: "0.95rem",
          }}
        >
          <h4>Universal Biology Hypothesis</h4>
          <p>
            LBM-based scaling should produce nearly identical coefficients for
            males and females, reflecting universal biological relationships
            that transcend sex-specific body composition differences.
          </p>
        </aside>
      </section>

      {/* Height Exponent Analysis */}
      <section>
        <h3>Height Exponent Variability in Mass and Volume Measurements</h3>

        <p>
          For mass and volume measurements, geometric theory predicts Height
          <sup>3.0</sup> scaling, but empirical studies consistently report
          lower exponents. This analysis examines multiple height exponents
          documented in the cardiovascular literature.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            margin: "2rem 0",
          }}
        >
          <div
            style={{
              padding: "1rem",
              border: "1px solid var(--pico-border-color)",
              borderRadius: "var(--pico-border-radius)",
            }}
          >
            <h5>
              Height<sup>3.0</sup> - Theoretical
            </h5>
            <p>
              Pure geometric scaling for three-dimensional measurements based on
              similarity theory.
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              border: "1px solid var(--pico-border-color)",
              borderRadius: "var(--pico-border-radius)",
            }}
          >
            <h5>
              Height<sup>2.7</sup> - Empirical
            </h5>
            <p>
              Commonly reported in cardiac mass studies, representing deviation
              from pure geometric scaling.
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              border: "1px solid var(--pico-border-color)",
              borderRadius: "var(--pico-border-radius)",
            }}
          >
            <h5>
              Height<sup>1.6</sup> - Empirical
            </h5>
            <p>
              Alternative empirical exponent found in cardiovascular scaling
              literature.
            </p>
          </div>
        </div>

        <h4>Potential Explanations for Empirical Deviations</h4>
        <ul>
          <li>
            Cardiovascular structures do not scale with perfect geometric
            similarity
          </li>
          <li>Functional demands deviate from pure cube-law relationships</li>
          <li>
            Body composition effects (lean mass versus adipose tissue
            distribution)
          </li>
          <li>Physical conditioning and fitness adaptations</li>
          <li>Age-related changes and pathological influences</li>
        </ul>
      </section>

      {/* Data Sources */}
      <section>
        <h3>Primary Data Source</h3>

        <h4>Multi-Ethnic Study of Atherosclerosis</h4>
            <p style={{ marginBottom: "1rem" }}>
              Strom JB, Zhao Y, Farrell A, et al. Reference Values for Indexed
              Echocardiographic Chamber Sizes in Older Adults: The Multi-Ethnic
              Study of Atherosclerosis.
              <em>J Am Heart Assoc.</em> 2024;13:e034029.
              <a
                href="https://doi.org/10.1161/JAHA.124.034029"
                target="_blank"
                rel="noopener noreferrer"
              >
                doi:10.1161/JAHA.124.034029
              </a>
            </p>


        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            margin: "1.5rem 0",
          }}
        >
          <div>
            <h5>Study Characteristics</h5>
            <ul>
              <li>Sample size: 608 participants</li>
              <li>Population: Normal cardiac function</li>
              <li>Demographics: Multi-ethnic cohort</li>
              <li>Scope: Comprehensive echocardiographic measurements</li>
            </ul>
          </div>
          <div>
            <h5>Available Indexation Methods</h5>
            <ul>
              <li>
                Body surface area (current clinical standard)
                </li>
              <li>
                Body Mass Index (BMI) (not used in this analysis)
                </li>
              <li>
                Height<sup>1.0</sup> (ratiometric height scaling)
              </li>
              <li>
                Height<sup>1.6</sup> (empirical allometric scaling)
              </li>
              <li>
                Height<sup>2.7</sup> (empirical allometric scaling)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Complete References */}
      <section>
        <details>
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            Complete References
          </summary>

          <div style={{ marginTop: "1.5rem" }}>
            <h4>Primary Data Source</h4>
            <h4>Theoretical Framework</h4>
            <p style={{ marginBottom: "1rem" }}>
              Dewey FE, Rosenthal D, Murphy DJ Jr, Froelicher VF, Ashley EA.
              Does size matter? Clinical applications of scaling cardiac size
              and function for body size.
              <em>Circulation.</em> 2008;117:2279-2287.
              <a
                href="https://doi.org/10.1161/CIRCULATIONAHA.107.736785"
                target="_blank"
                rel="noopener noreferrer"
              >
                doi:10.1161/CIRCULATIONAHA.107.736785
              </a>
            </p>

            <p style={{ marginBottom: "1rem" }}>
              Gutgesell HP, Rembold CM. Growth of the human heart relative to
              body surface area.
              <em>Am J Cardiol.</em> 1990;65:662-668.
              <a
                href="https://doi.org/10.1016/0002-9149(90)91048-B"
                target="_blank"
                rel="noopener noreferrer"
              >
                doi:10.1016/0002-9149(90)91048-B
              </a>
            </p>

            <h4>Body Composition Methodology</h4>
            <p style={{ marginBottom: "1rem" }}>
              Boer P. Estimated lean body mass as an index for normalization of
              body fluid volumes in humans.
              <em>Am J Physiol.</em> 1984;247:F632-F636.
            </p>

            <p>
              Lee DH, Keum N, Hu FB, et al. Development and validation of
              anthropometric prediction equations for lean body mass, fat mass
              and percent fat in adults using the National Health and Nutrition
              Examination Survey (NHANES) 1999-2006.
              <em>Br J Nutr.</em> 2017;118:858-866.
            </p>
          </div>
        </details>
      </section>

      {/* Study Limitations */}
      <section>
        <h3>Study Limitations and Scope</h3>

        <p>
          This analysis is intended for educational and research purposes,
          demonstrating scaling methodology principles using published reference
          data. Clinical applications require independent validation and should
          not be based solely on this educational tool.
        </p>

      </section>
    </div>
  );
};

export default Methods;
