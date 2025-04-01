
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { toast } from 'sonner';

/**
 * Creates a new task in the database
 */
export async function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  console.log('Creating task with data:', taskData);
  
  // Add timestamps
  const data = {
    ...taskData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Insert the task into the tasks table
  const { data: insertedTask, error } = await supabase
    .from('tasks')
    .insert(data)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw new Error(`Failed to create task: ${error.message}`);
  }
  
  console.log('Task created successfully:', insertedTask);
  return insertedTask as Task;
}

/**
 * Fetches a list of tasks from the database
 */
export async function fetchTasks(): Promise<Task[]> {
  console.log('Fetching tasks from database');
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }
  
  console.log('Tasks fetched successfully:', data);
  return data as Task[];
}

/**
 * Updates an existing task in the database
 */
export async function updateTask(taskId: string, taskData: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> {
  // Always update the updated_at timestamp
  const data = {
    ...taskData,
    updated_at: new Date().toISOString(),
  };
  
  const { data: updatedTask, error } = await supabase
    .from('tasks')
    .update(data)
    .eq('id', taskId)
    .select('*')
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    throw new Error(`Failed to update task: ${error.message}`);
  }
  
  return updatedTask as Task;
}

/**
 * Deletes a task from the database
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(`Failed to delete task: ${error.message}`);
  }
}
