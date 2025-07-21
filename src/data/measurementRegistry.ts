// src/data/measurementRegistry.ts  

interface MeasurementDefinition {
  id: string;
  name: string;
  type: 'linear' | 'mass' | 'volume';
  unit: string;
  referenceData: {
    [demographic: string]: {
      mean: number;
      sd: number;
      indexType: 'bsa' | 'height' | 'bmi';
    };
  };
}

export const CARDIAC_MEASUREMENTS = [
  // All linear measurements automatically get linear exponents
  { id: 'lvdd', name: 'LV End-Diastolic Dimension', type: 'linear', unit: 'cm' },
  { id: 'ivsd', name: 'IVS Thickness', type: 'linear', unit: 'cm' },
  { id: 'lvpw', name: 'LV Posterior Wall', type: 'linear', unit: 'cm' },
  
  // All mass/volume measurements get 3D exponents  
  { id: 'lvm', name: 'LV Mass', type: 'mass_volume', unit: 'g' },
  { id: 'lav', name: 'LA Volume', type: 'mass_volume', unit: 'mL' },
  { id: 'lvedv', name: 'LV End-Diastolic Volume', type: 'mass_volume', unit: 'mL' }
];