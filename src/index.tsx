import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../assets/logo.css';

// Electron detection is already handled in types.ts

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
