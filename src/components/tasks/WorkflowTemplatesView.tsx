import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Eye, 
  MoreHorizontal, 
  Pencil, 
  Plus, 
  Share, 
  Trash2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NewWorkflowTemplateDialog } from './NewWorkflowTemplateDialog';
import { EditWorkflowTemplateDialog } from './EditWorkflowTemplateDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WorkflowTemplateDetailView } from './WorkflowTemplateDetailView';
import { WorkflowTemplate, TaskTemplate } from '@/types/workflow';
import { AssignWorkflowDialog } from './AssignWorkflowDialog';

export function WorkflowTemplatesView() {
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [editTemplateData, setEditTemplateData] = useState<WorkflowTemplate | null>(null);
  const [detailViewId, setDetailViewId] = useState<string | null>(null);
  const [assignWorkflowId, setAssignWorkflowId] = useState<string | null>(null);
  const [workflowTasks, setWorkflowTasks] = useState<TaskTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const { toast } = useToast();
  
  const fetchWorkflowTemplates = async () => {
    setIsLoading(true);
    try {
      const { data: templates, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const templatesWithTaskCounts = await Promise.all(
        templates.map(async (template) => {
          const { count, error: countError } = await supabase
            .from('task_templates')
            .select('*', { count: 'exact', head: true })
            .eq('workflow_id', template.id);
          
          return {
            ...template,
            taskCount: count || 0
          };
        })
      );
      
      setWorkflowTemplates(templatesWithTaskCounts);
    } catch (error) {
      console.error('Error fetching workflow templates:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow templates.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkflowTemplates();
  }, []);
  
  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setWorkflowTemplates(templates => templates.filter(template => template.id !== id));
      setDeleteConfirm(null);
      
      toast({
        title: "Workflow Template Deleted",
        description: "Workflow template has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting workflow template:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow template.",
        variant: "destructive"
      });
    }
  };
  
  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (templateError) throw templateError;
      
      const { data: newTemplate, error: createError } = await supabase
        .from('workflow_templates')
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          practice_area: template.practice_area
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      const { data: tasks, error: tasksError } = await supabase
        .from('task_templates')
        .select('*')
        .eq('workflow_id', templateId);
      
      if (tasksError) throw tasksError;
      
      if (tasks && tasks.length > 0) {
        const taskMappings: Record<string, string> = {};
        
        for (const task of tasks) {
          const { data: newTask, error: newTaskError } = await supabase
            .from('task_templates')
            .insert({
              workflow_id: newTemplate.id,
              name: task.name,
              description: task.description,
              priority: task.priority,
              is_private: task.is_private,
              task_type: task.task_type,
              time_estimate: task.time_estimate,
              default_assignee: task.default_assignee,
              due_date_type: task.due_date_type,
              due_date_offset: task.due_date_offset,
              position: task.position
            })
            .select()
            .single();
          
          if (newTaskError) throw newTaskError;
          
          taskMappings[task.id] = newTask.id;
        }
        
        for (const task of tasks) {
          if (task.depends_on_task_id) {
            const newDependsOnId = taskMappings[task.depends_on_task_id];
            if (newDependsOnId) {
              await supabase
                .from('task_templates')
                .update({ depends_on_task_id: newDependsOnId })
                .eq('id', taskMappings[task.id]);
            }
          }
        }
      }
      
      fetchWorkflowTemplates();
      
      toast({
        title: "Workflow Template Duplicated",
        description: "A copy of the workflow template has been created.",
      });
    } catch (error) {
      console.error('Error duplicating workflow template:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate workflow template.",
        variant: "destructive"
      });
    }
  };
  
  const handleViewDetails = (id: string) => {
    setDetailViewId(id);
  };
  
  const handleTemplateCreated = (id: string) => {
    fetchWorkflowTemplates();
    setDetailViewId(id);
  };
  
  const handleEditTemplate = (template: WorkflowTemplate) => {
    setEditTemplateData(template);
  };

  const handleAssignWorkflow = async (template: WorkflowTemplate) => {
    try {
      const { data: tasks, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('workflow_id', template.id)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      setWorkflowTasks(tasks || []);
      setSelectedWorkflow(template);
      setAssignWorkflowId(template.id);
    } catch (error) {
      console.error('Error fetching workflow tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow tasks.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Workflow Templates</h2>
          <p className="text-gray-600">Create and manage templates for common workflow tasks</p>
        </div>
        
        <Button onClick={() => setIsNewTemplateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow Template
        </Button>
      </div>
      
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Workflow Template</TableHead>
                <TableHead>Practice Area</TableHead>
                <TableHead className="text-center">Tasks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Loading workflow templates...
                  </TableCell>
                </TableRow>
              ) : workflowTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No workflow templates found. Create a new workflow template to get started.
                  </TableCell>
                </TableRow>
              ) : (
                workflowTemplates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{template.name}</span>
                        <span className="text-gray-500 text-sm">{template.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {template.practice_area ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                          {template.practice_area}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="rounded-full px-2.5">
                        {template.taskCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="View details"
                          onClick={() => handleViewDetails(template.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Edit template"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAssignWorkflow(template)}>
                              <Share className="h-4 w-4 mr-2" />
                              Assign Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteConfirm(template.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewWorkflowTemplateDialog 
        open={isNewTemplateOpen} 
        onOpenChange={setIsNewTemplateOpen}
        onSuccess={handleTemplateCreated}
      />

      {editTemplateData && (
        <EditWorkflowTemplateDialog
          open={!!editTemplateData}
          onOpenChange={(open) => {
            if (!open) setEditTemplateData(null);
          }}
          onSuccess={fetchWorkflowTemplates}
          template={editTemplateData}
        />
      )}

      {assignWorkflowId && (
        <AssignWorkflowDialog
          open={!!assignWorkflowId}
          onOpenChange={(open) => {
            if (!open) setAssignWorkflowId(null);
          }}
          workflowId={assignWorkflowId}
          workflowName={selectedWorkflow?.name}
          tasks={workflowTasks}
        />
      )}

      {detailViewId && (
        <WorkflowTemplateDetailView
          templateId={detailViewId}
          open={!!detailViewId}
          onOpenChange={(open) => {
            if (!open) {
              setDetailViewId(null);
              fetchWorkflowTemplates();
            }
          }}
        />
      )}

      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow template? This action cannot be undone.
              Any task templates in this workflow will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  handleDeleteTemplate(deleteConfirm);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
