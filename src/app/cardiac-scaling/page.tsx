// src/app/cardiac-scaling/page.tsx

import MultiExponentExplorerWrapper from '@/components/cardiacScaling/MultiExponentExplorerWrapper';

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
          <MultiExponentExplorerWrapper 
            initialShowAll={false}
            initialMeasurement="lvdd"
            allowToggle={true}
          />
        </div>

        {/* Instructions for users */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">How to Use This Tool</h3>
          <div className="text-sm text-amber-700 space-y-2">
            <p><strong>1. Choose a measurement:</strong> Start with linear measurements (LV dimensions, wall thickness) to see clear scaling relationships.</p>
            <p><strong>2. Select scaling variable:</strong> Click BSA, LBM, or Height tabs to explore different body size relationships.</p>
            <p><strong>3. Adjust exponents:</strong> Use the slider or quick buttons to see how different exponents affect male-female convergence.</p>
            <p><strong>4. Try different formulas:</strong> Notice how universal scaling laws remain robust across different BSA/LBM calculation methods.</p>
            <p><strong>5. Explore mass/volume measurements:</strong> Compare the height exponent mystery (geometric vs empirical scaling).</p>
          </div>
        </div>

        {/* Key Insights Section */}
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h3 className="text-lg font-semibold text-green-900 ml-3">
                Linear Scaling
              </h3>
            </div>
            <p className="text-green-800 text-sm">
              Set LBM exponent to 0.33 for linear measurements (dimensions, thicknesses). Notice how male and female slopes converge, 
              revealing the fundamental biological relationship.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 ml-3">
                Area Scaling
              </h3>
            </div>
            <p className="text-blue-800 text-sm">
              Try area measurements with LBM^0.67 and BSA^1.0. Areas scale directly with BSA since 
              body surface area is itself an area measurement.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h3 className="text-lg font-semibold text-yellow-900 ml-3">
                Mass Scaling
              </h3>
            </div>
            <p className="text-yellow-800 text-sm">
              Explore LV mass with LBM^1.0 scaling. Mass measurements scale directly with body mass, 
              following the principle that tissue mass scales with total body mass.
            </p>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <h3 className="text-lg font-semibold text-purple-900 ml-3">
                Height Mystery
              </h3>
            </div>
            <p className="text-purple-800 text-sm">
              For volume measurements, try Height^3.0 (geometric) vs Height^2.1 (empirical). 
              Biology doesn't follow perfect geometric scaling!
            </p>
          </div>
        </div>

        {/* Dataset Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">MESA Study Dataset</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Available Measurements</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Linear (8):</strong> LV dimensions, wall thicknesses, vessel diameters</p>
                <p><strong>Area (3):</strong> Atrial and ventricular chamber areas</p>
                <p><strong>Mass (1):</strong> Left ventricular mass</p>
                <p><strong>Volume (4):</strong> Chamber volumes, stroke volume, cardiac output</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Study Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Population:</strong> Multi-Ethnic Study of Atherosclerosis (MESA)</p>
                <p><strong>Size:</strong> 608 participants with normal echocardiograms</p>
                <p><strong>Reference:</strong> Strom JB, et al. J Am Heart Assoc. 2024;13:e034029</p>
                <p><strong>Indices:</strong> BSA, height, and BMI indexed values available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gray-900 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Cardiac Assessment?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            This interactive tool demonstrates how universal scaling relationships can revolutionize 
            echocardiographic interpretation and move beyond the limitations of century-old ratiometric methods.
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