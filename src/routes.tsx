
import React from 'react';
import { createHashRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import Index from '@/pages/Index';
import Calendar from '@/pages/Calendar';
import Tasks from '@/pages/Tasks';
import Contacts from '@/pages/Contacts';
import ContactDetail from '@/pages/ContactDetail';
import ContactEdit from '@/pages/ContactEdit';
import AccountSettings from '@/pages/AccountSettings';
import WorkflowTemplates from '@/pages/WorkflowTemplates';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import { AuthRoute } from '@/components/auth/AuthRoute';
import CustomFieldsSettingsPage from '@/pages/CustomFieldsSettingsPage';

const router = createHashRouter([
  {
    path: '/',
    element: <AuthRoute><MainLayout /></AuthRoute>,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'contacts', element: <Contacts /> },
      { path: 'contacts/:id', element: <ContactDetail /> },
      { path: 'contacts/:id/edit', element: <ContactEdit /> },
      { path: 'templates', element: <WorkflowTemplates /> },
      { path: 'settings', element: <AccountSettings /> },
      { path: 'settings/custom-fields', element: <CustomFieldsSettingsPage /> },
    ],
  },
  {
    path: '/auth',
    element: <Auth />,
  }
]);

export default router;
