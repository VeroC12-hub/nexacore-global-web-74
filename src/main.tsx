import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeEnvironment } from './utils/environment.ts'

// Initialize environment and enforce correct domain for NexaCore Innovations
initializeEnvironment();

// Global handler for chunk-load errors (stale deployment — user has old index.html
// cached but Vercel already replaced the asset hashes).
// Reloads once to fetch fresh index.html. A sessionStorage guard prevents loops.
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    msg.includes('MIME type of "text/html"')
  ) {
    const key = 'chunk_error_reload';
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      window.location.reload();
    }
  }
});

// Safe root element check
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure your HTML has an element with id="root"');
}

// Create React root and render app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Declare global build-time constants for TypeScript
declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const __BUILD_TIME__: string;
declare const __BUILD_MODE__: string;
