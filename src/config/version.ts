// src/config/version.ts

/**
 * Application version and build information
 * Centralized version management for the Cardiac Scaling Analysis Laboratory
 */

export const APP_VERSION = '0.1.2';
export const APP_NAME = 'Cardiac Scaling Analysis Laboratory';
export const COPYRIGHT_YEAR = '2025';
export const BUILD_DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

/**
 * Version history and changelog
 */
export const VERSION_HISTORY = [
  {
    version: '0.1.2',
    date: '2025-07-24',
    changes: [
      'adds new BSA/LBM equations',
    ],
    breakingChanges: [],
    notes: 'implements full suite of BSA/LBM equations for comprehensive scaling analysis',
  }
] as const;

/**
 * Technical build information
 */
export const BUILD_INFO = {
  framework: 'React 19 + TypeScript',
  buildTool: 'Vite',
  charts: 'Recharts',
  dataSource: 'MESA Study (Strom et al. 2024)',
  lastUpdated: BUILD_DATE
} as const;

/**
 * Feature flags for progressive rollout
 */
export const FEATURE_FLAGS = {
  transparencyCalculations: true,
  multiExponentExplorer: true,
  advancedStatistics: false, // Coming in v1.1.0
  populationRangeExplorer: false, // Coming in v1.1.0
  coefficientCalculator: false, // Coming in v1.1.0
  exportFunctionality: false // Coming in v1.1.0
} as const;

/**
 * Get current version information
 */
export const getVersionInfo = () => ({
  version: APP_VERSION,
  name: APP_NAME,
  buildDate: BUILD_DATE,
  copyright: `© ${COPYRIGHT_YEAR}`,
  buildInfo: BUILD_INFO
});

/**
 * Get latest changelog entry
 */
export const getLatestChangelog = () => {
  return VERSION_HISTORY[0]; // Most recent is first
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

/**
 * Get formatted version string for display
 */
export const getVersionString = (includeDate = false): string => {
  if (includeDate) {
    return `v${APP_VERSION} (${BUILD_DATE})`;
  }
  return `v${APP_VERSION}`;
};

/**
 * Development/debugging information
 */
export const DEBUG_INFO = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL
} as const;

export default {
  APP_VERSION,
  APP_NAME,
  COPYRIGHT_YEAR,
  BUILD_DATE,
  BUILD_INFO,
  FEATURE_FLAGS,
  getVersionInfo,
  getLatestChangelog,
  isFeatureEnabled,
  getVersionString,
  DEBUG_INFO
};