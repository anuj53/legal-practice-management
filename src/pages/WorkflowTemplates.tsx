
import React from 'react';
import { Link } from 'react-router-dom';
import { WorkflowTemplatesView } from '@/components/tasks/WorkflowTemplatesView';
import { TaskTypeProvider } from '@/contexts/TaskTypeContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

export default function WorkflowTemplates() {
  return (
    <TaskTypeProvider>
      <div className="container py-6">
        <div className="flex flex-col space-y-6">
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link to="/tasks" className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Tasks
                </Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Workflow Templates</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <WorkflowTemplatesView />
        </div>
      </div>
    </TaskTypeProvider>
  );
}
