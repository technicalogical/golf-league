import { faker } from '@faker-js/faker';
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

async function seedUsers(count: number = 12) {
  console.log(`\n🌱 Seeding ${count} test users...\n`);

  const users = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const user = {
      id: `auth0|seed_${faker.string.alphanumeric(24)}`,
      email: email,
      name: `${firstName} ${lastName}`,
      display_name: `${firstName} ${lastName}`,
      profile_completed: true,
    };

    users.push(user);
  }

  // Insert users into profiles table
  const { data, error } = await supabase
    .from('profiles')
    .insert(users)
    .select();

  if (error) {
    console.error('❌ Error seeding users:', error);
    return [];
  }

  console.log(`✅ Successfully created ${data.length} users:\n`);
  data.forEach((user: any) => {
    console.log(`   📧 ${user.name} (${user.email})`);
  });

  return data;
}

// Run the seed function
const userCount = parseInt(process.argv[2] || '12');
seedUsers(userCount)
  .then(() => {
    console.log('\n✨ User seeding complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
