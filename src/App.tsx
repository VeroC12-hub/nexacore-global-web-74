import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { EnhancedAuthProvider } from "./hooks/useEnhancedAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Team from "./pages/Team";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import Portfolio from "./pages/Portfolio";
import PortfolioPage from "./pages/PortfolioPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import RemoteDevelopment from "./pages/RemoteDevelopment";
import AIMLServices from "./pages/services/AIMLServices";
import CADServices from "./pages/services/CADServices";
import BlockchainServices from "./pages/services/BlockchainServices";
import EngineeringTechnical from "./pages/services/EngineeringTechnical";
import NotFound from "./pages/NotFound";
import BookConsultation from "./pages/BookConsultation";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import AuthConfirm from "./pages/AuthConfirm"; // NEW IMPORT FOR EMAIL CONFIRMATION
import PasswordReset from "./pages/PasswordReset";
import ClientPortal from "./pages/ClientPortal";
import Dashboard from "./pages/Dashboard";
import QuoteReview from "./pages/QuoteReview";
import ProjectManagerQuoteCreation from "./pages/ProjectManagerQuoteCreation"; // NEW IMPORT
import StaffDashboardPage from "./pages/StaffDashboardPage"; // NEW IMPORT FOR STAFF DASHBOARD
import EnhancedAIAssistant from "./components/EnhancedAIAssistant";
import CookieConsent from "./components/CookieConsent";

// Optional: Only import these if they exist in your project
// If you get import errors, comment these out
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <EnhancedAuthProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/team" element={<Team />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/engineering-technical" element={<EngineeringTechnical />} />
                <Route path="/remote-development" element={<RemoteDevelopment />} />
                <Route path="/services/ai-machine-learning" element={<AIMLServices />} />
                <Route path="/services/cad-design-engineering" element={<CADServices />} />
                <Route path="/services/blockchain-web3" element={<BlockchainServices />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/advanced" element={<PortfolioPage />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/book-consultation" element={<BookConsultation />} />
                
                {/* AUTH ROUTES */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/confirm" element={<AuthConfirm />} /> {/* NEW ROUTE FOR EMAIL CONFIRMATION */}
                <Route path="/auth/reset-password" element={<PasswordReset />} /> {/* NEW ROUTE FOR PASSWORD RESET */}
                
                {/* CLIENT ROUTES */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/client-portal" element={<ClientPortal />} />
                <Route path="/quote/:id" element={<QuoteReview />} />
                
                {/* STAFF ROUTES */}
                <Route path="/staff" element={<StaffDashboardPage />} /> {/* NEW STAFF DASHBOARD */}
                
                {/* ADMIN/PM ROUTES */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create-quote" element={<ProjectManagerQuoteCreation />} /> {/* NEW ROUTE */}
                
                {/* 404 FALLBACK */}
                <Route path="*" element={<NotFound />} />
                </Routes>
                <EnhancedAIAssistant />
                <CookieConsent />
                <Toaster />
                <Sonner />
              </BrowserRouter>
            </EnhancedAuthProvider>
          </AuthProvider>
        </TooltipProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
