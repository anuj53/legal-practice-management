
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

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="yorpro-theme">
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<AuthRoute><MainLayout /></AuthRoute>}>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
