# Auth0 User Import Instructions

## Import Test Users to Auth0

### Step 1: Go to Auth0 Dashboard
1. Log in to https://manage.auth0.com/
2. Select your tenant (dev-e8b8q2nwta34obya.us.auth0.com)

### Step 2: Navigate to User Import
1. Click on **User Management** in the left sidebar
2. Click on **Users**
3. Click the **"..."** (three dots) menu in the top right
4. Select **"Import Users"**

### Step 3: Upload the JSON File
1. Click **"Choose File"** or drag and drop
2. Select the file: `/home/brandon/golf-league/scripts/auth0-test-users.json`
3. Select the connection: **"Username-Password-Authentication"** (or your database connection name)
4. Click **"Import Users"**

### Step 4: Set Passwords (IMPORTANT!)
Auth0 imports users **without passwords** for security. You need to:

**Option A: Send Password Reset Emails**
- After import, each user will receive a password reset email
- They can set their own password

**Option B: Manually Set Passwords**
1. Go to User Management → Users
2. Click on each imported user
3. Click **"Actions"** → **"Change Password"**
4. Set a password (e.g., `Test1234!` for all test users)

**Option C: Import with Passwords (Requires Hash)**
If you want to import users with pre-set passwords, you need to provide password hashes. This is more complex.

### Step 5: Verify Import
1. Go to User Management → Users
2. You should see 12 new users with emails `player1@golftest.com` through `player12@golftest.com`
3. Each user will have an `auth0|...` user ID

### Step 6: Test Login
1. Go to http://localhost:4000
2. Try logging in with one of the test users
3. If using Option B above, use the password you set

## Test User Credentials (After Setting Passwords)

If you used the same password for all:
- Email: `player1@golftest.com` - `player12@golftest.com`
- Password: `Test1234!` (or whatever you set)

## After Import - Creating Profiles

Once users are imported to Auth0, when they first log in to your app:
1. They will be redirected through Auth0 authentication
2. Your app will create a profile in the `profiles` table automatically
3. They can then complete onboarding and join teams

## Alternative: Import with Pre-Set Passwords

If you want users to have passwords immediately, you need to use bcrypt hashes. Let me know if you want me to create a script that generates a JSON file with hashed passwords.

## Cleanup

To delete test users later:
1. Go to User Management → Users
2. Filter by email domain: `@golftest.com`
3. Select all test users
4. Click **"Actions"** → **"Delete Users"**
