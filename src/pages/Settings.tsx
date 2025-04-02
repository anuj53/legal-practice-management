
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Database, Users, FileText, User } from 'lucide-react';
import { CustomFieldsSettings } from '@/components/settings/CustomFieldsSettings';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('customFields');
  const navigate = useNavigate();
  
  const handleNavigateToAccount = () => {
    navigate('/account-settings');
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your organization settings and preferences."
      />

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-64 flex-shrink-0">
          <CardContent className="p-4">
            <div className="font-medium text-lg mb-4 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Settings</span>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('customFields')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'customFields' 
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>Custom Fields</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'users' 
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'general' 
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>General</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Account</span>
              </button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex-1">
          {activeTab === 'customFields' && <CustomFieldsSettings />}
          {activeTab === 'users' && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <p className="text-muted-foreground">User management settings will be implemented here.</p>
              </CardContent>
            </Card>
          )}
          {activeTab === 'general' && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">General Settings</h2>
                <p className="text-muted-foreground">General settings will be implemented here.</p>
              </CardContent>
            </Card>
          )}
          {activeTab === 'account' && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                <p className="text-muted-foreground mb-4">Manage your personal account settings and preferences.</p>
                
                <Button onClick={handleNavigateToAccount}>
                  Manage Account
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
