
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarShare } from '@/types/calendar';

interface CalendarShareFormProps {
  sharedWith: CalendarShare[];
  setSharedWith: React.Dispatch<React.SetStateAction<CalendarShare[]>>;
}

export function CalendarShareForm({ sharedWith, setSharedWith }: CalendarShareFormProps) {
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'owner'>('view');

  const handleAddShare = () => {
    if (!shareEmail.trim()) {
      toast.error('Email address is required');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    if (sharedWith.some(share => share.user_email === shareEmail.trim())) {
      toast.error('This user has already been added');
      return;
    }

    setSharedWith([
      ...sharedWith,
      {
        user_email: shareEmail.trim(),
        permission: sharePermission
      }
    ]);

    setShareEmail('');
    setSharePermission('view');
  };

  const handleRemoveShare = (email: string) => {
    setSharedWith(sharedWith.filter(share => share.user_email !== email));
  };

  const permissionLabels = {
    view: 'View only',
    edit: 'Edit events',
    owner: 'Full control'
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-3">Share with specific users</h3>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="col-span-2">
          <Input
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="Enter email address"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={sharePermission}
            onValueChange={(value: 'view' | 'edit' | 'owner') => setSharePermission(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">View only</SelectItem>
              <SelectItem value="edit">Edit events</SelectItem>
              <SelectItem value="owner">Full control</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddShare} type="button" variant="outline" className="flex-shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {sharedWith.length > 0 && (
        <div className="space-y-2 mt-3">
          <h4 className="text-xs text-gray-500">Shared with:</h4>
          <div className="flex flex-wrap gap-2">
            {sharedWith.map((share, index) => (
              <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                <span className="flex-1">{share.user_email}</span>
                <span className="text-xs text-gray-500">({permissionLabels[share.permission]})</span>
                <X 
                  className="h-3 w-3 cursor-pointer ml-1" 
                  onClick={() => handleRemoveShare(share.user_email)} 
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
