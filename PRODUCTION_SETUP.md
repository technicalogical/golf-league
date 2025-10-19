# Production Deployment Guide
## Domain: golf.spaceclouds.xyz (Port 4001)

### 1. Auth0 Configuration

#### Login to Auth0 Dashboard
1. Go to https://manage.auth0.com
2. Select your application (or create a new one)

#### Update Application Settings:
- **Application Type**: Regular Web Application
- **Allowed Callback URLs**:
  ```
  https://golf.spaceclouds.xyz/api/auth/callback
  http://localhost:4001/api/auth/callback
  ```
- **Allowed Logout URLs**:
  ```
  https://golf.spaceclouds.xyz
  http://localhost:4001
  ```
- **Allowed Web Origins**:
  ```
  https://golf.spaceclouds.xyz
  http://localhost:4001
  ```

#### Note Your Credentials:
- Domain: `YOUR_DOMAIN.auth0.com`
- Client ID: `your_client_id`
- Client Secret: `your_client_secret`

---

### 2. Supabase Configuration

#### Login to Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)

#### Run Migrations:
Go to SQL Editor and run all migrations in order:
```
supabase/migrations/00001_initial_schema_v2.sql
supabase/migrations/00002_seed_courses.sql
supabase/migrations/00003_add_active_columns.sql
supabase/migrations/00004_fix_schema.sql
supabase/migrations/00005_add_match_format_and_tees.sql
supabase/migrations/00006_update_course_yardages.sql
supabase/migrations/00007_add_leagues_and_roles.sql
supabase/migrations/00008_fix_leagues_created_by.sql
supabase/migrations/00009_add_match_settings.sql
supabase/migrations/00010_add_profile_preferences.sql
supabase/migrations/00011_add_league_settings_and_admins.sql
supabase/migrations/00012_rollback_announcements.sql
supabase/migrations/00013_add_league_announcements.sql
supabase/migrations/00014_add_team_membership_system.sql
supabase/migrations/00015_add_league_day_and_time.sql
supabase/migrations/00015_add_team_open_to_join.sql
supabase/migrations/00016_add_league_join_requests.sql
supabase/migrations/00017_add_league_schedule_fields.sql
```

#### Note Your Credentials:
- Project URL: `https://YOUR_PROJECT.supabase.co`
- Anon/Public Key: Found in Settings > API
- Service Role Key: Found in Settings > API (keep secret!)

---

### 3. Create Production Environment File

Create `/var/www/golf-league/.env.local`:

```bash
# Auth0 Configuration
AUTH0_SECRET='<GENERATE_WITH: openssl rand -hex 32>'
AUTH0_BASE_URL='https://golf.spaceclouds.xyz'
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your_client_id_from_auth0'
AUTH0_CLIENT_SECRET='your_client_secret_from_auth0'

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your_anon_key_from_supabase'
SUPABASE_SERVICE_ROLE_KEY='your_service_role_key_from_supabase'
```

---

### 4. Directory Setup

```bash
# Create and setup production directory
sudo mkdir -p /var/www/golf-league
sudo chown brandon:brandon /var/www/golf-league

# Copy project files
cd /home/brandon/golf-league
cp -r * /var/www/golf-league/
cp .gitignore /var/www/golf-league/
cp .env.local.example /var/www/golf-league/

# Navigate to production directory
cd /var/www/golf-league

# Install dependencies
npm install --production

# Build the application
npm run build
```

---

### 5. Systemd Service Setup

Create `/etc/systemd/system/golf-league.service`:

```ini
[Unit]
Description=Golf League Web Application
After=network.target

[Service]
Type=simple
User=brandon
WorkingDirectory=/var/www/golf-league
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/var/www/golf-league

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable golf-league
sudo systemctl start golf-league
sudo systemctl status golf-league
```

---

### 6. Nginx Configuration

Your nginx should already be configured, but verify it has:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name golf.spaceclouds.xyz;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name golf.spaceclouds.xyz;

    # SSL configuration (adjust paths as needed)
    ssl_certificate /etc/letsencrypt/live/golf.spaceclouds.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/golf.spaceclouds.xyz/privkey.pem;

    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Test and reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 7. SSL Certificate (if not already set up)

```bash
sudo certbot --nginx -d golf.spaceclouds.xyz
```

---

### 8. Deployment Checklist

- [ ] Auth0 configured with production URLs
- [ ] Supabase migrations run
- [ ] Production .env.local created with all credentials
- [ ] Files copied to /var/www/golf-league
- [ ] Dependencies installed
- [ ] Application built successfully
- [ ] Systemd service created and started
- [ ] Nginx configuration verified
- [ ] SSL certificate active
- [ ] Application accessible at https://golf.spaceclouds.xyz
- [ ] Auth0 login working
- [ ] Database connections working

---

### 9. Troubleshooting

**View application logs:**
```bash
sudo journalctl -u golf-league -f
```

**Restart application:**
```bash
sudo systemctl restart golf-league
```

**Check application status:**
```bash
sudo systemctl status golf-league
```

**Test port binding:**
```bash
sudo netstat -tlnp | grep 4001
```

---

### 10. GitHub Repository Setup

```bash
cd /home/brandon/golf-league

# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/golf-league.git

# Push to GitHub
git push -u origin main
```

---

## Quick Start Commands

Once Auth0 and Supabase are configured:

```bash
# 1. Generate AUTH0_SECRET
openssl rand -hex 32

# 2. Setup production
sudo mkdir -p /var/www/golf-league
sudo chown brandon:brandon /var/www/golf-league
cp -r /home/brandon/golf-league/* /var/www/golf-league/
cd /var/www/golf-league

# 3. Create .env.local (edit with your credentials)
nano .env.local

# 4. Install and build
npm install
npm run build

# 5. Create systemd service (see section 5)
sudo nano /etc/systemd/system/golf-league.service

# 6. Start service
sudo systemctl daemon-reload
sudo systemctl enable golf-league
sudo systemctl start golf-league
sudo systemctl status golf-league
```
