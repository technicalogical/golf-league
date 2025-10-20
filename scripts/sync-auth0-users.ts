import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env (or .env.local as fallback)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test users data matching what was imported to Auth0
const testUsers = [
  { email: 'player1@golftest.com', name: 'Alex Rivera' },
  { email: 'player2@golftest.com', name: 'Jordan Chen' },
  { email: 'player3@golftest.com', name: 'Taylor Martinez' },
  { email: 'player4@golftest.com', name: 'Morgan Anderson' },
  { email: 'player5@golftest.com', name: 'Casey Thompson' },
  { email: 'player6@golftest.com', name: 'Jamie Wilson' },
  { email: 'player7@golftest.com', name: 'Riley Garcia' },
  { email: 'player8@golftest.com', name: 'Quinn Robinson' },
  { email: 'player9@golftest.com', name: 'Avery Lee' },
  { email: 'player10@golftest.com', name: 'Dakota White' },
  { email: 'player11@golftest.com', name: 'Skyler Harris' },
  { email: 'player12@golftest.com', name: 'Cameron Clark' },
];

async function syncAuth0Users() {
  console.log('\n🔄 Syncing Auth0 users to Supabase profiles...\n');
  console.log('⚠️  NOTE: You need to get the actual Auth0 user IDs from the Auth0 dashboard.\n');
  console.log('This script will guide you through the process:\n');
  console.log('1. Go to https://manage.auth0.com/');
  console.log('2. Navigate to User Management → Users');
  console.log('3. Search for each user email and copy their user_id (starts with "auth0|")');
  console.log('4. Update the USER_IDS object below in this script\n');
  console.log('For now, creating profiles with placeholder IDs...\n');

  const profiles = [];
  let successCount = 0;
  let errorCount = 0;

  for (const user of testUsers) {
    // Generate a placeholder auth0 ID
    // In reality, you'll need to get the real IDs from Auth0 dashboard
    const placeholderId = `auth0|placeholder_${user.email.split('@')[0]}`;

    const profile = {
      id: placeholderId,
      email: user.email,
      name: user.name,
      display_name: user.name,
      profile_completed: false,
      email_verified: true,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(`❌ Error creating profile for ${user.email}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Created profile for ${user.name} (${user.email})`);
      successCount++;
      profiles.push(data[0]);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\n⚠️  IMPORTANT: These profiles use placeholder Auth0 IDs.`);
  console.log(`   Users won't be able to log in until you update the IDs with real Auth0 user IDs.\n`);
  console.log(`   To get real Auth0 IDs, you can:`);
  console.log(`   1. Have each user log in once (this will auto-create their profile)`);
  console.log(`   2. Or use the Auth0 Management API to fetch user IDs programmatically\n`);

  return profiles;
}

// Run the sync function
syncAuth0Users()
  .then(() => {
    console.log('✨ Sync complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
