/// <reference types="vite/client" />

// Google Analytics (gtag.js) globals, injected at runtime by the GA script
declare function gtag(...args: unknown[]): void;

interface Window {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}
