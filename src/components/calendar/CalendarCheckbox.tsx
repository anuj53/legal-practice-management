
import React from 'react';
import { Edit } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

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
  const handleCheckboxChange = () => {
    onClick(id, category);
  };

  return (
    <div className="flex items-center space-x-2 py-1.5 px-2 hover:bg-gray-100 rounded">
      <div className="flex items-center">
        <div 
          className="h-4 w-4 rounded-sm cursor-pointer flex items-center justify-center"
          style={{ 
            backgroundColor: checked ? color : 'transparent',
            borderColor: color 
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCheckboxChange();
          }}
        >
          {checked && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      
      <span 
        className="text-sm flex-1 truncate cursor-pointer" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCheckboxChange();
        }}
      >
        {name}
      </span>
      
      {onEdit && (
        <button 
          onClick={(e) => {
            e.preventDefault();
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
