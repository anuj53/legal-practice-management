
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileEdit, 
  Trash2, 
  Star,
  CheckSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MatterTemplate } from '@/types/matter';
import { NewMatterTemplateDialog } from './NewMatterTemplateDialog';

export function MatterTemplatesView() {
  const [templates, setTemplates] = useState<MatterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matter_templates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching matter templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load matter templates',
          variant: 'destructive',
        });
      } else {
        setTemplates(data as MatterTemplate[] || []);
      }
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.description?.toLowerCase().includes(search.toLowerCase()) ||
    template.practice_area?.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleSetDefault = async (id: string) => {
    try {
      // First, remove default from any existing default template
      await supabase
        .from('matter_templates')
        .update({ is_default: false })
        .eq('is_default', true);
      
      // Then set the new default template
      const { error } = await supabase
        .from('matter_templates')
        .update({ is_default: true })
        .eq('id', id);
        
      if (error) throw error;
      
      await fetchTemplates(); // Refresh the list
      
      toast({
        title: 'Default Template Updated',
        description: 'The default matter template has been updated successfully.',
      });
    } catch (error) {
      console.error('Error setting default template:', error);
      toast({
        title: 'Error',
        description: 'Failed to set default template',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('matter_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state to remove the deleted template
      setTemplates(templates.filter(template => template.id !== id));
      
      toast({
        title: 'Template Deleted',
        description: 'The matter template has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };
  
  const handleEditTemplate = (id: string) => {
    navigate(`/matter-templates/${id}/edit`);
  };
  
  const handleViewTemplate = (id: string) => {
    navigate(`/matter-templates/${id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Matter Templates" 
        description="Create and manage templates for your legal matters"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        }
      />
      
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="w-full bg-background pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matter Templates</CardTitle>
          <CardDescription>
            Templates that can be used to create new matters quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground mt-1">
                {search ? "Try a different search term" : "Create your first template to get started"}
              </p>
              {!search && (
                <Button onClick={() => setDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Practice Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow 
                    key={template.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewTemplate(template.id)}
                  >
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.practice_area || '-'}</TableCell>
                    <TableCell>{template.status || 'Open'}</TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(template.id)}
                          className={template.is_default ? "text-yellow-500" : "text-muted-foreground"}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTemplate(template.id)}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this template? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <NewMatterTemplateDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onTemplateCreated={fetchTemplates} 
      />
    </div>
  );
}
