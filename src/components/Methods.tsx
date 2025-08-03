// src/components/Methods.tsx

import React from "react";

const Methods: React.FC = () => {
  return (
    <div>
      {/* Mathematical Framework - LEAD WITH THE PROBLEM */}
      <section>
        <h3>
          Mathematical Framework
        </h3>

        <h4>The Dimensional Mismatch Problem</h4>
        <p>
          Simple division creates a linear relationship through the origin,
          which is only geometrically appropriate when the measurement and
          scaling variable exist in the same dimensional space.{" "}
          <strong>
            Current clinical practice violates this fundamental principle by
            applying BSA ratiometric scaling to all cardiac measurements
            regardless of their dimensional characteristics.
          </strong>
        </p>

        <div
          style={{
            background: "var(--pico-code-background-color)",
            padding: "1rem",
            borderRadius: "var(--pico-border-radius)",
            margin: "1rem 0",
          }}
        >
          <h5>Geometric Violations in Current Practice:</h5>
          <ul>
            <li>
              <strong>Linear measurements ÷ BSA:</strong> 1D ÷ 2D = dimensional
              mismatch
            </li>
            <li>
              <strong>Mass measurements ÷ BSA:</strong> 3D ÷ 2D = dimensional
              mismatch
            </li>
            <li>
              <strong>Volume measurements ÷ BSA:</strong> 3D ÷ 2D = dimensional
              mismatch
            </li>
          </ul>
          <p
            style={{
              margin: "0.5rem 0 0 0",
              fontSize: "0.9rem",
              fontStyle: "italic",
            }}
          >
            Only area measurements ÷ BSA (2D ÷ 2D) are geometrically consistent.
          </p>
        </div>

        <h4>Clinical Workflow Constraints</h4>
        <p>
          Clinical practice implements ratiometric scaling through indexed
          reference limits: "normal LV mass ≤ 95 g/m²" or "normal LA volume ≤ 34
          mL/m²." When applying these limits, clinicians multiply the indexed
          value by patient BSA to determine absolute thresholds. This workflow
          creates a mathematical constraint where all measurements must scale as
          straight lines through the origin (<code>y = m × x</code>), regardless
          of their dimensional characteristics or biological scaling
          relationships.
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
            Current clinical practice only correctly applies ratiometric BSA
            indexing to area measurements.
          </footer>
        </blockquote>

        <h4>Allometric Scaling (Exponent ≠ 1.0)</h4>
        <p>
          Power law relationships <code>y = a × x^b</code> transform scaling
          variables between dimensional spaces using theoretically-derived or
          empirically-determined exponents. This creates curves rather than
          straight lines, allowing measurements to follow geometric principles.
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
        <h3>Implementation of the "Dewey Methodology"</h3>

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
            <strong>Population Comparison:</strong> Apply derived coefficients
            across physiological ranges
          </li>
        </ol>

        <p>
          Body composition calculations (BSA and LBM) utilize validated
          prediction equations with different derivation populations and
          methodological approaches. Formula selection can influence the
          magnitude of derived scaling coefficients, though the relative
          relationships between scaling approaches typically remain consistent.
          Multiple formula options are provided to test the robustness of
          scaling relationships across different calculation methods.
        </p>
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
            href="https://doi.org/10.1161/JAHA.123.034029"
            target="_blank"
            rel="noopener noreferrer"
          >
            doi:10.1161/JAHA.123.034029
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
              <li>Body surface area (current clinical standard)</li>
              <li>Body Mass Index (BMI) (not used in this analysis)</li>
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

            <h5>Body Surface Area Formulas</h5>
            <p style={{ marginBottom: "0.5rem" }}>
              Most of the BSA equations used here can be found in the manuscript
              by Redlarski et al., Body surface area formulae: an alarming
              ambiguity.{" "}
              <em>Sci Rep.</em> 2016 Jun 21;6:27966.{" "}
              <a
                href="https://doi.org/10.1038/srep27966"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}doi: 10.1038/srep27966.
              </a>
            </p>
<h5>Lean Body Mass Formulas</h5>
<p >
  Because LBM equations are used less commonly in clinical cardiology practice, 
  complete citations are provided for reference.
</p>

<div style={{ 
  fontSize: '0.9rem', 
  lineHeight: '1.5',
  marginBottom: '1.5rem'
}}>
  <p style={{ marginBottom: '1rem' }}>
    <strong>Boer P.</strong> Estimated lean body mass as an index for normalization of 
    body fluid volumes in humans. <em>Am J Physiol.</em> 1984;247(4 Pt 2):F632-6. 
    <a href="https://doi.org/10.1152/ajprenal.1984.247.4.F632" target="_blank" rel="noopener noreferrer">
      doi:10.1152/ajprenal.1984.247.4.F632
    </a>. 
    <a href="https://pubmed.ncbi.nlm.nih.gov/6496691" target="_blank" rel="noopener noreferrer">
      PMID: 6496691
    </a>.
  </p>

  <p style={{ marginBottom: '1rem' }}>
    <strong>Hume R.</strong> Prediction of lean body mass from height and weight. 
    <em>J Clin Pathol.</em> 1966;19(4):389-91. 
    <a href="https://doi.org/10.1136/jcp.19.4.389" target="_blank" rel="noopener noreferrer">
      doi:10.1136/jcp.19.4.389
    </a>. 
    <a href="https://pubmed.ncbi.nlm.nih.gov/5929341" target="_blank" rel="noopener noreferrer">
      PMID: 5929341
    </a>; PMCID: PMC473290.
  </p>

  <p style={{ marginBottom: '1rem' }}>
    <strong>Hume R, Weyers E.</strong> Relationship between total body water and surface area 
    in normal and obese subjects. <em>J Clin Pathol.</em> 1971;24(3):234-8. 
    <a href="https://doi.org/10.1136/jcp.24.3.234" target="_blank" rel="noopener noreferrer">
      doi:10.1136/jcp.24.3.234
    </a>. 
    <a href="https://pubmed.ncbi.nlm.nih.gov/5573437" target="_blank" rel="noopener noreferrer">
      PMID: 5573437
    </a>; PMCID: PMC476961.
  </p>

  <p style={{ marginBottom: '1rem' }}>
    <strong>Janmahasatian S, Duffull SB, Ash S, Ward LC, Byrne NM, Green B.</strong> 
    Quantification of lean bodyweight. <em>Clin Pharmacokinet.</em> 2005;44(10):1051-65. 
    <a href="https://doi.org/10.2165/00003088-200544100-00004" target="_blank" rel="noopener noreferrer">
      doi:10.2165/00003088-200544100-00004
    </a>. 
    <a href="https://pubmed.ncbi.nlm.nih.gov/16176118" target="_blank" rel="noopener noreferrer">
      PMID: 16176118
    </a>.
  </p>

  <p style={{ marginBottom: '1rem' }}>
    <strong>Kuch B, Gneiting B, Döring A, Muscholl M, Bröckel U, Schunkert H, Hense HW.</strong> 
    Indexation of left ventricular mass in adults with a novel approximation for fat-free mass. 
    <em>J Hypertens.</em> 2001;19(1):135-42. 
    <a href="https://doi.org/10.1097/00004872-200101000-00018" target="_blank" rel="noopener noreferrer">
      doi:10.1097/00004872-200101000-00018
    </a>. 
    <a href="https://pubmed.ncbi.nlm.nih.gov/11204294" target="_blank" rel="noopener noreferrer">
      PMID: 11204294
    </a>.
  </p>

  <p style={{ marginBottom: '1rem' }}>
    <strong>Lee DH, Keum N, Hu FB, Orav EJ, Rimm EB, Sun Q, Willett WC, Giovannucci EL.</strong> 
    Development and validation of anthropometric prediction equations for lean body mass, fat mass 
    and percent fat in adults using the National Health and Nutrition Examination Survey (NHANES) 
    1999-2006. <em>Br J Nutr.</em> 2017;118(10):858-866. 
    <a href="https://doi.org/10.1017/S0007114517002665" target="_blank" rel="noopener noreferrer">
      doi:10.1017/S0007114517002665
    </a>. 
    <a href="https://pubmed.ncbi.nlm.nih.gov/29110742" target="_blank" rel="noopener noreferrer">
      PMID: 29110742
    </a>.
  </p>

  <p style={{ marginBottom: '1rem' }}>
    <strong>Yu S, Visvanathan T, Field J, Ward LC, Chapman I, Adams R, Wittert G, Visvanathan R.</strong> 
    Lean body mass: the development and validation of prediction equations in healthy adults. 
    <em>BMC Pharmacol Toxicol.</em> 2013;14:53. 
    <a href="https://doi.org/10.1186/2050-6511-14-53" target="_blank" rel="noopener noreferrer">
      doi:10.1186/2050-6511-14-53
    </a>. 
    <a href="https://pubmed.ncbi.nlm.nih.gov/24499708" target="_blank" rel="noopener noreferrer">
      PMID: 24499708
    </a>; PMCID: PMC3833312.
  </p>
</div>
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