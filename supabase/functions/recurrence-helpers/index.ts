
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Check if table exists
async function checkTableExists(client: any, tableName: string): Promise<boolean> {
  const { data, error } = await client.rpc('check_table_exists', { table_name: tableName });
  if (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
  return data || false;
}

// Create the recurrence_rules table if it doesn't exist
async function createTableIfNotExists(client: any): Promise<boolean> {
  const tableExists = await checkTableExists(client, 'recurrence_rules');
  
  if (!tableExists) {
    const { error } = await client.rpc('create_recurrence_rules_table');
    if (error) {
      console.error('Error creating recurrence_rules table:', error);
      return false;
    }
    return true;
  }
  
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const requestData = await req.json();
    const { action, payload } = requestData;
    
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Create table if needed
    await createTableIfNotExists(supabaseClient);
    
    let result;
    
    switch (action) {
      case 'create':
        // Insert a new recurrence rule
        const { data: createData, error: createError } = await supabaseClient
          .from('recurrence_rules')
          .insert({
            frequency: payload.frequency,
            interval: payload.interval || 1,
            week_days: payload.weekDays || null,
            month_days: payload.monthDays || null,
            ends_on: payload.endsOn || null,
            ends_after: payload.endsAfter || null
          })
          .select()
          .single();
          
        if (createError) throw createError;
        result = createData.id;
        break;
        
      case 'update':
        // Update an existing recurrence rule
        const { data: updateData, error: updateError } = await supabaseClient
          .from('recurrence_rules')
          .update({
            frequency: payload.frequency,
            interval: payload.interval || 1,
            week_days: payload.weekDays || null,
            month_days: payload.monthDays || null,
            ends_on: payload.endsOn || null,
            ends_after: payload.endsAfter || null
          })
          .eq('id', payload.id)
          .select();
          
        if (updateError) throw updateError;
        result = true;
        break;
        
      case 'delete':
        // Delete a recurrence rule
        const { error: deleteError } = await supabaseClient
          .from('recurrence_rules')
          .delete()
          .eq('id', payload.id);
          
        if (deleteError) throw deleteError;
        result = true;
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});
