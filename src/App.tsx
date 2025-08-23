import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AuthProvider } from "./contexts/AuthContext";

// Page imports
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import Portfolio from "./pages/Portfolio";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import BookConsultation from "./pages/BookConsultation";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import ClientPortal from "./pages/ClientPortal";
import Dashboard from "./pages/Dashboard";
import QuoteReview from "./pages/QuoteReview";
import ProjectManagerQuoteCreation from "./pages/ProjectManagerQuoteCreation";

// Component imports
import AIAssistant from "./components/AIAssistant";
import CookieConsent from "./components/CookieConsent";

// UI Component imports with fallbacks
let Toaster: any = ({ ...props }) => null;
let Sonner: any = ({ ...props }) => null;
let TooltipProvider: any = ({ children, ...props }: any) => <>{children}</>;

try {
  const toasterModule = await import("./components/ui/toaster");
  Toaster = toasterModule.Toaster;
} catch (error) {
  console.warn("Toaster component not found, using fallback");
}

try {
  const sonnerModule = await import("./components/ui/sonner");
  Sonner = sonnerModule.Toaster;
} catch (error) {
  console.warn("Sonner component not found, using fallback");
}

try {
  const tooltipModule = await import("./components/ui/tooltip");
  TooltipProvider = tooltipModule.TooltipProvider;
} catch (error) {
  console.warn("TooltipProvider component not found, using fallback");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center p-6">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>
      <div className="space-x-4">
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Go Home
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-red-600">Error Details</summary>
          <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
            {error.message}
            {"\n"}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Quote Error Fallback Component
const QuoteErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Quote Loading Error</h2>
      <p className="text-gray-600 mb-4">
        We couldn't load your quote. This might be due to an invalid link or network issue.
      </p>
      <div className="space-x-4">
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/contact'}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Contact Support
        </button>
      </div>
    </div>
  </div>
);

// Admin Error Fallback Component
const AdminErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center p-6">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Panel Error</h2>
      <p className="text-gray-600 mb-4">
        There was an error loading the admin panel.
      </p>
      <div className="space-x-4">
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/admin'}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Admin
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  // Console log for debugging - confirm app is mounting
  React.useEffect(() => {
    console.log("🚀 NexaCore App mounted successfully at:", new Date().toISOString());
    console.log("🎯 Environment:", process.env.NODE_ENV || 'unknown');
    console.log("📱 User Agent:", navigator.userAgent);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* Debug Banner - Visible indicator that app is rendering */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#10B981',
        color: 'white',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        ✅ NexaCore App is rendering - Debug Banner Active ({new Date().toLocaleTimeString()})
      </div>
      
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/book-consultation" element={<BookConsultation />} />
                
                {/* AUTH ROUTES */}
                <Route path="/auth" element={<Auth />} />
                
                {/* CLIENT ROUTES */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/client-portal" element={<ClientPortal />} />
                
                {/* QUOTE ROUTES - Enhanced with proper error handling */}
                <Route 
                  path="/quote/:id" 
                  element={
                    <ErrorBoundary FallbackComponent={QuoteErrorFallback}>
                      <QuoteReview />
                    </ErrorBoundary>
                  } 
                />
                
                {/* LEGACY QUOTE REDIRECTS - Handle old quote URLs */}
                <Route path="/quotes/:id" element={<Navigate to="/quote/:id" replace />} />
                <Route path="/quote-review/:id" element={<Navigate to="/quote/:id" replace />} />
                
                {/* ADMIN/PM ROUTES */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route 
                  path="/admin/create-quote" 
                  element={
                    <ErrorBoundary FallbackComponent={AdminErrorFallback}>
                      <ProjectManagerQuoteCreation />
                    </ErrorBoundary>
                  } 
                />
                
                {/* 404 FALLBACK */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Global Components */}
              <AIAssistant />
              <CookieConsent />
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
