// src/app/page.tsx

import RatiometricVsBiological from '@/components/cardiacScaling/RatiometricVsBiological';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Ratiometric Scaling is an Anachronism
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-4">
              In the era of precision medicine, we can sequence genomes and predict drug responses, 
              yet we persist with century-old ratios that create systematic biases in cardiac assessment.
            </p>
            <p className="text-lg text-blue-600 font-medium">
              Interactive demonstration of universal biological scaling vs. traditional BSA indexing
            </p>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-amber-50 rounded-lg p-6 mb-8 border border-amber-200">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-3">
                The Mathematical Problem
              </h2>
              <p className="text-amber-800 text-sm mb-3">
                Ratiometric scaling (dimension ÷ BSA) assumes linear relationships through the origin, 
                fitting straight lines through curved biological data. This creates systematic biases 
                against patients who deviate from average body habitus.
              </p>
              <p className="text-amber-700 text-xs">
                <strong>Example:</strong> Using MESA data, the same measurements simultaneously predict 
                opposite male-female relationships depending on the scaling method employed.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-amber-900 mb-3">
                The Biological Solution
              </h2>
              <p className="text-amber-800 text-sm mb-3">
                Allometric scaling reveals that cardiac dimensions follow universal biological laws: 
                linear measurements scale as LBM^0.33, masses as LBM^1.0. These relationships 
                are consistent across sexes when properly scaled.
              </p>
              <p className="text-amber-700 text-xs">
                <strong>Result:</strong> Universal coefficients eliminate artificial sex differences 
                while respecting true biological relationships.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Visualization */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <RatiometricVsBiological />
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h3 className="text-lg font-semibold text-red-900 ml-3">
                Ratiometric Artifacts
              </h3>
            </div>
            <p className="text-red-800 text-sm">
              Straight dashed lines create artificial sex differences. These mathematical impossibilities 
              suggest our current "normal" ranges may reflect mathematical convenience rather than biological reality.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 ml-3">
                Universal Biology
              </h3>
            </div>
            <p className="text-blue-800 text-sm">
              Thick curved lines reveal universal LBM^0.33 scaling for linear measurements. Notice how 
              male and female relationships converge, exposing the fundamental biological relationship.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 ml-3">
                Formula Independence
              </h3>
            </div>
            <p className="text-green-800 text-sm">
              Universal scaling relationships remain robust across different BSA and LBM formulas, 
              validating the underlying biological principles regardless of computational method.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Beyond the Constraints of 1916
          </h2>
          <div className="text-gray-300 max-w-3xl mx-auto mb-6">
            <p className="mb-4">
              The most cited BSA equation was published in 1916. Tanner showed fundamental problems 
              with BSA ratio scaling in 1949. Yet we persist with methods that create mathematical 
              impossibilities in the era of precision medicine.
            </p>
            <p>
              This visualization demonstrates the universal biological relationships that ratiometric 
              methods obscure. It's time to embrace scaling approaches that respect cardiac geometry 
              and serve the diversity of our patients.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Read Full Editorial
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Explore Advanced Tools
            </button>
          </div>
        </div>

        {/* Technical Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Technical Implementation</h3>
          <p className="text-xs text-blue-800">
            This visualization back-calculates universal coefficients from published MESA reference data using 
            the Dewey methodology. Universal LBM coefficients are derived by averaging sex-specific calculations, 
            testing the hypothesis that biological scaling should be universal across sexes. The robustness 
            across different BSA/LBM formulas validates the underlying scaling relationships.
          </p>
        </div>
      </div>
    </div>
  );
}