import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmbtlibjgnxdluawlmcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnRsaWJqZ254ZGx1YXdsbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NzEwMzUsImV4cCI6MjA3NjQ0NzAzNX0.n8jX-ZWSVpFGbLt4bYQo-WQlFf9DmA5UG2-_o426XB8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMatchQuery() {
  console.log('Testing match query with anon client...\n');

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(
        id,
        name,
        players(id, name, handicap, is_active)
      ),
      team2:teams!matches_team2_id_fkey(
        id,
        name,
        players(id, name, handicap, is_active)
      ),
      course:courses(
        id,
        name,
        par,
        location,
        holes(hole_number, par, handicap_index, yardage)
      ),
      scorecards(
        id,
        player_id,
        total_score,
        player:players(id, name, handicap)
      )
    `)
    .eq('id', '4883e972-23ad-48c2-b191-f0f4402ccde5')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    console.error('\nError details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Success!');
    console.log('\nMatch data:', JSON.stringify(data, null, 2));
  }
}

testMatchQuery();
