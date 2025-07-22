// src/app/cardiac-scaling/page.tsx

import MultiExponentScalingExplorer from '@/components/cardiacScaling/MultiExponentExplorer';

export default function CardiacScalingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cardiac Scaling Explorer
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the mathematical relationships that govern cardiac measurements and expose the flaws in traditional ratiometric scaling methods.
            </p>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            The Scaling Problem
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-blue-800">
            <div>
              <h3 className="font-semibold mb-2">Traditional Approach</h3>
              <p className="text-sm">
                Ratiometric scaling (dimension ÷ BSA) assumes linear relationships through the origin, 
                creating systematic biases against patients who deviate from average body habitus.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Universal Biology</h3>
              <p className="text-sm">
                Allometric scaling reveals that cardiac dimensions follow universal biological laws: 
                linear measurements scale as LBM^0.33, mass/volume as LBM^1.0.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Tool */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MultiExponentScalingExplorer />
        </div>

        {/* Key Insights Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 ml-3">
                Universal LBM Scaling
              </h3>
            </div>
            <p className="text-green-800 text-sm">
              Set LBM exponent to 0.33 for linear measurements. Notice how male and female slopes converge, 
              revealing the fundamental biological relationship free from body composition differences.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h3 className="text-lg font-semibold text-yellow-900 ml-3">
                BSA Optimization
              </h3>
            </div>
            <p className="text-yellow-800 text-sm">
              Adjust BSA exponent to 0.5 for linear measurements. This geometric relationship 
              minimizes sex-based differences while respecting dimensional analysis.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h3 className="text-lg font-semibold text-purple-900 ml-3">
                Height Scaling Mystery
              </h3>
            </div>
            <p className="text-purple-800 text-sm">
              For mass measurements, try Height^3.0 (geometric) vs Height^2.1 (empirical). 
              Biology doesn't follow perfect geometric scaling!
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Cardiac Assessment?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            This interactive tool is just the beginning. Explore how universal scaling relationships 
            can revolutionize echocardiographic interpretation and move beyond the limitations of 
            century-old ratiometric methods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Explore Methodology
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              View Source Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}