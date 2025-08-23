import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeEnvironment } from './utils/environment.ts'

console.log("🌟 NexaCore Innovations - Starting application...");

// Initialize environment and enforce correct domain for NexaCore Innovations
try {
  initializeEnvironment();
  console.log("✅ Environment initialized successfully");
} catch (error) {
  console.error("❌ Environment initialization failed:", error);
}

// Safe root element check
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("❌ Root element not found!");
  throw new Error('Root element not found. Make sure your HTML has an element with id="root"');
}

console.log("✅ Root element found, creating React app...");

// Create React root and render app
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log("✅ React app rendered successfully");
} catch (error) {
  console.error("❌ Failed to render React app:", error);
  throw error;
}

// Declare global build-time constants for TypeScript
declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const __BUILD_TIME__: string;
declare const __BUILD_MODE__: string;
