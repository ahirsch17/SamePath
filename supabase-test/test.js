// test.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uspgnfdslthorufqffjd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcGduZmRzbHRob3J1ZnFmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDU4MjcsImV4cCI6MjA2MjMyMTgyN30.Urxfmws3dUMveZlYyYzSBrvv8P_OqAVBVc-C9JhA5Tw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Insert and immediately select the new row
  const { data: insertData, error: insertError } = await supabase
    .from('slots')
    .insert([{ course: 'CS101', location: 'Library', start_time: '10:00', end_time: '11:00' }])
    .select();                // ← this makes insertData hold the new row

  console.log('Insert result:', insertData, insertError);

  // Fetch all slots
  const { data: slots, error: fetchError } = await supabase
    .from('slots')
    .select('*');

  console.log('All slots:', slots, fetchError);
}

run();
