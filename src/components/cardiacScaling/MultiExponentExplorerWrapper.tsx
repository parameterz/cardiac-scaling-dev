// src/components/cardiacScaling/MultiExponentExplorerWrapper.tsx

"use client";
import React, { useState } from 'react';
import MultiExponentScalingExplorer from './MultiExponentExplorer';

interface MultiExponentExplorerWrapperProps {
  initialShowAll?: boolean;
  initialMeasurement?: string;
  allowToggle?: boolean;
}

const MultiExponentExplorerWrapper = ({ 
  initialShowAll = false,
  initialMeasurement = 'lvdd',
  allowToggle = true 
}: MultiExponentExplorerWrapperProps) => {
  const [showAllMeasurements, setShowAllMeasurements] = useState(initialShowAll);

  return (
    <div className="w-full">
      {allowToggle && (
        <div className="mb-4 flex justify-end">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setShowAllMeasurements(false)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                !showAllMeasurements
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Key Measurements (6)
            </button>
            <button
              onClick={() => setShowAllMeasurements(true)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showAllMeasurements
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Full MESA Dataset (16)
            </button>
          </div>
        </div>
      )}
      
      <MultiExponentScalingExplorer 
        showAllMeasurements={showAllMeasurements}
        initialMeasurement={initialMeasurement}
        dataSource="strom"
      />
    </div>
  );
};

export default MultiExponentExplorerWrapper;