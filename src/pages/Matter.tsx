
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FilePlus } from 'lucide-react';
import { MatterListView } from '@/components/matter/MatterListView';
import { MatterTemplatesView } from '@/components/matter/MatterTemplatesView';
import { MatterPipelineView } from '@/components/matter/MatterPipelineView';

export default function Matter() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.state?.activeTab || "list";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update activeTab when location state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleNewMatter = () => {
    navigate('/matter-templates/new');
  };

  return (
    <div className="container py-6">
      <PageHeader
        title="Matters"
        description="Manage your legal cases and matters"
        actions={
          <Button onClick={handleNewMatter}>
            <FilePlus className="mr-2 h-4 w-4" />
            New Matter
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="list">Matter List</TabsTrigger>
            <TabsTrigger value="templates">Matter Templates</TabsTrigger>
            <TabsTrigger value="pipeline">Matter Pipeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <MatterListView />
          </TabsContent>
          
          <TabsContent value="templates">
            <MatterTemplatesView />
          </TabsContent>
          
          <TabsContent value="pipeline">
            <MatterPipelineView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
