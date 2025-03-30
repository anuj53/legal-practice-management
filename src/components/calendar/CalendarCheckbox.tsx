
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
  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(id, category);
  };

  return (
    <div className="flex items-center space-x-2 py-1.5 px-2 hover:bg-gray-100 rounded">
      <div className="flex items-center">
        <Checkbox 
          checked={checked}
          onCheckedChange={() => onClick(id, category)}
          className="rounded-sm"
          style={{ 
            backgroundColor: checked ? color : 'transparent',
            borderColor: color 
          }}
        />
      </div>
      
      <span 
        className="text-sm flex-1 truncate cursor-pointer" 
        onClick={handleCheckboxChange}
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
