# Backend API Deployment Guide

## 🚀 Deploy to Vercel (Recommended - Free)

### Step 1: Set up Neon Database

1. **Go to [neon.tech](https://neon.tech)**
2. **Sign up for free account**
3. **Create new project:**
   - Project name: `samepath-app`
   - Database name: `neondb`
   - Region: Choose closest to Virginia Tech

4. **Get your connection string:**
   - Go to Dashboard → Connection Details
   - Copy the connection string
   - It looks like: `postgresql://username:password@host:port/database`

### Step 2: Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Navigate to API directory:**
```bash
cd api
```

3. **Deploy to Vercel:**
```bash
vercel
```

4. **Set environment variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `DATABASE_URL` = your Neon connection string

5. **Redeploy:**
```bash
vercel --prod
```

### Step 3: Get Your API URL

After deployment, you'll get a URL like:
`https://your-project.vercel.app`

This is your `DATABASE_API_URL` for the React Native app.
