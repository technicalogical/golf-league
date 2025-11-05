import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmbtlibjgnxdluawlmcw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYnRsaWJqZ254ZGx1YXdsbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3MTAzNSwiZXhwIjoyMDc2NDQ3MDM1fQ.lnR0HYhzqhmUsZdMFSJhTpE90_G1fqQLxlI3ulhLh4w';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('\nChecking production players table schema...\n');

  // Get one player to see the structure
  const { data: players, error } = await supabase
    .from('players')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (players && players.length > 0) {
    console.log('Sample player record:');
    console.log(JSON.stringify(players[0], null, 2));
    console.log('\nColumns:');
    Object.keys(players[0]).forEach(key => {
      console.log(`  - ${key}: ${typeof players[0][key]}`);
    });
  } else {
    console.log('No players found in table');
  }
}

checkSchema();
