// src/components/Intro.tsx

import React from "react";

interface IntroProps {
  onNavigate?: (
    tab: "intro" | "linear" | "area" | "mass_volume" | "methods"
  ) => void;
}

const Intro: React.FC<IntroProps> = ({ onNavigate }) => {
  return (
    <div>
      {/* Hero Quote - Hook them immediately */}
      <section
        className="transparency-panel"
        style={{ textAlign: "center", padding: "3rem 2rem" }}
      >
        <blockquote
          style={{
            fontSize: "1.2rem",
            fontStyle: "italic",
            margin: "0 0 1rem 0",
            lineHeight: 1.4,
          }}
        >
          "We propose that cardiovascular parameters allometrically scaled to
          FFM or, if practical constraints make determination of FFM unwieldy,
          height in a dimensionally consistent manner may better indicate the
          normalcy of cardiovascular size and function for a given patient
          size."
        </blockquote>
        <footer>
          <cite
            style={{ fontSize: "1.1rem", color: "var(--pico-muted-color)" }}
          >
            — Dewey et al., Circulation (2008)
          </cite>
        </footer>
      </section>

      {/* Scientific Context - Brief */}
      <section className="insight-info">
        <h2>Purpose</h2>
        <p>
          This site is uses the comprehensive MESA study data published by Strom
          et al., as a vehicle to explore scaling theory and strategies
          described by Dewey et al., and Gutgesell & Rembold.
        </p>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={() => onNavigate?.("methods")} className="secondary">
            Read more about the Scaling Theory & Methods →
          </button>
        </div>
      </section>

      {/* Citations */}
      <section>
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "var(--pico-code-background-color)",
              borderRadius: "var(--pico-border-radius)",
            }}
          >
            <h4>Primary Data Sources</h4>
            <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
              <strong>Strom JB, Zhao Y, Farrell A, et al.</strong> Reference
              Values for Indexed Echocardiographic Chamber Sizes in Older
              Adults: The Multi-Ethnic Study of Atherosclerosis. 
              <em>J Am Heart Assoc.</em> 2024;13:e034029.
              <a
                href="https://doi.org/10.1161/JAHA.123.034029"
                target="_blank"
                rel="noopener noreferrer"
              >
                doi:10.1161/JAHA.123.034029
              </a>
            </p>

            <h4>Scaling Theory</h4>
            <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
              <strong>
                Dewey FE, Rosenthal D, Murphy DJ Jr, Froelicher VF, Ashley EA.
              </strong>{" "}
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

            <p style={{ fontSize: "0.9rem" }}>
              <strong>Gutgesell HP, Rembold CM.</strong> Growth of the human
              heart relative to body surface area. 
              <em>Am J Cardiol.</em> 1990;65:662-668.
              <a
                href="https://doi.org/10.1016/0002-9149(90)91048-B"
                target="_blank"
                rel="noopener noreferrer"
              >
                doi:10.1016/0002-9149(90)91048-B
              </a>
            </p>
          </div>
      </section>

      {/* Essential Disclaimers */}
      <section className="insight-danger">
        <h3>Educational Use Only</h3>
        <p>
          This tool explores scaling principles using published data.{" "}
          <strong>Not for clinical use</strong> or patient care decisions.
        </p>
      </section>
    </div>
  );
};

export default Intro;
