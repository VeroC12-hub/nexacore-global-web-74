// src/App.tsx - FINAL WORKING VERSION WITH ALL ROUTES
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Components
import AIAssistant from "./components/AIAssistant";
import CookieConsent from "./components/CookieConsent";

// UI Components (with safe imports)
let Toaster, Sonner, TooltipProvider;
try {
  const toasterModule = require("@/components/ui/toaster");
  Toaster = toasterModule.Toaster;
} catch (e) {
  console.warn("Toaster not found");
}

try {
  const sonnerModule = require("@/components/ui/sonner");
  Sonner = sonnerModule.Toaster;
} catch (e) {
  console.warn("Sonner not found");
}

try {
  const tooltipModule = require("@/components/ui/tooltip");
  TooltipProvider = tooltipModule.TooltipProvider;
} catch (e) {
  console.warn("TooltipProvider not found");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("🚀 NexaCore App starting with all routes...");
  
  const AppContent = () => (
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
          
          {/* CLIENT ROUTES - THESE ARE THE CRITICAL ONES */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route path="/quote/:id" element={<QuoteReview />} />
          
          {/* ADMIN/PM ROUTES - THESE ARE ALSO CRITICAL */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create-quote" element={<ProjectManagerQuoteCreation />} />
          
          {/* 404 FALLBACK */}
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
        <>
          <AppContent />
          {Toaster && <Toaster />}
          {Sonner && <Sonner />}
        </>
      )}
    </QueryClientProvider>
  );
};

console.log("📍 App.tsx loaded with routes:");
console.log("✅ /client-portal → ClientPortal");
console.log("✅ /admin/create-quote → ProjectManagerQuoteCreation");
console.log("✅ /quote/:id → QuoteReview");

export default App;
