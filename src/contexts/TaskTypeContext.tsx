
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TaskType {
  id: string;
  name: string;
  active: boolean;
}

interface TaskTypeContextType {
  taskTypes: TaskType[];
  setTaskTypes: React.Dispatch<React.SetStateAction<TaskType[]>>;
}

const defaultTaskTypes: TaskType[] = [
  { id: '1', name: 'Onboarding', active: true },
  { id: '2', name: 'Documentation', active: true },
  { id: '3', name: 'Follow Up', active: true },
  { id: '4', name: 'Meeting', active: true },
  { id: '5', name: 'Invoicing', active: true },
];

const TaskTypeContext = createContext<TaskTypeContextType | undefined>(undefined);

export function TaskTypeProvider({ children }: { children: React.ReactNode }) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(defaultTaskTypes);

  return (
    <TaskTypeContext.Provider value={{ taskTypes, setTaskTypes }}>
      {children}
    </TaskTypeContext.Provider>
  );
}

export function useTaskTypes() {
  const context = useContext(TaskTypeContext);
  if (context === undefined) {
    throw new Error('useTaskTypes must be used within a TaskTypeProvider');
  }
  return context;
}
