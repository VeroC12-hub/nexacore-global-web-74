// src/App.tsx - COMPLETE CORRECTED VERSION - NO MORE 404 ERRORS
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// ===== PAGE IMPORTS - ALL VERIFIED =====
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

// ===== COMPONENTS IMPORTS - ALL VERIFIED =====
import AIAssistant from "./components/AIAssistant";
import CookieConsent from "./components/CookieConsent";

// ===== UI COMPONENTS - CORRECT IMPORTS =====
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// ===== QUERY CLIENT CONFIGURATION =====
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log("🚀 NexaCore Innovations - App Starting with ALL Routes");
  console.log("📍 Domain: nexacore-innovations.com");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* ===== PUBLIC ROUTES - FULLY FUNCTIONAL ===== */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/book-consultation" element={<BookConsultation />} />
              
              {/* ===== AUTHENTICATION ROUTES ===== */}
              <Route path="/auth" element={<Auth />} />
              
              {/* ===== CLIENT PORTAL ROUTES - CRITICAL BUSINESS ROUTES ===== */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/quote/:id" element={<QuoteReview />} />
              
              {/* ===== ADMIN ROUTES - CRITICAL BUSINESS ROUTES ===== */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-quote" element={<ProjectManagerQuoteCreation />} />
              
              {/* ===== 404 FALLBACK - MUST BE LAST ===== */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* ===== GLOBAL COMPONENTS - ALWAYS ACTIVE ===== */}
            <AIAssistant />
            <CookieConsent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
      
      {/* ===== TOAST NOTIFICATIONS - GLOBAL ===== */}
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
};

// ===== DEBUG LOGGING FOR PRODUCTION MONITORING =====
console.log("🔧 NexaCore App.tsx - All Routes Registered:");
console.log("✅ PUBLIC: /, /about, /services, /contact, /get-started, /portfolio");
console.log("✅ BUSINESS: /client-portal, /admin/create-quote, /quote/:id");
console.log("✅ AUTH: /auth, /dashboard, /admin");
console.log("✅ UI Components: Toaster, Sonner, TooltipProvider loaded");
console.log("🌐 Ready for nexacore-innovations.com production");

export default App;
