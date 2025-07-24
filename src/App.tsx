import React, { useState } from 'react';
import './App.css';

// Import your cardiac scaling component
import RatiometricVsBiological from './components/cardiacScaling/RatiometricVsBiological';

function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'scaling'>('intro');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Simple Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '1.5rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Cardiac Scaling Analysis Laboratory
          </h1>
          <p style={{ color: '#6b7280' }}>
            Interactive tools for exploring universal biological scaling relationships
          </p>
        </div>

        {/* Simple Tab Navigation */}
        <div style={{ maxWidth: '80rem', margin: '1rem auto 0' }}>
          <button
            onClick={() => setActiveTab('intro')}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '1rem',
              backgroundColor: activeTab === 'intro' ? '#3b82f6' : 'transparent',
              color: activeTab === 'intro' ? 'white' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Introduction
          </button>
          <button
            onClick={() => setActiveTab('scaling')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'scaling' ? '#3b82f6' : 'transparent',
              color: activeTab === 'scaling' ? 'white' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Scaling Comparison
          </button>
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'intro' && (
          <div style={{ maxWidth: '60rem', margin: '2rem auto', padding: '0 1rem' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem', 
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                🎉 Vite Migration Successful!
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Your cardiac scaling tool is now running on Vite. Click "Scaling Comparison" 
                to test your main visualization component.
              </p>
              <p style={{ color: '#6b7280' }}>
                This demonstrates the transition from traditional ratiometric scaling to 
                universal biological relationships in cardiac measurements.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'scaling' && (
          <div>
            <RatiometricVsBiological />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;