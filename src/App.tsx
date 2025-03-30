
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Calendar from '@/pages/Calendar';
import Auth from '@/pages/Auth';
import Tasks from '@/pages/Tasks';
import { AuthRoute } from './components/auth/AuthRoute';
import { AuthProvider } from './hooks/useAuth';

function App() {
  // Development bypass option - remove in production
  const bypassAuth = new URLSearchParams(window.location.search).get('bypass') === 'true';
  const AuthWrapper = bypassAuth 
    ? ({ children }: { children: React.ReactNode }) => <>{children}</> 
    : AuthRoute;

  return (
    <ThemeProvider defaultTheme="light" storageKey="legalpm-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<AuthWrapper><MainLayout /></AuthWrapper>}>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
