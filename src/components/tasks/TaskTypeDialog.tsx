
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
import { Edit, Plus, Trash2 } from 'lucide-react';
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

interface TaskTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TaskType {
  id: string;
  name: string;
  active: boolean;
}

export function TaskTypeDialog({ open, onOpenChange }: TaskTypeDialogProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([
    { id: '1', name: 'Onboarding', active: true },
    { id: '2', name: 'Documentation', active: true },
    { id: '3', name: 'Follow Up', active: true },
    { id: '4', name: 'Meeting', active: true },
    { id: '5', name: 'Invoicing', active: true },
  ]);
  
  const [newTaskType, setNewTaskType] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState<TaskType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toggleConfirm, setToggleConfirm] = useState<{id: string, active: boolean} | null>(null);

  const handleAddType = () => {
    if (newTaskType.trim()) {
      setTaskTypes([
        ...taskTypes,
        { id: Date.now().toString(), name: newTaskType, active: true }
      ]);
      setNewTaskType('');
      setShowAddForm(false);
    }
  };

  const handleUpdateType = () => {
    if (editingType && editingType.name.trim()) {
      setTaskTypes(
        taskTypes.map(type => 
          type.id === editingType.id 
            ? { ...type, name: editingType.name } 
            : type
        )
      );
      setEditingType(null);
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    setTaskTypes(
      taskTypes.map(type => 
        type.id === id ? { ...type, active } : type
      )
    );
    setToggleConfirm(null);
  };

  const handleDeleteType = (id: string) => {
    setTaskTypes(taskTypes.filter(type => type.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Task Types</DialogTitle>
          <DialogDescription>
            Create and manage types of tasks for better organization.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Task Types</h3>
          <Button 
            onClick={() => setShowAddForm(true)} 
            size="sm"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task Type
          </Button>
        </div>

        {showAddForm && (
          <div className="border rounded-md p-4 mb-4">
            <Label htmlFor="new-task-type">New Task Type</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="new-task-type"
                value={newTaskType}
                onChange={(e) => setNewTaskType(e.target.value)}
                placeholder="Enter task type name"
              />
              <Button onClick={handleAddType}>Save</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {editingType && (
          <div className="border rounded-md p-4 mb-4">
            <Label htmlFor="edit-task-type">Edit Task Type</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="edit-task-type"
                value={editingType.name}
                onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                placeholder="Enter task type name"
              />
              <Button onClick={handleUpdateType}>Save</Button>
              <Button variant="outline" onClick={() => setEditingType(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-md overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-3 border-b">
            <div className="col-span-8 font-medium text-sm">Name</div>
            <div className="col-span-2 font-medium text-sm text-center">Status</div>
            <div className="col-span-2 font-medium text-sm text-center">Actions</div>
          </div>
          
          <div className="divide-y">
            {taskTypes.length === 0 ? (
              <div className="py-4 px-3 text-center text-gray-500">
                No task types found. Add a new type to get started.
              </div>
            ) : (
              taskTypes.map((type) => (
                <div key={type.id} className="grid grid-cols-12 p-3 items-center">
                  <div className="col-span-8">{type.name}</div>
                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={type.active}
                      onCheckedChange={() => setToggleConfirm({ id: type.id, active: !type.active })}
                    />
                  </div>
                  <div className="col-span-2 flex justify-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setEditingType(type)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteConfirm(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Confirmation dialog for disabling/enabling task type */}
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
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog for deleting task type */}
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
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
