
import React from 'react';
import { Check } from 'lucide-react';

interface CalendarCheckboxProps {
  id: string;
  name: string;
  color: string;
  checked: boolean;
  category: 'my' | 'other';
  onClick: (id: string, category: 'my' | 'other') => void;
}

export function CalendarCheckbox({ id, name, color, checked, category, onClick }: CalendarCheckboxProps) {
  return (
    <div 
      className="flex items-center space-x-2 py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer"
      onClick={() => onClick(id, category)}
    >
      <div 
        className="flex items-center justify-center h-4 w-4 rounded-sm border"
        style={{ 
          backgroundColor: checked ? color : 'transparent',
          borderColor: color 
        }}
      >
        {checked && (
          <Check className="h-3 w-3 text-white" />
        )}
      </div>
      <span className="text-sm flex-1 truncate">{name}</span>
    </div>
  );
}
