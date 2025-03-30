
import React, { useState } from 'react';
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
  Edit, 
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface TaskList {
  id: string;
  name: string;
  description: string;
  practiceArea: string;
  taskCount: number;
}

export function TaskListsView() {
  const [taskLists, setTaskLists] = useState<TaskList[]>([
    {
      id: '1',
      name: 'Client Onboarding',
      description: 'Standard onboarding process for new clients',
      practiceArea: 'Administration',
      taskCount: 5
    },
    {
      id: '2',
      name: 'Litigation Preparation',
      description: 'Tasks for preparing a litigation case',
      practiceArea: 'Litigation',
      taskCount: 8
    },
    {
      id: '3',
      name: 'Contract Review Process',
      description: 'Standard process for reviewing client contracts',
      practiceArea: 'Corporate Law',
      taskCount: 4
    },
    {
      id: '4',
      name: 'Real Estate Closing',
      description: 'Tasks for handling real estate closing',
      practiceArea: 'Real Estate',
      taskCount: 6
    }
  ]);

  const [previewList, setPreviewList] = useState<TaskList | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const handleDeleteList = (id: string) => {
    setTaskLists(taskLists.filter(list => list.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Task Lists</h2>
          <p className="text-gray-600">Create and manage templates for common tasks</p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task List
        </Button>
      </div>
      
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Task List</TableHead>
                <TableHead>Practice Area</TableHead>
                <TableHead className="text-center">Tasks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskLists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No task lists found. Create a new task list to get started.
                  </TableCell>
                </TableRow>
              ) : (
                taskLists.map((list) => (
                  <TableRow key={list.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{list.name}</span>
                        <span className="text-gray-500 text-sm">{list.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {list.practiceArea}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="rounded-full px-2.5">
                        {list.taskCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Preview tasks"
                          onClick={() => setPreviewList(list)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Edit list"
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
                            <DropdownMenuItem>
                              <Share className="h-4 w-4 mr-2" />
                              Assign List
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteConfirm(list.id)}>
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

      {/* Preview Task List Dialog */}
      <Dialog open={previewList !== null} onOpenChange={(open) => !open && setPreviewList(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewList?.name}</DialogTitle>
            <DialogDescription>
              {previewList?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Task Templates in this List</div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 p-3 border-b">
                <div className="col-span-6 font-medium text-sm">Task Name</div>
                <div className="col-span-2 font-medium text-sm">Priority</div>
                <div className="col-span-2 font-medium text-sm">Est. Time</div>
                <div className="col-span-2 font-medium text-sm">Due</div>
              </div>
              
              <div className="divide-y">
                {previewList && Array.from({ length: previewList.taskCount }).map((_, index) => (
                  <div key={index} className="grid grid-cols-12 p-3 items-center">
                    <div className="col-span-6">
                      <div className="font-medium">{`Task ${index + 1}`}</div>
                      <div className="text-xs text-gray-500">Description of task {index + 1}</div>
                    </div>
                    <div className="col-span-2">
                      {index % 3 === 0 ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700">High</Badge>
                      ) : index % 3 === 1 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Normal</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Low</Badge>
                      )}
                    </div>
                    <div className="col-span-2">
                      {`${(index + 1) * 15}m`}
                    </div>
                    <div className="col-span-2 text-sm">
                      {index === 0 ? 'Trigger date' : `${index} day${index > 1 ? 's' : ''} after Task 1`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button variant="outline" onClick={() => setPreviewList(null)}>
              Close
            </Button>
            <Button>
              View Full Details
            </Button>
            <Button variant="secondary">
              Assign List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task list? This action cannot be undone.
              Any task templates in this list will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  handleDeleteList(deleteConfirm);
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
