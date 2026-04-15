import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Use main app version - back to full React app
import App from '../App.tsx';

console.log('🚀 Loading InventoryPro Analytics...');
console.log('📦 Checking React version:', React.version);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Could not find root element');
  throw new Error('Root element not found');
}

console.log('✅ Root element found, creating React root...');

const root = ReactDOM.createRoot(rootElement);

// Enhanced error handling for React rendering
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ React app rendered successfully');
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>Application Error</h2>
      <p>Failed to load InventoryPro Analytics</p>
      <p>Error: ${error}</p>
      <p>Please check the console for more details.</p>
    </div>
  `;
}

// Development hot reload support
if (import.meta.hot) {
  console.log('🔥 Hot reload enabled');
}
