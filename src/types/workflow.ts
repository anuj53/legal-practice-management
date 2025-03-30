
// Type definitions for workflow templates and related components

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  practice_area: string | null;
  created_at: string;
  taskCount?: number;
}

export interface TaskTemplate {
  id: string;
  workflow_id: string;
  name: string;
  description: string | null;
  priority: 'High' | 'Normal' | 'Low';
  is_private: boolean;
  task_type: string | null;
  time_estimate: string | null;
  default_assignee: string | null;
  due_date_type: 'trigger_date' | 'after_task' | 'specific_date';
  due_date_offset: number;
  depends_on_task_id: string | null;
  position: number;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_alias: string | null;
  created_at?: string;
}
