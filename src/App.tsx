import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import GetStarted from "./pages/GetStarted";
import Portfolio from "./pages/Portfolio";
import Privacy from "./pages/Privacy"; // Add this import
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import BookConsultation from "./pages/BookConsultation";
import AIAssistant from "./components/AIAssistant";
import CookieConsent from "./components/CookieConsent"; // Add this import

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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/privacy" element={<Privacy />} /> {/* Add this route */}
            <Route path="/terms" element={<Terms />} /> {/* Add this line */}
            <Route path="/book-consultation" element={<BookConsultation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AIAssistant />
          <CookieConsent /> {/* Add this component */}
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
