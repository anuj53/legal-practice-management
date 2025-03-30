
export interface Task {
  id: string;
  name: string;
  description: string | null;
  priority: 'High' | 'Normal' | 'Low' | string;
  status: 'Pending' | 'In Progress' | 'In Review' | 'Completed' | 'Overdue' | string;
  assigned_to: string;
  is_private: boolean;
  task_type: string | null;
  time_estimate: string | null;
  matter_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}
