
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowUp, ArrowDown, Edit, ListChecks, Plus, Trash2 } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';
import { useTaskTypes, TaskType } from '@/contexts/TaskTypeContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TaskTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskTypeDialog({ open, onOpenChange }: TaskTypeDialogProps) {
  const { taskTypes, setTaskTypes } = useTaskTypes();
  
  const [newTaskType, setNewTaskType] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState<TaskType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{id: string, active: boolean} | null>(null);
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);

  const handleAddType = () => {
    if (newTaskType.trim()) {
      const newType = { 
        id: Date.now().toString(), 
        name: newTaskType, 
        active: true 
      };
      
      setTaskTypes(prevTypes => [...prevTypes, newType]);
      setNewTaskType('');
      setShowAddForm(false);
      
      toast({
        title: "Task Type Added",
        description: `${newTaskType} has been added as a task type.`,
      });

      // Highlight the new row briefly
      setHighlightedRow(newType.id);
      setTimeout(() => setHighlightedRow(null), 2000);
    }
  };

  const handleUpdateType = () => {
    if (editingType && editingType.name.trim()) {
      setTaskTypes(prevTypes =>
        prevTypes.map(type => 
          type.id === editingType.id 
            ? { ...type, name: editingType.name } 
            : type
        )
      );
      
      toast({
        title: "Task Type Updated",
        description: `Task type has been renamed to ${editingType.name}.`,
      });
      
      // Highlight the updated row briefly
      setHighlightedRow(editingType.id);
      setTimeout(() => setHighlightedRow(null), 2000);
      setEditingType(null);
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setTaskTypes(prevTypes =>
      prevTypes.map(type => 
        type.id === id ? { ...type, active } : type
      )
    );
    setToggleConfirm(null);
    
    toast({
      title: active ? "Task Type Enabled" : "Task Type Disabled",
      description: `Task type has been ${active ? "enabled" : "disabled"}.`,
    });
    
    // Highlight the toggled row briefly
    setHighlightedRow(id);
    setTimeout(() => setHighlightedRow(null), 2000);
  };

  const handleDeleteType = (id: string) => {
    const typeToDelete = taskTypes.find(type => type.id === id);
    if (typeToDelete) {
      setTaskTypes(prevTypes => prevTypes.filter(type => type.id !== id));
      setDeleteConfirm(null);
      
      toast({
        title: "Task Type Deleted",
        description: `${typeToDelete.name} has been deleted.`,
      });
    }
  };

  const moveTypeUp = (index: number) => {
    if (index <= 0) return;
    setTaskTypes(prevTypes => {
      const newTypes = [...prevTypes];
      [newTypes[index], newTypes[index - 1]] = [newTypes[index - 1], newTypes[index]];
      const movedType = newTypes[index - 1];
      
      // Highlight the moved row briefly
      setHighlightedRow(movedType.id);
      setTimeout(() => setHighlightedRow(null), 2000);
      
      return newTypes;
    });
    
    toast({
      title: "Task Type Moved",
      description: "Task type has been moved up.",
    });
  };

  const moveTypeDown = (index: number) => {
    if (index >= taskTypes.length - 1) return;
    setTaskTypes(prevTypes => {
      const newTypes = [...prevTypes];
      [newTypes[index], newTypes[index + 1]] = [newTypes[index + 1], newTypes[index]];
      const movedType = newTypes[index + 1];
      
      // Highlight the moved row briefly
      setHighlightedRow(movedType.id);
      setTimeout(() => setHighlightedRow(null), 2000);
      
      return newTypes;
    });
    
    toast({
      title: "Task Type Moved",
      description: "Task type has been moved down.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showAddForm) {
        handleAddType();
      } else if (editingType) {
        handleUpdateType();
      }
    } else if (e.key === 'Escape') {
      if (showAddForm) {
        setShowAddForm(false);
        setNewTaskType('');
      } else if (editingType) {
        setEditingType(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 mb-4 border-b">
          <DialogTitle className="text-xl flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-yorpro-600" />
            Manage Task Types
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
            Create, manage, and reorder types of tasks for better organization.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {showAddForm ? (
            <div className="border rounded-lg p-5 mb-6 bg-gradient-to-r from-gray-50 to-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="new-task-type" className="text-sm font-medium text-gray-800">
                  Add New Task Type
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskType('');
                  }}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="new-task-type"
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value)}
                  placeholder="Enter task type name"
                  className="focus:ring-2 focus:ring-yorpro-500 focus:border-yorpro-500"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
                <Button 
                  onClick={handleAddType} 
                  variant="default"
                  className="bg-gradient-to-r from-yorpro-600 to-yorpro-500 hover:from-yorpro-700 hover:to-yorpro-600 transition-all"
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Press Enter to save or Escape to cancel
              </p>
            </div>
          ) : editingType ? (
            <div className="border rounded-lg p-5 mb-6 bg-gradient-to-r from-gray-50 to-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="edit-task-type" className="text-sm font-medium text-gray-800">
                  Edit Task Type
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingType(null)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="edit-task-type"
                  value={editingType.name}
                  onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                  placeholder="Enter task type name"
                  className="focus:ring-2 focus:ring-yorpro-500 focus:border-yorpro-500"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
                <Button 
                  onClick={handleUpdateType} 
                  variant="default"
                  className="bg-gradient-to-r from-yorpro-600 to-yorpro-500 hover:from-yorpro-700 hover:to-yorpro-600 transition-all"
                >
                  Update
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Press Enter to save or Escape to cancel
              </p>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {taskTypes.length === 0 
                  ? "No task types found. Add one to get started."
                  : `${taskTypes.length} task type${taskTypes.length !== 1 ? 's' : ''} available`}
              </p>
              <Button 
                onClick={() => setShowAddForm(true)} 
                size="sm"
                variant="default"
                className="bg-gradient-to-r from-yorpro-600 to-yorpro-500 hover:from-yorpro-700 hover:to-yorpro-600 transition-all shadow-sm hover:shadow-md"
                disabled={showAddForm}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Task Type
              </Button>
            </div>
          )}

          {taskTypes.length === 0 && !showAddForm ? (
            <div className="border border-dashed rounded-lg py-10 px-6 text-center text-gray-500 bg-gray-50/30">
              <div className="flex flex-col items-center gap-3">
                <ListChecks className="h-12 w-12 text-gray-400" />
                <div className="space-y-2">
                  <p className="font-medium">No task types yet</p>
                  <p className="text-sm">Task types help categorize your tasks in the Kanban board view</p>
                  <Button 
                    onClick={() => setShowAddForm(true)} 
                    variant="outline" 
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add your first task type
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-white">
                  <TableRow>
                    <TableHead className="w-[50%] font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="w-[20%] text-center font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="w-[30%] text-right font-semibold text-gray-700 pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskTypes.map((type, index) => (
                    <TableRow 
                      key={type.id} 
                      className={`group ${highlightedRow === type.id ? 'bg-yorpro-50' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <TableCell className="font-medium py-3">{type.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={type.active}
                              onCheckedChange={() => setToggleConfirm({ id: type.id, active: !type.active })}
                              className="data-[state=checked]:bg-yorpro-600"
                            />
                            <span className={`text-sm ${type.active ? 'text-green-600' : 'text-gray-400'}`}>
                              {type.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => moveTypeUp(index)}
                            disabled={index === 0}
                            title="Move Up"
                            className="h-8 w-8 text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => moveTypeDown(index)}
                            disabled={index === taskTypes.length - 1}
                            title="Move Down"
                            className="h-8 w-8 text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingType(type)}
                            title="Edit"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteConfirm(type.id)}
                            title="Delete"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full sm:w-auto hover:bg-gray-100">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      
      <AlertDialog 
        open={toggleConfirm !== null} 
        onOpenChange={() => setToggleConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleConfirm?.active ? 'Enable' : 'Disable'} Task Type
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleConfirm?.active 
                ? 'This task type will be available for selection when creating new tasks.'
                : 'This task type will no longer be available for selection when creating new tasks. Existing tasks with this type will not be affected.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (toggleConfirm) {
                  handleToggleActive(toggleConfirm.id, toggleConfirm.active);
                }
              }}
              className={toggleConfirm?.active ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}
            >
              {toggleConfirm?.active ? 'Enable' : 'Disable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={deleteConfirm !== null} 
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task type? This action cannot be undone.
              Any tasks using this type will keep it, but you won't be able to select it for new tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deleteConfirm) {
                  handleDeleteType(deleteConfirm);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
