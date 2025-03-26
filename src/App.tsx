
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layouts/MainLayout";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a new QueryClient instance within the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/matters" element={<NotFound />} />
              <Route path="/contracts" element={<NotFound />} />
              <Route path="/activities" element={<NotFound />} />
              <Route path="/billing" element={<NotFound />} />
              <Route path="/payments" element={<NotFound />} />
              <Route path="/accounts" element={<NotFound />} />
              <Route path="/documents" element={<NotFound />} />
              <Route path="/communications" element={<NotFound />} />
              <Route path="/reports" element={<NotFound />} />
              <Route path="/integrations" element={<NotFound />} />
              <Route path="/settings" element={<NotFound />} />
            </Route>
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
