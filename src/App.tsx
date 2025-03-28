
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layouts/MainLayout";
import { AuthProvider } from "./hooks/useAuth";
import { AuthRoute } from "./components/auth/AuthRoute";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a new QueryClient instance within the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Use only one toast system at a time - in this case we'll use Sonner */}
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth page (public) */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route element={
                <AuthRoute>
                  <MainLayout />
                </AuthRoute>
              }>
                <Route path="/" element={<Index />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/tasks" element={<NotFound />} />
                <Route path="/matter" element={<NotFound />} />
                <Route path="/contacts" element={<NotFound />} />
                <Route path="/activities" element={<NotFound />} />
                <Route path="/documents" element={<NotFound />} />
                <Route path="/interactions" element={<NotFound />} />
                <Route path="/billings" element={<NotFound />} />
                <Route path="/reports" element={<NotFound />} />
                <Route path="/leads" element={<NotFound />} />
                <Route path="/intake-form" element={<NotFound />} />
                <Route path="/workflows" element={<NotFound />} />
                <Route path="/settings" element={<NotFound />} />
                <Route path="/appearance" element={<NotFound />} />
              </Route>
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
