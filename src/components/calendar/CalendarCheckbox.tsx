
import React from 'react';
import { Check, Edit } from 'lucide-react';

interface CalendarCheckboxProps {
  id: string;
  name: string;
  color: string;
  checked: boolean;
  category: 'my' | 'other';
  onClick: (id: string, category: 'my' | 'other') => void;
  onEdit?: () => void;
}

export function CalendarCheckbox({ 
  id, 
  name, 
  color, 
  checked, 
  category, 
  onClick, 
  onEdit 
}: CalendarCheckboxProps) {
  return (
    <div className="flex items-center space-x-2 py-1.5 px-2 hover:bg-gray-100 rounded">
      <div 
        className="flex items-center justify-center h-4 w-4 rounded-sm border cursor-pointer"
        style={{ 
          backgroundColor: checked ? color : 'transparent',
          borderColor: color 
        }}
        onClick={() => onClick(id, category)}
      >
        {checked && (
          <Check className="h-3 w-3 text-white" />
        )}
      </div>
      <span className="text-sm flex-1 truncate">{name}</span>
      {onEdit && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Edit className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
