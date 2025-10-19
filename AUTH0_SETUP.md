# Auth0 Setup Instructions

## Step 1: Login to Auth0
Visit: https://manage.auth0.com

## Step 2: Create/Select Application

### Option A: Create New Application
1. Click "Applications" → "Applications" in sidebar
2. Click "Create Application"
3. Name: "Golf League - Production"
4. Type: "Regular Web Applications"
5. Click "Create"

### Option B: Use Existing Application
1. Click "Applications" → "Applications" in sidebar
2. Select your existing application

## Step 3: Configure Application Settings

Navigate to the "Settings" tab and update:

### Basic Information
- **Name**: Golf League - Production
- **Application Type**: Regular Web Application

### Application URIs

**Allowed Callback URLs** (add both):
```
https://golf.spaceclouds.xyz/api/auth/callback
```

**Allowed Logout URLs** (add both):
```
https://golf.spaceclouds.xyz
```

**Allowed Web Origins** (add both):
```
https://golf.spaceclouds.xyz
```

### Advanced Settings (Optional but Recommended)
1. Click "Advanced Settings" at bottom
2. Go to "OAuth" tab
3. Ensure "JsonWebToken Signature Algorithm" is set to "RS256"
4. Ensure "OIDC Conformant" is enabled

### Save Changes
Click "Save Changes" at the bottom

## Step 4: Copy Your Credentials

From the same Settings page, copy these values:

1. **Domain**:
   - Example: `dev-abc123.us.auth0.com`
   - Copy this exactly as shown

2. **Client ID**:
   - Long string like: `aBcD1234567890XyZ`
   - Copy this exactly

3. **Client Secret**:
   - Click "Show" to reveal
   - Copy this secret (keep it private!)

## Step 5: Generate AUTH0_SECRET

Run this command on your server:
```bash
openssl rand -hex 32
```

Copy the output - this is your AUTH0_SECRET.

## Step 6: Create Production .env.local

Create the file `/var/www/golf-league/.env.local` with:

```bash
# Auth0 Configuration
AUTH0_SECRET='<OUTPUT_FROM_OPENSSL_COMMAND>'
AUTH0_BASE_URL='https://golf.spaceclouds.xyz'
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your_client_id'
AUTH0_CLIENT_SECRET='your_client_secret'

# Supabase Configuration (fill these next)
NEXT_PUBLIC_SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your_anon_key'
SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'
```

## Step 7: Test Configuration

After deployment, test by:
1. Visit https://golf.spaceclouds.xyz
2. Click "Sign In"
3. You should be redirected to Auth0 login page
4. After login, you should be redirected back to your app

## Troubleshooting

### "Callback URL mismatch" error
- Verify the callback URL in Auth0 exactly matches: `https://golf.spaceclouds.xyz/api/auth/callback`
- Check for trailing slashes (should not have one)
- Ensure HTTPS is used in production

### "Invalid state" error
- Check that AUTH0_SECRET is set and is different for dev/production
- Clear browser cookies and try again

### "Client authentication failed"
- Verify CLIENT_SECRET is correct
- Check that there are no extra spaces in .env.local

### Users can't logout
- Verify logout URL is configured: `https://golf.spaceclouds.xyz`

## Optional: Enable Social Logins

1. Go to "Authentication" → "Social" in Auth0 dashboard
2. Enable Google, GitHub, or other providers
3. Configure each provider with their credentials
4. Users will see these options on login screen

## Optional: Customize Login Page

1. Go to "Branding" → "Universal Login"
2. Customize colors, logo, and text
3. Preview changes before saving

## Security Recommendations

1. **Rotate AUTH0_SECRET** regularly
2. **Never commit** .env.local to git
3. **Use different secrets** for dev and production
4. **Enable MFA** (Multi-Factor Authentication) in Auth0 for admin users
5. **Monitor Auth0 logs** for suspicious activity

## Auth0 Dashboard Quick Links

- Applications: https://manage.auth0.com/#/applications
- Users: https://manage.auth0.com/#/users
- Logs: https://manage.auth0.com/#/logs
- Branding: https://manage.auth0.com/#/branding
