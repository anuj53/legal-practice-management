
import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RecurrenceFrequency, RecurrencePattern } from '@/types/calendar';

interface RecurrenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pattern: RecurrencePattern) => void;
  initialPattern?: RecurrencePattern;
}

export function RecurrenceDialog({
  isOpen,
  onClose,
  onSave,
  initialPattern
}: RecurrenceDialogProps) {
  const defaultPattern: RecurrencePattern = {
    frequency: 'daily',
    interval: 1,
  };

  const [pattern, setPattern] = useState<RecurrencePattern>(initialPattern || defaultPattern);
  const [endType, setEndType] = useState<'never' | 'on_date' | 'after_occurrences'>(
    initialPattern?.endDate ? 'on_date' : initialPattern?.occurrences ? 'after_occurrences' : 'never'
  );

  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    setPattern(prev => ({ ...prev, frequency }));
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interval = parseInt(e.target.value);
    if (interval > 0) {
      setPattern(prev => ({ ...prev, interval }));
    }
  };

  const handleEndTypeChange = (type: 'never' | 'on_date' | 'after_occurrences') => {
    setEndType(type);
    
    // Update pattern based on end type
    if (type === 'never') {
      const { endDate, occurrences, ...rest } = pattern;
      setPattern(rest);
    } else if (type === 'on_date' && !pattern.endDate) {
      setPattern(prev => ({
        ...prev,
        endDate: addDays(new Date(), 30),
        occurrences: undefined
      }));
    } else if (type === 'after_occurrences' && !pattern.occurrences) {
      setPattern(prev => ({
        ...prev,
        occurrences: 10,
        endDate: undefined
      }));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPattern(prev => ({
      ...prev,
      endDate: new Date(e.target.value),
      occurrences: undefined
    }));
  };

  const handleOccurrencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const occurrences = parseInt(e.target.value);
    if (occurrences > 0) {
      setPattern(prev => ({
        ...prev,
        occurrences,
        endDate: undefined
      }));
    }
  };

  const handleSave = () => {
    onSave(pattern);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Recurrence Pattern</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Recurrence</Label>
            <RadioGroup 
              value={pattern.frequency} 
              onValueChange={(val) => handleFrequencyChange(val as RecurrenceFrequency)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly">Yearly</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="interval">Repeat every</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="interval"
                type="number"
                min="1"
                value={pattern.interval}
                onChange={handleIntervalChange}
                className="w-20"
              />
              <span>
                {pattern.frequency === 'daily' ? 'day(s)' : 
                 pattern.frequency === 'weekly' ? 'week(s)' :
                 pattern.frequency === 'monthly' ? 'month(s)' : 'year(s)'}
              </span>
            </div>
          </div>
          
          <div>
            <Label>End recurrence</Label>
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="end-never" 
                  name="end-recurrence"
                  checked={endType === 'never'}
                  onChange={() => handleEndTypeChange('never')}
                />
                <Label htmlFor="end-never" className="cursor-pointer">Never</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="end-date" 
                  name="end-recurrence"
                  checked={endType === 'on_date'}
                  onChange={() => handleEndTypeChange('on_date')}
                />
                <Label htmlFor="end-date" className="cursor-pointer">On date</Label>
                {endType === 'on_date' && (
                  <Input
                    type="date"
                    value={pattern.endDate ? format(pattern.endDate, 'yyyy-MM-dd') : ''}
                    onChange={handleEndDateChange}
                    className="w-auto"
                  />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  id="end-occurrences" 
                  name="end-recurrence"
                  checked={endType === 'after_occurrences'}
                  onChange={() => handleEndTypeChange('after_occurrences')}
                />
                <Label htmlFor="end-occurrences" className="cursor-pointer">After</Label>
                {endType === 'after_occurrences' && (
                  <Input
                    type="number"
                    min="1"
                    value={pattern.occurrences || 10}
                    onChange={handleOccurrencesChange}
                    className="w-20"
                  />
                )}
                <span>occurrences</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
