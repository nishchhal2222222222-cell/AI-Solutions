# Deployment Guide — AI-Solutions MERN App

Complete instructions for deploying the AI-Solutions application to production using Heroku (backend), Vercel (frontend), and MongoDB Atlas.

## Overview

- **Backend**: Node.js + Express on Heroku
- **Frontend**: React + Vite on Vercel
- **Database**: MongoDB Atlas (cloud-hosted)
- **Estimated Cost**: ~$10-20/month (or free tier)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with GitHub or create account
3. Click "Build a Database"
4. Choose "M0 Sandbox" (free tier with 512MB storage)
5. Select your region (same as backend for latency)
6. Click "Create"

### 1.2 Create Database User

1. In cluster → "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: `ai_solutions_admin` (or your choice)
4. Password: Generate secure password (save it!)
5. Click "Add User"

### 1.3 Create Database & Collections

1. Click "Collections" in cluster
2. "Create Database" with name `ai_solutions_db`
3. Collections will be auto-created by Mongoose

### 1.4 Get Connection String

1. Cluster → "Overview" → "Connect"
2. Choose "Drivers" → "Node.js"
3. Copy connection string (format):
```
mongodb+srv://ai_solutions_admin:PASSWORD@cluster0.xxxxx.mongodb.net/ai_solutions_db
```
4. Replace `<password>` with your actual password
5. Keep this string for Heroku config

### 1.5 Configure IP Whitelist

1. "Network Access"
2. "Add IP Address"
3. For development: Add `0.0.0.0/0` (allow all)
4. For production: Add your server's IP

---

## Step 2: Deploy Backend to Heroku

### 2.1 Setup Heroku

1. Go to https://heroku.com and sign up
2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. Verify installation:
```bash
heroku --version
```

### 2.2 Prepare Backend for Deployment

```bash
cd backend

# Ensure package.json has "start" script
# (should already have it from our setup)

# Create Procfile (tells Heroku how to run the app)
echo "web: node server.js" > Procfile

# Add Procfile to git
git add Procfile
git commit -m "Add Procfile for Heroku"
```

### 2.3 Create & Deploy App

```bash
# Login to Heroku
heroku login

# Create app
heroku create ai-solutions-api

# Or use existing app
heroku git:remote -a ai-solutions-api

# Set environment variables
heroku config:set PORT=5000
heroku config:set MONGO_URI="mongodb+srv://ai_solutions_admin:PASSWORD@cluster0.xxxxx.mongodb.net/ai_solutions_db"
heroku config:set JWT_SECRET="generate-random-secure-string-here-min-32-chars"
heroku config:set CLIENT_URL="https://ai-solutions-frontend.vercel.app"

# Deploy
git push heroku main
# Or if on different branch:
git push heroku your-branch-name:main

# View logs
heroku logs --tail
```

### 2.4 Verify Deployment

```bash
# Test API is running
curl https://ai-solutions-api.herokuapp.com/

# Should return: {"message":"AI-Solutions API"}

# Create default admin on Heroku
heroku run node scripts/seed.js
```

### 2.5 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` locally, commit node_modules OR use `npm ci` |
| CORS errors | Update `CLIENT_URL` in Heroku config to match frontend URL |
| MongoDB timeout | Check IP whitelist in Atlas; use 0.0.0.0/0 for testing |
| "Build failed" | Check `heroku logs --tail` for errors |

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Setup Vercel

1. Go to https://vercel.com and sign up (use GitHub recommended)
2. Install Vercel CLI:
```bash
npm install -g vercel
```

### 3.2 Prepare Frontend

```bash
cd frontend

# Create environment file for production
echo "VITE_API_URL=https://ai-solutions-api.herokuapp.com/api" > .env.production.local

# Build to verify it works
npm run build

# Should create `dist/` folder with optimized assets
```

### 3.3 Deploy to Vercel

```bash
# From frontend directory
vercel --prod

# Follow prompts:
# - Link to GitHub project (if using GitHub import)
# - Framework preset: Vite
# - Build command: npm run build
# - Output directory: dist
# - Environment variables: Add VITE_API_URL
```

### 3.4 Set Environment Variables in Vercel Dashboard

1. Go to Vercel Dashboard → Project Settings
2. Environment Variables
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://ai-solutions-api.herokuapp.com/api`
   - **Environments**: Production, Preview, Development
4. Click "Save"
5. Redeploy to apply

### 3.5 Verify Deployment

```bash
# Visit https://ai-solutions-frontend.vercel.app
# Should load homepage
# Try submitting a form
# Try admin login with: admin@ai-solutions.com / Admin@123
```

---

## Step 4: Production Configuration

### 4.1 Backend Security

Update `backend/server.js` for production CORS:

```javascript
// Current (development):
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost')) callback(null, true);
    else callback(new Error('CORS'));
  },
  credentials: true,
};

// Update to production:
const corsOptions = {
  origin: ['https://ai-solutions-frontend.vercel.app', 'https://yourdomain.com'],
  credentials: true,
};
```

Then update Heroku:
```bash
heroku config:set NODE_ENV="production"
git push heroku main
```

### 4.2 Change Default Admin Password

**CRITICAL**: The default password is `Admin@123`. Change it:

1. Login to admin dashboard
2. Go to Settings (if available) or use:
```bash
# Via MongoDB directly
# Use MongoDB Atlas UI to update admin password
# OR create a new admin via API:
curl -X POST https://ai-solutions-api.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Production Admin",
    "email":"admin@yourdomain.com",
    "password":"YourSecurePassword123!"
  }'

# Then delete the default admin from MongoDB Atlas
```

### 4.3 Enable HTTPS

- Vercel: Automatic (free)
- Heroku: Automatic (free) or custom domain
- MongoDB: Already uses HTTPS

### 4.4 Monitoring & Logs

**Heroku Logs**:
```bash
heroku logs --tail -a ai-solutions-api
```

**Vercel Logs**:
- Dashboard → Project → Deployments → Logs

**MongoDB Monitoring**:
- Atlas Dashboard → Monitoring (free tier limited)

---

## Step 5: Custom Domain Setup (Optional)

### Setup Custom Domain for Backend

```bash
# Add custom domain to Heroku app
heroku domains:add api.yourdomain.com -a ai-solutions-api

# Follow instructions to add DNS records to your domain registrar
# (Usually: create CNAME record pointing to heroku DNS)
```

### Setup Custom Domain for Frontend

1. Vercel Dashboard → Project Settings → Domains
2. Enter domain: `yourdomain.com`
3. Add DNS records (shown in Vercel UI)
4. Wait for verification (5-30 minutes)

---

## Step 6: Post-Deployment Checklist

- [ ] Backend URL works: `https://api.yourdomain.com`
- [ ] Frontend loads: `https://yourdomain.com`
- [ ] Forms submit successfully
- [ ] Admin login works
- [ ] Admin dashboard shows stats
- [ ] CRUD operations work (edit, delete)
- [ ] Chatbot responds
- [ ] HTTPS is enabled on both
- [ ] No CORS errors in browser console
- [ ] Default admin password changed
- [ ] MongoDB backups configured

---

## Troubleshooting

### "Application Error" on Heroku

```bash
heroku logs --tail
# Look for specific error, common causes:
# - Missing environment variables
# - MongoDB connection failed
# - Missing required packages
```

### Frontend Shows Blank/404

```bash
# Check build logs:
vercel logs --tail

# Verify:
npm run build  # Locally
# Should create dist/ folder with index.html
```

### API Calls Fail (CORS Error)

1. Check browser console (F12) for exact error
2. Verify `VITE_API_URL` in frontend `.env`
3. Verify `CLIENT_URL` in backend Heroku config
4. Ensure backend CORS includes frontend URL

### Forms Not Persisting

1. Check MongoDB connection:
   ```bash
   heroku run "node -e "require('mongoose').connect(process.env.MONGO_URI)" -a ai-solutions-api
   ```
2. Verify database in MongoDB Atlas has collections
3. Check backend logs for validation errors

---

## Scaling Considerations

### If Traffic Increases

**Backend (Heroku)**:
- Upgrade dyno: `heroku dyno:upgrade standard-1x -a ai-solutions-api` (~$7/month)
- Enable horizontal scaling with multiple dynos

**Frontend (Vercel)**:
- Automatically scales (included in free tier)

**Database (MongoDB)**:
- Start with M0 (512MB) free tier
- Upgrade to M2 ($9/month) for production
- Enable automatic backups

### Performance Optimization

```bash
# Frontend
npm run build  # Creates optimized bundle
# Check bundle size:
npm run build -- --report

# Backend
# Add caching headers
# Enable gzip compression (Express does by default)
# Use CDN for static assets
```

---

## Backup & Disaster Recovery

### MongoDB Backups

1. **Atlas Automated Backups** (M2+ only):
   - Enabled by default
   - Restore via Atlas UI

2. **Manual Backup** (all tiers):
   ```bash
   mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/ai_solutions_db"
   ```

3. **Export Data**:
   - Atlas UI → Cluster → Tools → Export → JSON/CSV

### Code Backups

- GitHub automatically backs up code
- Keep local copy: `git clone https://...`

---

## Cost Estimation

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| MongoDB Atlas | M0 | $0 | 512MB, limited |
| MongoDB Atlas | M2 | $9/mo | 2GB, recommended |
| Heroku | Free Eco | $5/mo | Updated pricing |
| Heroku | Standard-1x | $7/mo | Better performance |
| Vercel | Pro | $20/mo | Optional features |
| **Total** | Minimal | **$5-15/mo** | Free tier possible |

---

## Next Steps

1. Deploy backend to Heroku ✅
2. Deploy frontend to Vercel ✅
3. Test all functionality
4. Configure custom domain
5. Setup monitoring & alerts
6. Document production procedures
7. Schedule regular backups

For questions, check logs first:
```bash
# Backend logs
heroku logs --tail

# Frontend logs
vercel logs --tail
```
