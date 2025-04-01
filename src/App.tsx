
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Calendar from '@/pages/Calendar';
import Auth from '@/pages/Auth';
import Tasks from '@/pages/Tasks';
import Contacts from '@/pages/Contacts';
import ContactDetail from '@/pages/ContactDetail';
import WorkflowTemplates from '@/pages/WorkflowTemplates';
import AccountSettings from '@/pages/AccountSettings';
import { AuthRoute } from './components/auth/AuthRoute';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="yorpro-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<AuthRoute><MainLayout /></AuthRoute>}>
              <Route path="/" element={<Index />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
              <Route path="/workflow-templates" element={<WorkflowTemplates />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/matter" element={<NotFound />} />
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
