# 🚀 Production Deployment Checklist

## Quick Start (TL;DR)

```bash
# 1. Push to GitHub (do this first!)
git remote add origin https://github.com/YOUR_USERNAME/golf-league.git
git push -u origin main

# 2. Run deployment script
cd /home/brandon/golf-league
./deploy.sh

# 3. Configure Auth0 and Supabase (see detailed guides)
# 4. Test at https://golf.spaceclouds.xyz
```

---

## Detailed Checklist

### ☐ 1. GitHub Setup (5 minutes)

**Create GitHub Repository:**
1. Go to https://github.com/new
2. Repository name: `golf-league`
3. Make it Private (recommended) or Public
4. Don't initialize with README (you already have one)
5. Click "Create repository"

**Push Code:**
```bash
cd /home/brandon/golf-league
git remote add origin https://github.com/YOUR_USERNAME/golf-league.git
git push -u origin main
```

✅ **Verify:** Visit your GitHub repo and see all files

---

### ☐ 2. Auth0 Configuration (10 minutes)

**Read:** `AUTH0_SETUP.md`

**Quick Steps:**
1. Login: https://manage.auth0.com
2. Applications → Create Application (or use existing)
3. Add Callback URL: `https://golf.spaceclouds.xyz/api/auth/callback`
4. Add Logout URL: `https://golf.spaceclouds.xyz`
5. Copy: Domain, Client ID, Client Secret

**Generate AUTH0_SECRET:**
```bash
openssl rand -hex 32
```

✅ **Verify:** You have all 4 values written down

---

### ☐ 3. Supabase Configuration (15 minutes)

**Read:** `SUPABASE_SETUP.md`

**Quick Steps:**
1. Login: https://supabase.com/dashboard
2. Create new project (or use existing)
3. Copy: Project URL, anon key, service_role key
4. Go to SQL Editor
5. Run all 17 migration files in order

**Migration Files (run in order):**
- supabase/migrations/00001_initial_schema_v2.sql
- supabase/migrations/00002_seed_courses.sql
- ... (all through 00017)

✅ **Verify:** Table Editor shows all tables created

---

### ☐ 4. Create Production .env.local (5 minutes)

**Create file:** `/var/www/golf-league/.env.local`

```bash
# Generate secret first
openssl rand -hex 32

# Create file
sudo nano /var/www/golf-league/.env.local
```

**Paste this template (fill in your values):**
```bash
# Auth0
AUTH0_SECRET='<OUTPUT_FROM_OPENSSL>'
AUTH0_BASE_URL='https://golf.spaceclouds.xyz'
AUTH0_ISSUER_BASE_URL='https://YOUR_DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your_client_id'
AUTH0_CLIENT_SECRET='your_client_secret'

# Supabase
NEXT_PUBLIC_SUPABASE_URL='https://YOUR_PROJECT.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your_anon_key'
SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'
```

✅ **Verify:** File exists and has no typos

---

### ☐ 5. Run Deployment Script (10 minutes)

```bash
cd /home/brandon/golf-league
./deploy.sh
```

**The script will:**
- ✓ Create /var/www/golf-league
- ✓ Copy files
- ✓ Install dependencies
- ✓ Build the app
- ✓ Install systemd service
- ✓ Configure nginx
- ✓ Start the service

✅ **Verify:** Script completes without errors

---

### ☐ 6. Verify Services Running (2 minutes)

**Check app status:**
```bash
sudo systemctl status golf-league
```
Should show: `Active: active (running)`

**Check if port 4001 is listening:**
```bash
sudo netstat -tlnp | grep 4001
```
Should show: `node` listening on `127.0.0.1:4001`

**Check nginx:**
```bash
sudo systemctl status nginx
```
Should show: `Active: active (running)`

✅ **Verify:** All three checks pass

---

### ☐ 7. SSL Certificate (5 minutes)

**If SSL not already configured:**
```bash
sudo certbot --nginx -d golf.spaceclouds.xyz
```

**Test SSL:**
```bash
curl -I https://golf.spaceclouds.xyz
```
Should return: `HTTP/2 200`

✅ **Verify:** HTTPS works in browser

---

### ☐ 8. Test Application (5 minutes)

**Visit:** https://golf.spaceclouds.xyz

**Test these features:**
- [ ] Home page loads
- [ ] Click "Sign In" → redirects to Auth0
- [ ] Login with test account
- [ ] Redirected back to app dashboard
- [ ] Can create a team
- [ ] Can create a league
- [ ] Database operations work

✅ **Verify:** All features work

---

### ☐ 9. Monitor Logs (Ongoing)

**View real-time logs:**
```bash
sudo journalctl -u golf-league -f
```

**Common issues:**
- Auth0 redirect errors → Check callback URLs
- Database errors → Check Supabase credentials
- Port conflicts → Check if 4001 is already in use

✅ **Verify:** No errors in logs

---

## Quick Commands Reference

```bash
# Restart application
sudo systemctl restart golf-league

# View logs
sudo journalctl -u golf-league -f

# Check status
sudo systemctl status golf-league

# Rebuild and restart
cd /var/www/golf-league
npm run build
sudo systemctl restart golf-league

# Update from GitHub
cd /var/www/golf-league
git pull
npm install
npm run build
sudo systemctl restart golf-league

# View nginx error logs
sudo tail -f /var/log/nginx/golf-league-error.log

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## Troubleshooting Quick Fixes

### App won't start
```bash
# Check for syntax errors
cd /var/www/golf-league
npm run build

# Check .env.local exists and is correct
cat /var/www/golf-league/.env.local

# Check logs for specific error
sudo journalctl -u golf-league --no-pager -n 50
```

### Auth0 redirect loop
```bash
# Verify callback URL in Auth0 dashboard
# Should be: https://golf.spaceclouds.xyz/api/auth/callback

# Check AUTH0_BASE_URL in .env.local
# Should be: https://golf.spaceclouds.xyz (no trailing slash)
```

### Database connection errors
```bash
# Test Supabase connection
curl https://YOUR_PROJECT.supabase.co

# Verify credentials in .env.local
# Check for extra spaces or line breaks
```

### 502 Bad Gateway
```bash
# App probably crashed, check logs
sudo journalctl -u golf-league -n 50

# Restart app
sudo systemctl restart golf-league
```

---

## Post-Deployment Tasks

- [ ] Set up monitoring (e.g., UptimeRobot)
- [ ] Configure backups (Supabase auto-backups enabled)
- [ ] Add team members to Auth0
- [ ] Create initial leagues and teams
- [ ] Test mobile responsiveness
- [ ] Set up error tracking (optional: Sentry)

---

## Success Criteria

✅ Application accessible at https://golf.spaceclouds.xyz
✅ Users can sign in via Auth0
✅ Database operations work (create team, league, etc.)
✅ No errors in application logs
✅ SSL certificate valid
✅ Service auto-starts on reboot

---

## Support

- **Deployment Guide:** `PRODUCTION_SETUP.md`
- **Auth0 Guide:** `AUTH0_SETUP.md`
- **Supabase Guide:** `SUPABASE_SETUP.md`
- **View logs:** `sudo journalctl -u golf-league -f`

---

**Good luck with your deployment! 🏌️**
