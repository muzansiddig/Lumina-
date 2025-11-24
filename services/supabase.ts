import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yckhtdcvkcviaaqfctxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2h0ZGN2a2N2aWFhcWZjdHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDczNTQsImV4cCI6MjA3OTU4MzM1NH0.4v5conYzY7TpBj5MV4ObzPgh8nmCDSWc4o1hZKrgu90';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('courses').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') { 
        // PGRST116 means the table might not exist, but we reached the server.
        // If other error, connection might be bad.
        console.log('Supabase check:', error.message);
        return false;
    }
    return true;
  } catch (e) {
    console.error('Supabase connection failed:', e);
    return false;
  }
};