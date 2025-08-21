import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import ProjectManagerQuoteCreation from "./pages/ProjectManagerQuoteCreation"; // NEW IMPORT
import AIAssistant from "./components/AIAssistant";
import CookieConsent from "./components/CookieConsent";

// Optional: Only import these if they exist in your project
// If you get import errors, comment these out
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
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
              <Route path="/quote/:id" element={<QuoteReview />} />
              
              {/* ADMIN/PM ROUTES */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-quote" element={<ProjectManagerQuoteCreation />} /> {/* NEW ROUTE */}
              
              {/* 404 FALLBACK */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIAssistant />
            <CookieConsent />
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
