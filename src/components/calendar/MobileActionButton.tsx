
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileActionButtonProps {
  onClick: () => void;
}

export function MobileActionButton({ onClick }: MobileActionButtonProps) {
  const isMobile = useIsMobile();
  
  // Only show on mobile
  if (!isMobile) return null;
  
  return (
    <div className="fixed right-4 bottom-16 z-50">
      <Button 
        onClick={onClick}
        size="icon" 
        className="h-14 w-14 rounded-full shadow-lg bg-yorpro-600 hover:bg-yorpro-700 animate-scale-in"
      >
        <Plus className="h-7 w-7" />
      </Button>
    </div>
  );
}
