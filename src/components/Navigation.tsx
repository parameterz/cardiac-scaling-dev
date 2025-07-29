// src/components/Navigation.tsx

import React from 'react';

// Types
export type NavigationTab = "intro" | "linear" | "area" | "mass_volume" | "lv_mass_analysis" | "methods";

interface MeasurementCounts {
  linear: number;
  area: number;
  massVolume: number;
}

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  measurementCounts: MeasurementCounts;
}

// Navigation item type
interface NavItem {
  id: NavigationTab;
  label: string;
  showCount: boolean;
  countKey?: keyof MeasurementCounts;
  isSecondary?: boolean;
}

// Navigation configuration
const NAV_ITEMS: NavItem[] = [
  {
    id: 'intro',
    label: 'Introduction',
    showCount: false
  },
  {
    id: 'linear',
    label: 'Linear',
    showCount: true,
    countKey: 'linear'
  },
  {
    id: 'area',
    label: 'Area', 
    showCount: true,
    countKey: 'area'
  },
  {
    id: 'mass_volume',
    label: 'Mass & Volume',
    showCount: true,
    countKey: 'massVolume'
  },
  {
    id: 'lv_mass_analysis',  
    label: 'LV Mass Analysis',
    showCount: false
  },
  {
    id: 'methods',
    label: 'Methodology',
    showCount: false,
    isSecondary: true // Different styling for methodology
  }
];

const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  measurementCounts 
}) => {
  return (
    <nav>
      <ul style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'flex-start'
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          
          // Build label with count if needed
          const label = item.showCount && item.countKey
            ? `${item.label} (${measurementCounts[item.countKey]})`
            : item.label;
          
          // Determine button class
          let buttonClass: string | undefined;
          if (isActive) {
            buttonClass = item.isSecondary ? "secondary" : undefined; // Active primary or secondary
          } else {
            buttonClass = "outline"; // Inactive outline
          }
          
          return (
            <li key={item.id} style={{ listStyle: 'none' }}>
              <button 
                className={buttonClass}
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  fontSize: '0.9rem',
                  padding: '0.5rem 1rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;