
import React from 'react';
import { WorkflowTemplatesView } from '@/components/tasks/WorkflowTemplatesView';
import { TaskTypeProvider } from '@/contexts/TaskTypeContext';

export default function WorkflowTemplates() {
  return (
    <TaskTypeProvider>
      <div className="container py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workflow Templates</h1>
              <p className="text-gray-600 mt-1">Create and manage templates for common workflow tasks</p>
            </div>
          </div>
          
          <WorkflowTemplatesView />
        </div>
      </div>
    </TaskTypeProvider>
  );
}
