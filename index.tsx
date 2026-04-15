import React from 'react';
import ReactDOM from 'react-dom/client';
// Use main app version - back to full React app
import App from './App.tsx';

console.log('🚀 Loading InventoryPro Analytics...');
console.log('📦 Checking React version:', React.version);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Root element found:', rootElement);

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ App successfully rendered!');
} catch (error: any) {
  console.error('❌ Error rendering app:', error);
  
  // Fallback UI bei Fehlern
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: Inter, Arial, sans-serif; background: #fee2e2; min-height: 100vh;">
      <h1 style="color: #dc2626; font-size: 28px; margin-bottom: 20px;">❌ App Loading Error</h1>
      <p style="color: #7f1d1d; margin-bottom: 20px;">There was an error loading the application.</p>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px auto; max-width: 600px; text-align: left;">
        <strong>Error Details:</strong><br>
        <code style="color: #dc2626; font-size: 14px;">${error.message || error}</code>
      </div>
      <button 
        onclick="window.location.reload()" 
        style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
        🔄 Reload Page
      </button>
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Check browser console (F12) for more details.
      </p>
    </div>
  `;
}
