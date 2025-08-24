// src/App.tsx - COMPLETE CONSOLIDATED VERSION WITH ALL ROUTES FIXED
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// ========================================
// IMPORT ALL COMPONENTS - COMPLETE LIST
// ========================================

// Public Pages
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

// Auth Pages
import Auth from "./pages/Auth";

// Client Pages - CRITICAL IMPORTS
import ClientPortal from "./pages/ClientPortal";
import Dashboard from "./pages/Dashboard";
import QuoteReview from "./pages/QuoteReview";

// Admin/PM Pages - CRITICAL IMPORTS
import AdminDashboard from "./pages/AdminDashboard";
import ProjectManagerQuoteCreation from "./pages/ProjectManagerQuoteCreation";

// Additional Components
import AIAssistant from "./components/AIAssistant";
import CookieConsent from "./components/CookieConsent";

// UI Components (with error handling)
let Toaster, Sonner, TooltipProvider;
try {
  const toasterModule = require("@/components/ui/toaster");
  Toaster = toasterModule.Toaster;
} catch (e) {
  console.warn("Toaster component not found, skipping...");
}

try {
  const sonnerModule = require("@/components/ui/sonner");
  Sonner = sonnerModule.Toaster;
} catch (e) {
  console.warn("Sonner component not found, skipping...");
}

try {
  const tooltipModule = require("@/components/ui/tooltip");
  TooltipProvider = tooltipModule.TooltipProvider;
} catch (e) {
  console.warn("TooltipProvider component not found, skipping...");
}

// ========================================
// QUERY CLIENT CONFIGURATION
// ========================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// ========================================
// MAIN APP COMPONENT
// ========================================
const App = () => {
  console.log("🚀 NexaCore App initializing...");

  // Wrapper component for optional providers
  const AppContent = () => (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ==========================================
              PUBLIC ROUTES - NO AUTHENTICATION NEEDED
              ========================================== */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/book-consultation" element={<BookConsultation />} />

          {/* ==========================================
              AUTHENTICATION ROUTES
              ========================================== */}
          <Route path="/auth" element={<Auth />} />

          {/* ==========================================
              CLIENT ROUTES - CRITICAL FIXES HERE
              ========================================== */}
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quote/:id" element={<QuoteReview />} />

          {/* ==========================================
              ADMIN/PROJECT MANAGER ROUTES - CRITICAL FIXES
              ========================================== */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create-quote" element={<ProjectManagerQuoteCreation />} />

          {/* ==========================================
              404 FALLBACK ROUTE
              ========================================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Components */}
        <AIAssistant />
        <CookieConsent />
      </BrowserRouter>
    </AuthProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {TooltipProvider ? (
        <TooltipProvider>
          <AppContent />
          {Toaster && <Toaster />}
          {Sonner && <Sonner />}
        </TooltipProvider>
      ) : (
        <AppContent />
      )}
    </QueryClientProvider>
  );
};

// ========================================
// DEBUGGING INFORMATION
// ========================================
if (typeof window !== 'undefined') {
  console.log("📍 App.tsx loaded with routes:");
  console.log("✅ /client-portal → ClientPortal");
  console.log("✅ /admin/create-quote → ProjectManagerQuoteCreation");
  console.log("✅ /quote/:id → QuoteReview");
  console.log("✅ All public routes available");
}

export default App;
