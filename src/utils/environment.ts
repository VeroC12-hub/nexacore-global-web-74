/**
 * Environment Detection Utilities for NexaCore Innovations
 * This file enforces proper domain handling and removes any Lovable references
 */

export interface EnvironmentInfo {
  mode: string;
  isDevelopment: boolean;
  isProduction: boolean;
  domain: string;
  baseUrl: string;
  isLocalhost: boolean;
  isVercel: boolean;
  isNexaCoreDomain: boolean;
}

/**
 * Get environment variable safely
 */
function getEnvVar(name: string): string | undefined {
  try {
    // Check Vite environment variables
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[name];
    }
    
    // Fallback to globalThis for build-time constants
    const globalEnv = (globalThis as any).__VITE_ENV__ || {};
    if (globalEnv[name]) {
      return globalEnv[name];
    }
    
    // Fallback to process.env if available (SSR context)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name];
    }

    return undefined;
  } catch (error) {
    console.warn(`Error getting environment variable ${name}:`, error);
    return undefined;
  }
}

/**
 * Get current environment information
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  // Determine mode from various sources
  let mode = 'development';
  
  try {
    // Try build-time constants first
    if (typeof __PROD__ !== 'undefined' && __PROD__) {
      mode = 'production';
    } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
      mode = 'development';
    } else {
      // Fallback to environment variables
      const envMode = getEnvVar('MODE') || getEnvVar('NODE_ENV');
      if (envMode) {
        mode = envMode;
      }
    }
  } catch {
    // Default to development if detection fails
    mode = 'development';
  }

  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  // Get domain information
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'nexacore-innovations.com';
  
  // Determine base URL
  let baseUrl = getEnvVar('VITE_APP_URL') || '';
  if (!baseUrl) {
    if (isDevelopment) {
      baseUrl = 'http://localhost:8080';
    } else {
      baseUrl = 'https://www.nexacore-innovations.com';
    }
  }

  const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';
  const isVercel = domain.includes('vercel.app') || domain.includes('vercel.live');
  const isNexaCoreDomain = domain.includes('nexacore-innovations.com');

  return {
    mode,
    isDevelopment,
    isProduction,
    domain,
    baseUrl,
    isLocalhost,
    isVercel,
    isNexaCoreDomain
  };
}

/**
 * Enforce correct domain and prevent unwanted redirects
 */
export function enforceCorrectDomain(): void {
  if (typeof window === 'undefined') return;
  
  const env = getEnvironmentInfo();
  const currentUrl = window.location.href;
  
  // Only redirect in production and non-localhost environments
  if (env.isProduction && !env.isLocalhost) {
    // If we're on a Vercel domain but should be on NexaCore domain
    if (env.isVercel && !env.isNexaCoreDomain) {
      const targetUrl = currentUrl.replace(window.location.origin, 'https://www.nexacore-innovations.com');
      console.log('🔄 Redirecting to NexaCore domain:', targetUrl);
      window.location.replace(targetUrl);
      return;
    }
    
    // If we're on nexacore-innovations.com without www, redirect to www
    if (env.domain === 'nexacore-innovations.com') {
      const targetUrl = currentUrl.replace('https://nexacore-innovations.com', 'https://www.nexacore-innovations.com');
      console.log('🔄 Redirecting to www subdomain:', targetUrl);
      window.location.replace(targetUrl);
      return;
    }
    
    // Block any domains that are not NexaCore (except localhost)
    if (!env.isNexaCoreDomain && !env.isLocalhost) {
      console.log('🚫 Blocking unauthorized domain, redirecting to NexaCore');
      window.location.replace('https://www.nexacore-innovations.com' + window.location.pathname + window.location.search);
      return;
    }
  }
}

/**
 * Get Google Drive configuration safely
 */
export function getGoogleDriveConfig() {
  return {
    clientId: getEnvVar('VITE_GOOGLE_CLIENT_ID'),
    apiKey: getEnvVar('VITE_GOOGLE_DRIVE_API_KEY'),
    folderId: getEnvVar('VITE_GOOGLE_DRIVE_FOLDER_ID'),
    get isConfigured() {
      return !!(this.clientId && this.apiKey);
    }
  };
}

/**
 * Log environment information safely
 */
export function logEnvironmentInfo(): void {
  try {
    const env = getEnvironmentInfo();
    const google = getGoogleDriveConfig();

    console.log('🌐 NexaCore Innovations - Environment Information:');
    console.log('├── Mode:', env.mode);
    console.log('├── Development:', env.isDevelopment);
    console.log('├── Production:', env.isProduction);
    console.log('├── Domain:', env.domain);
    console.log('├── Base URL:', env.baseUrl);
    console.log('├── Is Localhost:', env.isLocalhost);
    console.log('├── Is Vercel:', env.isVercel);
    console.log('├── Correct Domain:', env.isNexaCoreDomain ? '✅' : '❌');
    console.log('└── Google Drive Configured:', google.isConfigured ? '✅' : '❌');

    if (!env.isNexaCoreDomain && !env.isLocalhost) {
      console.warn('⚠️ Not on NexaCore domain - redirects will be enforced');
    }

    // Check for production deployment issues
    if (env.isVercel && env.isDevelopment) {
      console.warn('🚨 Production Deployment Issue Detected:');
      console.log('Your Vercel deployment is running in development mode.');
      console.log('This usually means environment variables are not set correctly.');
    }

  } catch (error) {
    console.error('❌ Error logging environment info:', error);
  }
}

/**
 * Initialize environment on app start
 */
export function initializeEnvironment(): void {
  logEnvironmentInfo();
  enforceCorrectDomain();
}

// Declare global build-time constants for TypeScript
declare const __DEV__: boolean;
declare const __PROD__: boolean;
