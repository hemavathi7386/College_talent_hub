# Deployment Checklist

## 📋 Pre-Deployment

### 1. Database Setup (MongoDB Atlas)
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a new cluster (M0 Free tier is sufficient to start)
- [ ] Create database user with username and password
- [ ] Set user privileges to "Read and Write to any database"
- [ ] Add IP to whitelist: 0.0.0.0/0 (allow from anywhere)
- [ ] Get connection string from "Connect" → "Connect your application"
- [ ] Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/college_talent_hub`

### 2. Email Configuration (Gmail App Password)
- [ ] Go to Google Account settings
- [ ] Enable 2-Factor Authentication
- [ ] Go to Security → App passwords
- [ ] Create new app password for "Mail"
- [ ] Copy the 16-character password (no spaces)

### 3. Environment Variables Preparation

#### Backend Environment Variables
Create these values:
- [ ] `MONGODB_URI` - From MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Generate random 32+ character string
- [ ] `HUGGINGFACE_API_KEY` - Your existing key or get from https://huggingface.co/settings/tokens
- [ ] `EMAIL_USER` - Your Gmail address
- [ ] `EMAIL_PASS` - Gmail app password from step 2
- [ ] `FRONTEND_URL` - Will be set after frontend deployment

#### Frontend Environment Variables
- [ ] `REACT_APP_API_URL` - Will be set after backend deployment

### 4. Code Repository
- [ ] Push all code to GitHub repository
- [ ] Ensure .gitignore is properly configured
- [ ] Remove any sensitive data from code
- [ ] Ensure .env files are NOT committed

---

## 🚀 Deployment Steps (Recommended: Render)

### Step 1: Deploy Backend to Render

1. **Create Render Account**
   - [ ] Go to https://render.com
   - [ ] Sign up with GitHub account
   - [ ] Authorize Render to access your repository

2. **Create Web Service**
   - [ ] Click "New +" → "Web Service"
   - [ ] Connect your GitHub repository
   - [ ] Configure service:
     - Name: `college-talent-hub-backend`
     - Environment: `Node`
     - Region: Choose closest to your users
     - Branch: `main` or `master`
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Instance Type: `Free`

3. **Add Environment Variables**
   - [ ] Click "Advanced" → "Add Environment Variable"
   - [ ] Add each variable:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_generated_secret_32_chars_minimum
     PORT=5000
     NODE_ENV=production
     HUGGINGFACE_API_KEY=your_huggingface_key
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_gmail_app_password
     FRONTEND_URL=https://will-update-after-frontend-deployment
     ```

4. **Deploy Backend**
   - [ ] Click "Create Web Service"
   - [ ] Wait for deployment (5-10 minutes)
   - [ ] Check logs for any errors
   - [ ] Copy the backend URL (e.g., `https://college-talent-hub-backend.onrender.com`)
   - [ ] Test health endpoint: `https://your-backend-url.onrender.com/api/health`

### Step 2: Deploy Frontend to Render

1. **Create Static Site**
   - [ ] Click "New +" → "Static Site"
   - [ ] Connect your GitHub repository
   - [ ] Configure site:
     - Name: `college-talent-hub-frontend`
     - Branch: `main` or `master`
     - Build Command: `cd frontend && npm install && npm run build`
     - Publish Directory: `frontend/build`

2. **Add Environment Variable**
   - [ ] Click "Advanced" → "Add Environment Variable"
   - [ ] Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com
     GENERATE_SOURCEMAP=false
     ```

3. **Deploy Frontend**
   - [ ] Click "Create Static Site"
   - [ ] Wait for deployment (5-10 minutes)
   - [ ] Copy the frontend URL (e.g., `https://college-talent-hub-frontend.onrender.com`)

### Step 3: Update Backend Environment

1. **Update FRONTEND_URL**
   - [ ] Go back to backend service in Render
   - [ ] Click "Environment"
   - [ ] Update `FRONTEND_URL` with your frontend URL
   - [ ] Save changes (this will trigger a redeploy)

### Step 4: Testing

- [ ] Visit your frontend URL
- [ ] Test student registration with @cutmap.ac.in email
- [ ] Test faculty registration with @cutmap.ac.in email
- [ ] Test recruiter registration with any email
- [ ] Test login functionality
- [ ] Test creating a post
- [ ] Test job posting (as recruiter)
- [ ] Test competition creation (as faculty)
- [ ] Test profile updates
- [ ] Test chat functionality
- [ ] Test notifications

---

## 🔧 Alternative: Vercel (Frontend) + Render (Backend)

### Deploy Backend to Render
Follow Step 1 from above

### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - [ ] Go to https://vercel.com
   - [ ] Sign up with GitHub account

2. **Import Project**
   - [ ] Click "Add New Project"
   - [ ] Import your GitHub repository
   - [ ] Configure:
     - Framework Preset: Create React App
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`

3. **Add Environment Variable**
   - [ ] Add environment variable:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com
     ```

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment
   - [ ] Get your Vercel URL

5. **Update Backend FRONTEND_URL**
   - [ ] Update backend environment variable with Vercel URL

---

## 📝 Post-Deployment

### 1. Update README
- [ ] Add deployment URLs to README
- [ ] Document any deployment-specific configurations

### 2. Monitor Application
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Monitor Render logs for errors
- [ ] Set up uptime monitoring (optional: UptimeRobot)

### 3. Database Backup
- [ ] Enable MongoDB Atlas automated backups
- [ ] Document backup procedures

### 4. Create Admin User
- [ ] Use the create_admin script to create first admin user
- [ ] Test admin login

### 5. Performance Check
- [ ] Test app loading speed
- [ ] Check for console errors
- [ ] Verify all API endpoints work
- [ ] Test WebSocket connections for chat

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB**
- [ ] Verify MongoDB Atlas connection string
- [ ] Check IP whitelist (should include 0.0.0.0/0)
- [ ] Verify database user credentials

**Error: Application crashes**
- [ ] Check Render logs for error messages
- [ ] Verify all environment variables are set correctly
- [ ] Check for missing dependencies in package.json

**Error: CORS issues**
- [ ] Verify FRONTEND_URL in backend environment
- [ ] Check that frontend URL matches exactly (include https://)

### Frontend Issues

**Error: Cannot connect to backend**
- [ ] Verify REACT_APP_API_URL is set correctly
- [ ] Check backend health endpoint
- [ ] Verify backend is running

**Error: Build fails**
- [ ] Check build logs for specific errors
- [ ] Verify all dependencies are in package.json
- [ ] Try building locally first

### General Issues

**Free tier limitations (Render)**
- Services sleep after 15 minutes of inactivity
- First request after sleeping takes 30-60 seconds
- Solution: Upgrade to paid tier or use uptime monitoring

**Environment variables not updating**
- Clear deployment cache
- Trigger manual redeploy
- Verify variable names match exactly (case-sensitive)

---

## 🎯 Quick Commands Reference

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Backend Locally
```bash
cd backend
npm install
npm start
```

### Test Frontend Locally
```bash
cd frontend
npm install
npm start
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

---

## 📞 Support Resources

- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- React Documentation: https://react.dev/

---

## ✅ Deployment Complete!

Once all items are checked:
- [ ] Application is live and accessible
- [ ] All features are working
- [ ] Admin user is created
- [ ] Monitoring is set up
- [ ] Documentation is updated

**Congratulations! Your College Talent Hub is now deployed! 🎉**

---

## 📌 Important URLs (Fill in after deployment)

- Frontend URL: `_______________________________`
- Backend URL: `_______________________________`
- MongoDB Atlas: `https://cloud.mongodb.com`
- Render Dashboard: `https://dashboard.render.com`
