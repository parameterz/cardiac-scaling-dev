// src/config/version.ts

/**
 * Application version and build information
 * Centralized version management for the Cardiac Scaling Analysis Laboratory
 * 
 * VERSION_HISTORY is the single source of truth - add new versions to the top
 */

/**
 * Version history - add new versions to the TOP
 * The first entry is always the current version
 */

export const APP_NAME = 'Cardiac Scaling Analysis Laboratory';
export const COPYRIGHT_YEAR = '2025';
export const AUTHOR = 'Dan Dyar, MA, ACS, RDCS, FASE';


export const VERSION_HISTORY = [
  {
    version: '0.1.4',
    date: '2025-08-02',
    changes: [
      'Improved version management system - single source of truth',
      'Fixed footer to use centralized version tracking',
      'Enhanced version utilities for consistent display',
    ],
    breakingChanges: [],
    notes: 'Centralized version management and footer consistency',
  },
  {
    version: '0.1.3',
    date: '2025-01-29', 
    changes: [
      'Added comprehensive LV Mass component analysis',
      'Enhanced data disclosure panel with export functionality',
      'Improved chart visualization with professional styling',
    ],
    breakingChanges: [],
    notes: 'Major feature additions and UX improvements',
  },
  {
    version: '0.1.2',
    date: '2025-01-28',
    changes: [
      'Improved viewer experience with visualization-first approach',
      'Enhanced four-way scaling comparison',
      'Added formula selection with validation',
    ],
    breakingChanges: [],
    notes: 'Minimized editorializing, re-arranged components for visualization-first approach',
  },
  {
    version: '0.1.1',
    date: '2025-01-27',
    changes: [
      'Initial implementation of Dewey methodology',
      'Basic ratiometric vs allometric comparison',
      'MESA data integration',
    ],
    breakingChanges: [],
    notes: 'Foundation release with core scaling analysis',
  }
] as const;

/**
 * Current version - derived from VERSION_HISTORY
 * This ensures single source of truth
 */
export const APP_VERSION = VERSION_HISTORY[0].version;

/**
 * Current version details - derived from latest entry
 */
export const CURRENT_VERSION = VERSION_HISTORY[0];
export const BUILD_DATE = CURRENT_VERSION.date;

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
  lvMassComponentAnalysis: true,
  dataExportFunctionality: true,
  advancedStatistics: false, // Coming in v0.2.0
  populationRangeExplorer: false, // Coming in v0.2.0
  coefficientCalculator: false, // Coming in v0.2.0
  batchAnalysis: false // Coming in v0.2.0
} as const;

/**
 * Get current version information
 */
export const getVersionInfo = () => ({
  version: APP_VERSION,
  name: APP_NAME,
  buildDate: BUILD_DATE,
  copyright: `© ${COPYRIGHT_YEAR} ${AUTHOR}`,
  buildInfo: BUILD_INFO
});

/**
 * Get latest changelog entry (current version)
 */
export const getLatestChangelog = () => {
  return VERSION_HISTORY[0];
};

/**
 * Get version history for display
 */
export const getVersionHistory = () => {
  return VERSION_HISTORY;
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
 * Get full footer string with version and author
 */
export const getFooterVersionString = (): string => {
  return `${getVersionString(true)} • © ${COPYRIGHT_YEAR} ${AUTHOR}`;
};

/**
 * Get short footer string for compact display
 */
export const getShortFooterString = (): string => {
  return `v${APP_VERSION} ${BUILD_DATE.split('-').slice(1).join('.')} • © ${COPYRIGHT_YEAR} ${AUTHOR}`;
};

/**
 * Compare version strings (basic semantic versioning)
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parseVersion = (v: string) => v.split('.').map(Number);
  const version1 = parseVersion(v1);
  const version2 = parseVersion(v2);
  
  for (let i = 0; i < Math.max(version1.length, version2.length); i++) {
    const num1 = version1[i] || 0;
    const num2 = version2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
};

/**
 * Development/debugging information
 */
export const DEBUG_INFO = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  currentVersion: APP_VERSION,
  totalVersions: VERSION_HISTORY.length
} as const;

/**
 * Get version badge info for UI display
 */
export const getVersionBadge = () => ({
  version: APP_VERSION,
  label: `v${APP_VERSION}`,
  color: 'primary',
  tooltip: `Current version: ${APP_VERSION} (${BUILD_DATE})`
});

export default {
  APP_VERSION,
  APP_NAME,
  COPYRIGHT_YEAR,
  AUTHOR,
  BUILD_DATE,
  BUILD_INFO,
  FEATURE_FLAGS,
  VERSION_HISTORY,
  getVersionInfo,
  getLatestChangelog,
  getVersionHistory,
  isFeatureEnabled,
  getVersionString,
  getFooterVersionString,
  getShortFooterString,
  compareVersions,
  getVersionBadge,
  DEBUG_INFO
};