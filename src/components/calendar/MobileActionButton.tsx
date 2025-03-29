
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileActionButtonProps {
  onClick: () => void;
}

export function MobileActionButton({ onClick }: MobileActionButtonProps) {
  return (
    <div className="md:hidden fixed right-4 bottom-4">
      <Button 
        onClick={onClick}
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg bg-yorpro-600 hover:bg-yorpro-700"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
