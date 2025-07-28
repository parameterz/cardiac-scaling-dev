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
      {/* Methodological Foundation */}
      <section>
        <header>
          <h2>Allometric Scaling in Cardiovascular Assessment</h2>
        </header>
        
        <blockquote>
          <p>
            "We propose that cardiovascular parameters allometrically scaled to
            FFM or, if practical constraints make determination of FFM unwieldy,
            height in a dimensionally consistent manner may better indicate the
            normalcy of cardiovascular size and function for a given patient
            size."
          </p>
          <footer>
            <cite>Dewey et al., Circulation (2008)</cite>
          </footer>
        </blockquote>
      </section>

      {/* Purpose and Scope */}
      <section>
        <h3>Purpose</h3>
        <p>
          This interactive analysis applies the scaling theory framework described by 
          Dewey et al. and Gutgesell & Rembold to the comprehensive reference dataset 
          published by Strom et al. from the Multi-Ethnic Study of Atherosclerosis (MESA). 
          The tool enables systematic comparison of traditional ratiometric indexing 
          with allometric scaling approaches across different cardiovascular measurement types.
        </p>
        <p>Use the tabs (above) to explore how various scaling approaches compare.</p>


        <aside style={{ 
          borderLeft: '3px solid var(--pico-primary)', 
          paddingLeft: '1rem', 
          marginTop: '1.5rem',
          fontSize: '0.95rem'
        }}>
          <p><strong>Methodological Focus:</strong> This analysis examines four primary scaling approaches:</p>
          <ul>
            <li>Traditional BSA ratiometric indexing (current clinical standard)</li>
            <li>Allometric lean body mass scaling</li>
            <li>Allometric BSA scaling </li>
            <li>Allometric height scaling </li>
          </ul>
        </aside>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => onNavigate?.("methods")} 
            className="secondary"
            style={{ fontSize: '0.9rem' }}
          >
            Complete Methodology & Theory →
          </button>
        </div>
      </section>

      {/* Data Sources and Validation */}
      <section>
        <h3>Data Sources</h3>
        
        <h4>Primary Dataset</h4>
        <p style={{ marginBottom: '0.5rem' }}>
          Strom JB, Zhao Y, Farrell A, et al. Reference Values for Indexed 
          Echocardiographic Chamber Sizes in Older Adults: The Multi-Ethnic 
          Study of Atherosclerosis. <em>J Am Heart Assoc.</em> 2024;13:e034029. 
          <a 
            href="https://doi.org/10.1161/JAHA.123.034029"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.9rem' }}
          >
            doi:10.1161/JAHA.123.034029
          </a>
        </p>

        <h4>Theoretical Framework</h4>
        <p style={{ marginBottom: '0.5rem' }}>
          Dewey FE, Rosenthal D, Murphy DJ Jr, Froelicher VF, Ashley EA. 
          Does size matter? Clinical applications of scaling cardiac size 
          and function for body size. <em>Circulation.</em> 2008;117:2279-2287. 
          <a 
            href="https://doi.org/10.1161/CIRCULATIONAHA.107.736785"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.9rem' }}
          >
            doi:10.1161/CIRCULATIONAHA.107.736785
          </a>
        </p>

        <p style={{ marginBottom: '1.5rem' }}>
          Gutgesell HP, Rembold CM. Growth of the human heart relative to 
          body surface area. <em>Am J Cardiol.</em> 1990;65:662-668. 
          <a 
            href="https://doi.org/10.1016/0002-9149(90)91048-B"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.9rem' }}
          >
            doi:10.1016/0002-9149(90)91048-B
          </a>
        </p>

      </section>

      {/* Study Limitations */}
      <section>
        <h3>Limitations and Scope</h3>
        
        <p>
          This analysis is intended for educational and research purposes only. 
          The tool demonstrates scaling methodology principles using published 
          reference data and should not be used for clinical decision-making 
          or patient care.
        </p>

        <p style={{ fontSize: '0.9rem', color: 'var(--pico-muted-color)' }}>
          <strong>Educational Use:</strong> This implementation serves as an 
          interactive exploration of scaling theory principles. Some data is 
          derived; clinical application requires independent validation.
        </p>
      </section>
    </div>
  );
};

export default Intro;