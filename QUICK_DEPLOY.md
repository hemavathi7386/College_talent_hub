# 🚀 Quick Deployment Guide

Deploy your College Talent Hub in **under 30 minutes** using Render (Free tier).

## ⚡ Prerequisites (5 minutes)

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Sign up
2. Create FREE cluster (M0 Sandbox)
3. Create Database User:
   - Username: `admin`
   - Password: Generate strong password (save it!)
4. Network Access → Add IP Address → **0.0.0.0/0** (Allow from anywhere)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy string: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/college_talent_hub`
   - Replace `<password>` with your actual password

### 2. Gmail App Password (for email notifications)
1. Go to [Google Account](https://myaccount.google.com/) → Security
2. Enable **2-Step Verification** (if not already)
3. Search for "App passwords" → Create new
4. Select "Mail" and generate
5. Copy the 16-character password (no spaces)

### 3. GitHub Repository
1. Create new GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/college-talent-hub.git
   git push -u origin main
   ```

## 🎯 Deployment Steps (20 minutes)

### STEP 1: Deploy Backend (10 mins)

1. **Go to [Render](https://render.com)** → Sign up with GitHub

2. **Click "New +" → "Web Service"**

3. **Connect Repository** → Select your `college-talent-hub` repo

4. **Configure Service:**
   - **Name:** `college-talent-hub-backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to your location
   - **Branch:** `main`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** `Free`

5. **Add Environment Variables** (Click "Advanced"):
   
   Copy and paste these, replacing values:
   ```
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/college_talent_hub
   JWT_SECRET=my_super_secret_jwt_key_12345678901234567890
   PORT=5000
   NODE_ENV=production
   HUGGINGFACE_API_KEY=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
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   FRONTEND_URL=https://will-update-later
   ```

6. **Click "Create Web Service"** → Wait 5-10 minutes

7. **Copy Backend URL** (e.g., `https://college-talent-hub-backend.onrender.com`)

8. **Test Backend:**
   - Visit: `https://YOUR-BACKEND-URL.onrender.com/api/health`
   - Should see: `{"status":"OK","database":"Connected"}`

---

### STEP 2: Deploy Frontend (10 mins)

1. **On Render, Click "New +" → "Static Site"**

2. **Connect Repository** → Select your `college-talent-hub` repo

3. **Configure Site:**
   - **Name:** `college-talent-hub-frontend`
   - **Branch:** `main`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`

4. **Add Environment Variable:**
   ```
   REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com
   GENERATE_SOURCEMAP=false
   ```
   (Replace with your actual backend URL from Step 1)

5. **Click "Create Static Site"** → Wait 5-10 minutes

6. **Copy Frontend URL** (e.g., `https://college-talent-hub-frontend.onrender.com`)

---

### STEP 3: Update Backend with Frontend URL (2 mins)

1. **Go back to Backend service** in Render dashboard

2. **Click "Environment"** tab

3. **Edit `FRONTEND_URL`** → Replace with your frontend URL

4. **Save** → Backend will automatically redeploy

---

### STEP 4: Test Your Deployment! (3 mins)

1. **Visit your Frontend URL**

2. **Test Registration:**
   - Student: Use email like `2024001@cutmap.ac.in`
   - Faculty: Use email like `john.doe@cutmap.ac.in`
   - Recruiter: Use any email

3. **Test Login** with created account

4. **Test Features:**
   - Create a post
   - Update profile
   - Post a job (as recruiter)
   - Create competition (as faculty)

---

## 🎉 Success!

Your College Talent Hub is now **LIVE**! 

### Your URLs:
- **Frontend:** `https://college-talent-hub-frontend.onrender.com`
- **Backend API:** `https://college-talent-hub-backend.onrender.com`

---

## ⚠️ Important Notes

### Free Tier Limitations (Render)
- Apps sleep after 15 minutes of inactivity
- First request after sleeping takes ~30-60 seconds to wake up
- 750 hours/month free (sufficient for one app running 24/7)

### Solutions:
1. **Use UptimeRobot** (free) to ping your app every 5 minutes
2. **Upgrade to paid tier** ($7/month) for always-on service
3. **Accept the delay** - acceptable for development/testing

---

## 🐛 Troubleshooting

### Backend won't start?
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend can't reach backend?
- Check `REACT_APP_API_URL` is correct
- Test backend health endpoint
- Check browser console for errors

### CORS errors?
- Verify `FRONTEND_URL` in backend matches exactly
- Include `https://` in URL
- Check backend logs

### Database connection failed?
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check username/password in connection string
- Ensure cluster is running (not paused)

---

## 📞 Need Help?

1. Check Render logs first (most issues show here)
2. Review `DEPLOYMENT_CHECKLIST.md` for detailed steps
3. Verify all environment variables are set correctly
4. Test backend health endpoint
5. Check browser console for frontend errors

---

## 🔄 Making Updates

After making code changes:

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Render auto-deploys** from GitHub (default)

3. **Or manually trigger** deploy in Render dashboard

---

## 🎯 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Create admin user using create_admin script
- [ ] Add more content and test features
- [ ] Set up monitoring (UptimeRobot)
- [ ] Share with users!

---

## 💡 Pro Tips

1. **Monitor your apps** - Check Render dashboard regularly
2. **Keep credentials safe** - Never commit .env files
3. **Test locally first** - Use `npm run dev` before deploying
4. **Use strong passwords** - For JWT_SECRET and database
5. **Enable 2FA** - On all service accounts

---

**You're all set! Happy deploying! 🚀**
