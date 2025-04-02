
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectGroup, SelectLabel, SelectItem, SelectValue, SelectTrigger, SelectContent, Select } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { WorkflowTemplate } from '@/types/workflow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckSquare, 
  FileEdit, 
  FileBox, 
  DollarSign, 
  FolderPlus,
  CircleX,
  ArrowUp,
  ArrowDown,
  BookmarkPlus,
  Save
} from 'lucide-react';

const formSchema = z.object({
  // Matter details tab
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  responsible_attorney_id: z.string().optional(),
  originating_attorney_id: z.string().optional(),
  practice_area: z.string().optional(),
  location: z.string().optional(),
  permissions: z.string().default('Everyone'),
  status: z.string().default('Open'),
  
  // Billing preferences tab
  billing_method: z.string().default('Hourly'),
  custom_rate: z.number().optional().nullable(),
  split_billing: z.boolean().default(false),
  budget: z.number().optional().nullable(),
  trust_notification: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface NewMatterTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateCreated: () => void;
}

export function NewMatterTemplateDialog({ 
  open, 
  onOpenChange,
  onTemplateCreated
}: NewMatterTemplateDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [documentFolders, setDocumentFolders] = useState<{ name: string; category: string }[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCategory, setNewFolderCategory] = useState('');
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflowTemplates, setSelectedWorkflowTemplates] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      responsible_attorney_id: '',
      originating_attorney_id: '',
      practice_area: '',
      location: '',
      permissions: 'Everyone',
      status: 'Open',
      billing_method: 'Hourly',
      custom_rate: null,
      split_billing: false,
      budget: null,
      trust_notification: false,
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name', { ascending: true });
        
      if (error) {
        console.error('Error fetching users:', error);
      } else if (data) {
        setUsers(data);
      }
    };

    const fetchWorkflowTemplates = async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Error fetching workflow templates:', error);
      } else if (data) {
        setWorkflowTemplates(data);
      }
    };

    fetchUsers();
    fetchWorkflowTemplates();
  }, []);

  const addDocumentFolder = () => {
    if (!newFolderName) return;
    
    setDocumentFolders([
      ...documentFolders, 
      { 
        name: newFolderName, 
        category: newFolderCategory 
      }
    ]);
    
    setNewFolderName('');
    setNewFolderCategory('');
  };

  const removeDocumentFolder = (index: number) => {
    const updatedFolders = [...documentFolders];
    updatedFolders.splice(index, 1);
    setDocumentFolders(updatedFolders);
  };

  const moveDocumentFolder = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === documentFolders.length - 1)
    ) return;
    
    const updatedFolders = [...documentFolders];
    const folder = updatedFolders[index];
    
    if (direction === 'up') {
      updatedFolders[index] = updatedFolders[index - 1];
      updatedFolders[index - 1] = folder;
    } else {
      updatedFolders[index] = updatedFolders[index + 1];
      updatedFolders[index + 1] = folder;
    }
    
    setDocumentFolders(updatedFolders);
  };

  const toggleWorkflowTemplate = (id: string) => {
    setSelectedWorkflowTemplates(prev => 
      prev.includes(id) 
        ? prev.filter(templateId => templateId !== id)
        : [...prev, id]
    );
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Insert the matter template
      const { data: templateData, error: templateError } = await supabase
        .from('matter_templates')
        .insert({
          name: values.name,
          description: values.description,
          responsible_attorney_id: values.responsible_attorney_id || null,
          originating_attorney_id: values.originating_attorney_id || null,
          practice_area: values.practice_area || null,
          location: values.location || null,
          permissions: values.permissions,
          status: values.status,
          organization_id: user?.organization_id || null
        })
        .select()
        .single();
        
      if (templateError) throw templateError;
      
      const templateId = templateData.id;
      
      // Insert billing preferences
      const { error: billingError } = await supabase
        .from('template_billing_preferences')
        .insert({
          template_id: templateId,
          billing_method: values.billing_method,
          custom_rate: values.custom_rate,
          split_billing: values.split_billing,
          budget: values.budget,
          trust_notification: values.trust_notification
        });
        
      if (billingError) throw billingError;
      
      // Insert document folders
      if (documentFolders.length > 0) {
        const foldersToInsert = documentFolders.map((folder, index) => ({
          template_id: templateId,
          name: folder.name,
          category: folder.category || null,
          position: index
        }));
        
        const { error: foldersError } = await supabase
          .from('template_document_folders')
          .insert(foldersToInsert);
          
        if (foldersError) throw foldersError;
      }
      
      // Insert task list associations
      if (selectedWorkflowTemplates.length > 0) {
        const taskListsToInsert = selectedWorkflowTemplates.map(workflowId => ({
          template_id: templateId,
          workflow_template_id: workflowId
        }));
        
        const { error: taskListsError } = await supabase
          .from('template_task_lists')
          .insert(taskListsToInsert);
          
        if (taskListsError) throw taskListsError;
      }
      
      toast({
        title: 'Template Created',
        description: 'Matter template has been created successfully.',
      });
      
      onTemplateCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating matter template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create matter template.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Matter Template</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex flex-1 overflow-hidden"
          >
            <div className="w-[200px] border-r pr-2">
              <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
                <TabsTrigger 
                  value="details" 
                  className="w-full justify-start"
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Matter Details
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="w-full justify-start"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Billing Preferences
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="w-full justify-start"
                >
                  <FileBox className="h-4 w-4 mr-2" />
                  Document Folders
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="w-full justify-start"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Task Lists
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                  <ScrollArea className="flex-1 px-6">
                    <TabsContent value="details" className="pt-4 space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter template name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter template description" 
                                className="resize-none" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="responsible_attorney_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsible Attorney</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select attorney" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Attorneys</SelectLabel>
                                    {users.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="originating_attorney_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Originating Attorney</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select attorney" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Attorneys</SelectLabel>
                                    {users.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="practice_area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Practice Area</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Corporate Law" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., New York" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Permissions</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select permissions" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Everyone">Everyone</SelectItem>
                                  <SelectItem value="Private">Private</SelectItem>
                                  <SelectItem value="Specific">Specific Users</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Open">Open</SelectItem>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="billing" className="pt-4 space-y-6">
                      <FormField
                        control={form.control}
                        name="billing_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Method</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select billing method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Hourly">Hourly</SelectItem>
                                <SelectItem value="FlatFee">Flat Fee</SelectItem>
                                <SelectItem value="Contingency">Contingency</SelectItem>
                                <SelectItem value="RetainerOnly">Retainer Only</SelectItem>
                                <SelectItem value="Pro Bono">Pro Bono</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="custom_rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Rate</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter custom rate" 
                                  {...field}
                                  value={field.value === null ? '' : field.value}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Enter budget" 
                                  {...field}
                                  value={field.value === null ? '' : field.value}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="documents" className="pt-4 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Document Folders</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-6">
                            <FormLabel>Folder Name</FormLabel>
                            <Input
                              placeholder="Enter folder name"
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-4">
                            <FormLabel>Category</FormLabel>
                            <Input
                              placeholder="Optional category"
                              value={newFolderCategory}
                              onChange={(e) => setNewFolderCategory(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2 flex items-end">
                            <Button
                              type="button"
                              onClick={addDocumentFolder}
                              disabled={!newFolderName}
                              className="w-full"
                            >
                              <FolderPlus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
                        
                        {documentFolders.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {documentFolders.map((folder, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{folder.name}</TableCell>
                                    <TableCell>{folder.category || '-'}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center space-x-1">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => moveDocumentFolder(index, 'up')}
                                          disabled={index === 0}
                                        >
                                          <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => moveDocumentFolder(index, 'down')}
                                          disabled={index === documentFolders.length - 1}
                                        >
                                          <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removeDocumentFolder(index)}
                                        >
                                          <CircleX className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="border rounded-md p-4 text-center text-muted-foreground">
                            No document folders added yet
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="tasks" className="pt-4 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Task Lists</h3>
                        
                        {workflowTemplates.length > 0 ? (
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Select</TableHead>
                                  <TableHead>Task List Name</TableHead>
                                  <TableHead>Practice Area</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {workflowTemplates.map((template) => (
                                  <TableRow key={template.id}>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        variant={selectedWorkflowTemplates.includes(template.id) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleWorkflowTemplate(template.id)}
                                      >
                                        {selectedWorkflowTemplates.includes(template.id) ? (
                                          <>
                                            <CheckSquare className="h-4 w-4 mr-1" /> Selected
                                          </>
                                        ) : (
                                          <>
                                            <BookmarkPlus className="h-4 w-4 mr-1" /> Select
                                          </>
                                        )}
                                      </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell>{template.practice_area || '-'}</TableCell>
                                    <TableCell className="truncate max-w-xs">
                                      {template.description || '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="border rounded-md p-4 text-center text-muted-foreground">
                            No workflow templates available. Create workflow templates first.
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </ScrollArea>
                  
                  <div className="flex items-center justify-between p-6 border-t">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      {activeTab !== 'details' && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const tabOrder = ['details', 'billing', 'documents', 'tasks'];
                            const currentIndex = tabOrder.indexOf(activeTab);
                            if (currentIndex > 0) {
                              setActiveTab(tabOrder[currentIndex - 1]);
                            }
                          }}
                        >
                          Previous
                        </Button>
                      )}
                      
                      {activeTab !== 'tasks' ? (
                        <Button 
                          type="button"
                          onClick={() => {
                            const tabOrder = ['details', 'billing', 'documents', 'tasks'];
                            const currentIndex = tabOrder.indexOf(activeTab);
                            if (currentIndex < tabOrder.length - 1) {
                              setActiveTab(tabOrder[currentIndex + 1]);
                            }
                          }}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button 
                          type="submit"
                          disabled={isSubmitting}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSubmitting ? 'Saving...' : 'Save Template'}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
