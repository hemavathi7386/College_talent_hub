# College Talent Hub - Deployment Guide

This guide covers multiple deployment options for the College Talent Hub application.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Options](#deployment-options)
3. [Option 1: Deploy to Render (Recommended - Free)](#option-1-deploy-to-render)
4. [Option 2: Deploy to Vercel + Render](#option-2-deploy-to-vercel--render)
5. [Option 3: Deploy to Heroku](#option-3-deploy-to-heroku)
6. [Option 4: Deploy to AWS](#option-4-deploy-to-aws)
7. [Option 5: Deploy to Your Own VPS](#option-5-deploy-to-vps)
8. [Post-Deployment Steps](#post-deployment-steps)

---

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Set up MongoDB Atlas (cloud database)
- [ ] Create database user with appropriate permissions
- [ ] Whitelist IP addresses (0.0.0.0/0 for production)
- [ ] Get connection string

### 2. Environment Variables
- [ ] Update backend `.env` for production
- [ ] Update frontend `.env` for production
- [ ] Secure all sensitive keys
- [ ] Update email credentials (use app passwords)

### 3. Security
- [ ] Change JWT_SECRET to a strong random value
- [ ] Update email passwords to use App Passwords
- [ ] Review CORS settings
- [ ] Enable HTTPS

### 4. Code Preparation
- [ ] Remove console.logs
- [ ] Build optimized production bundle
- [ ] Test locally in production mode

---

## Deployment Options

### Option 1: Deploy to Render (Recommended - Free)

**Best for:** Full-stack MERN apps, free tier available, easy to set up

#### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
5. Replace `<password>` with your actual password
6. Whitelist IP: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

#### Step 2: Prepare Backend for Deployment

1. Push your code to GitHub (if not already done)
2. Go to [Render](https://render.com) and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** college-talent-hub-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free

6. Add Environment Variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_min_32_characters
   PORT=5000
   NODE_ENV=production
   HUGGINGFACE_API_KEY=your_huggingface_key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy the backend URL (e.g., `https://college-talent-hub-backend.onrender.com`)

#### Step 3: Prepare Frontend for Deployment

1. On Render, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** college-talent-hub-frontend
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`

4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

5. Click "Create Static Site"
6. Wait for deployment

#### Step 4: Update Backend CORS

The backend needs to allow requests from your frontend URL. This is already configured if you update `FRONTEND_URL` in backend environment variables.

---

### Option 2: Deploy to Vercel + Render

**Best for:** React apps on Vercel (faster), Node.js on Render

#### Deploy Backend to Render
Follow steps from Option 1, Step 2

#### Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

6. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

7. Click "Deploy"

---

### Option 3: Deploy to Heroku

**Note:** Heroku no longer offers free tier, but this is included for completeness.

#### Prerequisites
- Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- Create Heroku account

#### Deploy Backend

```bash
# Login to Heroku
heroku login

# Create app
heroku create college-talent-hub-backend

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production
heroku config:set HUGGINGFACE_API_KEY=your_key
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASS=your_app_password

# Deploy
git subtree push --prefix backend heroku main
```

#### Deploy Frontend

```bash
# Create app
heroku create college-talent-hub-frontend

# Set buildpack
heroku buildpacks:set mars/create-react-app

# Set environment variable
heroku config:set REACT_APP_API_URL=https://college-talent-hub-backend.herokuapp.com

# Deploy
git subtree push --prefix frontend heroku main
```

---

### Option 4: Deploy to AWS

**Best for:** Enterprise-level deployment with full control

#### Using AWS Elastic Beanstalk

1. Install [AWS CLI](https://aws.amazon.com/cli/) and [EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
2. Configure AWS credentials: `aws configure`
3. Initialize Elastic Beanstalk:
   ```bash
   cd backend
   eb init
   ```
4. Create environment:
   ```bash
   eb create college-talent-hub-production
   ```
5. Set environment variables via AWS Console
6. Deploy:
   ```bash
   eb deploy
   ```

For frontend, use AWS S3 + CloudFront:
```bash
cd frontend
npm run build
aws s3 sync build/ s3://your-bucket-name
```

---

### Option 5: Deploy to VPS (DigitalOcean, Linode, etc.)

**Best for:** Maximum control, custom server configuration

#### Prerequisites
- VPS with Ubuntu 20.04 or higher
- Domain name (optional but recommended)

#### Step 1: Set Up Server

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

#### Step 2: Deploy Backend

```bash
# Create app directory
mkdir -p /var/www/college-talent-hub
cd /var/www/college-talent-hub

# Clone your repository
git clone https://github.com/your-username/college-talent-hub.git .

# Install backend dependencies
cd backend
npm install --production

# Create .env file
nano .env
# Add your environment variables

# Start with PM2
pm2 start server.js --name college-talent-hub-backend
pm2 startup
pm2 save
```

#### Step 3: Deploy Frontend

```bash
# Build frontend
cd /var/www/college-talent-hub/frontend
npm install
npm run build
```

#### Step 4: Configure Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/college-talent-hub
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/college-talent-hub/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/college-talent-hub /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 5: Set Up SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## Post-Deployment Steps

### 1. Test the Application
- [ ] Test user registration for all roles
- [ ] Test login functionality
- [ ] Test job posting and applications
- [ ] Test competition creation and registration
- [ ] Test real-time features (chat, notifications)

### 2. Monitor the Application
- Set up error logging (consider services like Sentry)
- Monitor server resources
- Set up uptime monitoring (UptimeRobot, Pingdom)

### 3. Set Up Backups
- Enable MongoDB Atlas automated backups
- Back up environment variables
- Document deployment process

### 4. Performance Optimization
- Enable gzip compression
- Implement caching strategies
- Optimize images and assets
- Consider CDN for static assets

### 5. Security Hardening
- Keep dependencies updated
- Implement rate limiting
- Add security headers
- Regular security audits

---

## Environment Variables Reference

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college_talent_hub
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
PORT=5000
NODE_ENV=production
HUGGINGFACE_API_KEY=your_huggingface_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-domain.com
DANGEROUSLY_DISABLE_HOST_CHECK=true
GENERATE_SOURCEMAP=false
```

---

## Troubleshooting

### Common Issues

**Issue: Cannot connect to MongoDB**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Ensure network access is configured

**Issue: CORS errors**
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in server.js

**Issue: Build fails**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility

**Issue: App crashes after deployment**
- Check logs: `pm2 logs` (VPS) or platform-specific logs
- Verify all environment variables are set
- Check for missing dependencies

---

## Quick Deploy Script

For rapid deployment to Render, we'll create an automated script in the next step.

---

## Need Help?

- Check application logs
- Review environment variables
- Ensure all services are running
- Verify database connection
- Check network/firewall settings

---

**Good luck with your deployment! 🚀**
