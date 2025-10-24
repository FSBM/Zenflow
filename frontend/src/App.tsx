import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Compute basename from Vite's BASE_URL so dev (/) works and production
          builds using VITE_BASE (for example "/frontend/") also work. */}
      {
        // import.meta.env.BASE_URL is provided by Vite and equals the `base`
        // config used when building. In dev it's usually '/'. We normalize it
        // and pass `undefined` to BrowserRouter for the default root behavior.
      }
      {(() => {
        const b = import.meta.env.BASE_URL as string | undefined;
        const normalized = b && b !== "/" ? b.replace(/\/$/, "") : undefined;
        return <BrowserRouter basename={normalized}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/inbox" element={<Inbox />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>;
      })()}
      
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
