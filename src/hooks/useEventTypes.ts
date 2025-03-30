
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventType {
  id: string;
  name: string;
  color: string;
}

export const useEventTypes = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        setLoading(true);
        
        // Check if we have an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No active session, skipping event types load');
          setLoading(false);
          return;
        }
        
        // Default event types if the query fails or returns empty
        const defaultTypes: EventType[] = [
          { id: '1', name: 'Meeting', color: '#3B82F6' },
          { id: '2', name: 'Court Date', color: '#EF4444' },
          { id: '3', name: 'Client Call', color: '#22C55E' },
          { id: '4', name: 'Deadline', color: '#F59E0B' },
          { id: '5', name: 'Task', color: '#8B5CF6' }
        ];
        
        // Try to fetch from DB
        const { data, error } = await supabase
          .from('event_types')
          .select('*');
          
        if (error) {
          console.error('Error fetching event types:', error);
          setEventTypes(defaultTypes);
        } else if (data && data.length > 0) {
          console.log('Loaded event types from DB:', data);
          setEventTypes(data);
        } else {
          console.log('No event types found, using defaults');
          setEventTypes(defaultTypes);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error in useEventTypes:', err);
        setError('Failed to load event types');
        // Still set default types even if there's an error
        setEventTypes([
          { id: '1', name: 'Meeting', color: '#3B82F6' },
          { id: '2', name: 'Court Date', color: '#EF4444' },
          { id: '3', name: 'Client Call', color: '#22C55E' },
          { id: '4', name: 'Deadline', color: '#F59E0B' },
          { id: '5', name: 'Task', color: '#8B5CF6' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventTypes();
  }, []);

  return { eventTypes, loading, error };
};
