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
// The guard is cleared after the app mounts successfully so each new deployment
// gets its own one-shot reload opportunity.
const CHUNK_RELOAD_KEY = 'chunk_error_reload';

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    msg.includes('MIME type of "text/html"')
  ) {
    if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
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

// Clear the chunk-reload guard once the app has mounted successfully.
// This ensures the next deployment always gets a fresh one-shot reload.
setTimeout(() => {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}, 3000);

// Declare global build-time constants for TypeScript
declare const __DEV__: boolean;
declare const __PROD__: boolean;
declare const __BUILD_TIME__: string;
declare const __BUILD_MODE__: string;
