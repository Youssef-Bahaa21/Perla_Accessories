# 🚀 Deployment Checklist for Perla Accessories

## Pre-Deployment Setup

### ✅ Repository Setup
- [ ] Push code to GitHub repository
- [ ] Ensure all sensitive data is removed from code
- [ ] Verify `.gitignore` is working properly
- [ ] Database passwords and API keys are not committed

### ✅ Database Preparation
- [ ] Export current database schema
- [ ] Create production MySQL database
- [ ] Import `perla_db.sql` to production database
- [ ] Test database connection

### ✅ External Services Setup
- [ ] Setup Cloudinary account for image storage
- [ ] Configure email service (Gmail with app password)
- [ ] Generate strong JWT secret key

## 🎯 Vercel Frontend Deployment

### Step 1: Connect Repository
- [ ] Go to [Vercel](https://vercel.com)
- [ ] Connect your GitHub account
- [ ] Import your repository
- [ ] Select "Other" framework (since we have a monorepo)

### Step 2: Configure Build Settings
- [ ] **Build Command:** `cd client && npm ci && npm run build`
- [ ] **Output Directory:** `client/dist/client/browser`
- [ ] **Install Command:** `cd client && npm ci`

### Step 3: Environment Variables (Optional)
- No environment variables needed for frontend

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note your Vercel URL (e.g., https://your-app.vercel.app)

## 🚂 Railway Backend Deployment

### Step 1: Connect Repository
- [ ] Go to [Railway](https://railway.app)
- [ ] Connect your GitHub account
- [ ] Create new project from GitHub repo

### Step 2: Setup MySQL Database
- [ ] Add MySQL service to your Railway project
- [ ] Note the connection details
- [ ] Import your database schema

### Step 3: Configure Environment Variables
Add these environment variables in Railway:

```
NODE_ENV=production
PORT=3000
DB_HOST=<railway_mysql_host>
DB_PORT=3306
DB_USERNAME=<railway_mysql_user>
DB_PASSWORD=<railway_mysql_password>
DB_DATABASE=perla_db
JWT_SECRET=<your_long_random_secret>
FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
API_URL=https://your-railway-app.railway.app
```

### Step 4: Deploy
- [ ] Railway will auto-deploy from your repository
- [ ] Check logs for any errors
- [ ] Note your Railway URL

## 🔧 Post-Deployment Configuration

### Update Frontend API URL
- [ ] Update `client/src/environments/environment.prod.ts`
- [ ] Set API URL to your Railway backend URL
- [ ] Commit and push changes
- [ ] Vercel will auto-redeploy

### Test Deployment
- [ ] Frontend loads correctly
- [ ] API endpoints are accessible
- [ ] Database connections work
- [ ] Image uploads work (Cloudinary)
- [ ] Email notifications work
- [ ] User registration/login works
- [ ] Admin panel is accessible

## 🔒 Security Checklist

### Backend Security
- [ ] All environment variables are properly set
- [ ] Database credentials are secure
- [ ] JWT secret is strong and unique
- [ ] CORS is configured for your frontend domain
- [ ] Rate limiting is enabled

### Frontend Security
- [ ] No sensitive data in client code
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] CSP headers are configured

## 📊 Monitoring & Maintenance

### Setup Monitoring
- [ ] Monitor Railway logs for backend errors
- [ ] Monitor Vercel analytics for frontend performance
- [ ] Setup uptime monitoring (optional)

### Backup Strategy
- [ ] Setup automated database backups
- [ ] Document restore procedures
- [ ] Test backup/restore process

## 🆘 Troubleshooting

### Common Issues:

1. **Build Fails on Vercel:**
   - Check Node.js version compatibility
   - Verify build command is correct
   - Check for missing dependencies

2. **Backend Not Starting on Railway:**
   - Verify all environment variables are set
   - Check database connection
   - Review application logs

3. **CORS Errors:**
   - Ensure FRONTEND_ORIGIN is set correctly
   - Check API URL in Angular environment

4. **Database Connection Issues:**
   - Verify database credentials
   - Check if database service is running
   - Ensure database schema is imported

## 📝 Final Notes

- **Domain Setup:** After deployment, you can add custom domains in both Vercel and Railway
- **SSL Certificates:** Both platforms provide free SSL certificates
- **Scaling:** Both platforms auto-scale based on demand
- **Monitoring:** Both provide logs and analytics dashboards

## 🎉 Deployment Complete!

Once all checkboxes are complete, your Perla Accessories platform should be live and accessible to users! 