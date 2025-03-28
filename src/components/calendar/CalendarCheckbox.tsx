
import React from 'react';

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
      className="flex items-center space-x-2 py-1.5 px-1 hover:bg-gray-100 rounded cursor-pointer"
      onClick={() => onClick(id, category)}
    >
      <div 
        className="flex items-center justify-center h-4 w-4 rounded border"
        style={{ 
          backgroundColor: checked ? color : 'transparent',
          borderColor: color 
        }}
      >
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-3 w-3">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span className="text-sm flex-1 truncate">{name}</span>
    </div>
  );
}
