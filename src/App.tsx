import React, { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { EnhancedAuthProvider } from "./hooks/useEnhancedAuth";
import Index from "./pages/Index";
import EnhancedAIAssistant from "./components/EnhancedAIAssistant";
import CookieConsent from "./components/CookieConsent";

// Optional: Only import these if they exist in your project
// If you get import errors, comment these out
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { lazyPage } from "@/lib/lazyPage";

// Pages other than the home page load on demand, so visitors do not
// download the admin, portal and dashboard code up front
const About = lazyPage(() => import("./pages/About"));
const Team = lazyPage(() => import("./pages/Team"));
const Services = lazyPage(() => import("./pages/Services"));
const Contact = lazyPage(() => import("./pages/Contact"));
const GetStarted = lazyPage(() => import("./pages/GetStarted"));
const Portfolio = lazyPage(() => import("./pages/Portfolio"));
const PortfolioPage = lazyPage(() => import("./pages/PortfolioPage"));
const Privacy = lazyPage(() => import("./pages/Privacy"));
const Terms = lazyPage(() => import("./pages/Terms"));
const RemoteDevelopment = lazyPage(() => import("./pages/RemoteDevelopment"));
const AIMLServices = lazyPage(() => import("./pages/services/AIMLServices"));
const CADServices = lazyPage(() => import("./pages/services/CADServices"));
const BlockchainServices = lazyPage(() => import("./pages/services/BlockchainServices"));
const EngineeringTechnical = lazyPage(() => import("./pages/services/EngineeringTechnical"));
const GhanaDigitalHub = lazyPage(() => import("./pages/GhanaDigitalHub"));
const NotFound = lazyPage(() => import("./pages/NotFound"));
const BookConsultation = lazyPage(() => import("./pages/BookConsultation"));
const AdminDashboard = lazyPage(() => import("./pages/AdminDashboard"));
const Auth = lazyPage(() => import("./pages/Auth"));
const AuthConfirm = lazyPage(() => import("./pages/AuthConfirm"));
const PasswordReset = lazyPage(() => import("./pages/PasswordReset"));
const ClientPortal = lazyPage(() => import("./pages/ClientPortal"));
const Dashboard = lazyPage(() => import("./pages/Dashboard"));
const QuoteReview = lazyPage(() => import("./pages/QuoteReview"));
const ProjectManagerQuoteCreation = lazyPage(() => import("./pages/ProjectManagerQuoteCreation"));
const StaffDashboardPage = lazyPage(() => import("./pages/StaffDashboardPage"));
const Jarvis = lazyPage(() => import("./pages/Jarvis"));
const Platform = lazyPage(() => import("./pages/Platform"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <EnhancedAuthProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Suspense fallback={<PageFallback />}>
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
                <Route path="/ghana-digital-hub" element={<GhanaDigitalHub />} />
                
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

                {/* JARVIS ASSISTANT */}
                <Route path="/jarvis" element={<Jarvis />} />
                <Route path="/platform" element={<Platform />} />
                
                {/* ADMIN/PM ROUTES */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create-quote" element={<ProjectManagerQuoteCreation />} /> {/* NEW ROUTE */}
                
                {/* 404 FALLBACK */}
                <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
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
