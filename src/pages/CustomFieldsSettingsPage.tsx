
import React from 'react';
import { CustomFieldsSettings } from '@/components/settings/CustomFieldsSettings';
import { PageHeader } from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';

export default function CustomFieldsSettingsPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title="Custom Fields Settings"
        description="Manage custom fields and field sets for contacts, matters, and tasks"
        icon={<Settings className="h-6 w-6" />}
      />
      <Separator className="my-6" />
      
      <CustomFieldsSettings />
    </div>
  );
}
