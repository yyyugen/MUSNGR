# MUSNGR Deployment Guide

## Overview
This guide will help you deploy your MUSNGR project to Netlify with the custom domain `testmusngr.netlify.app`.

## Prerequisites
- GitHub account (username: yyyugen)
- Netlify account
- Your project is already configured for production deployment

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `musngr`
3. Description: "MUSNGR - Turn your audio content into stunning videos effortlessly"
4. Make it **Public** (required for free Netlify deployment)
5. Don't initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Push Code to GitHub

Run these commands in your project directory:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/yyyugen/musngr.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

1. Go to https://netlify.com and sign in
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Select your `musngr` repository
5. Configure build settings:
   - **Base directory**: Leave empty
   - **Build command**: `cd frontend-main && npm install && npm run build`
   - **Publish directory**: `frontend-main/out`

## Step 4: Set Custom Domain

1. In your Netlify site dashboard, go to "Site settings"
2. Click "Domain management"
3. Click "Add custom domain"
4. Enter: `testmusngr.netlify.app`
5. Netlify will automatically configure the domain

## Step 5: Environment Variables

1. In Netlify dashboard, go to "Site settings" > "Environment variables"
2. Add these variables (use your actual values from .env.local):
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
   - `NEXTAUTH_URL`: `https://testmusngr.netlify.app`
   - `NEXTAUTH_SECRET`: Your NextAuth secret (generate a secure random string)
   - `NEXT_PUBLIC_YOUTUBE_API_KEY`: Your YouTube API key

**Important**: Copy the actual values from your local `.env.local` file. The repository only contains placeholder values for security.

## Step 6: Update Google OAuth Settings

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID
4. Add these to "Authorized redirect URIs":
   - `https://testmusngr.netlify.app/api/auth/callback/google`
   - `https://testmusngr.netlify.app`

## Step 7: Deploy

1. Netlify will automatically deploy when you push to GitHub
2. Check the deploy logs for any errors
3. Your site will be available at `https://testmusngr.netlify.app`

## Troubleshooting

### Build Errors
- Check the deploy logs in Netlify dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly

### OAuth Issues
- Verify Google OAuth redirect URIs include your Netlify domain
- Check that environment variables match your Google Cloud settings

### Static Export Issues
- The project is configured for static export (`output: 'export'` in next.config.ts)
- Some Next.js features may not work in static mode (like API routes)

## Important Notes

1. **Backend**: The Rust backend is not deployed in this setup. You'll need a separate hosting solution for the backend if required.

2. **API Routes**: Next.js API routes won't work with static export. You may need to modify the application or deploy the backend separately.

3. **Environment Variables**: Never commit sensitive environment variables to Git. Use Netlify's environment variable settings.

4. **Domain**: The domain `testmusngr.netlify.app` will be automatically configured by Netlify.

## Next Steps

After successful deployment:
1. Test all functionality on the live site
2. Set up monitoring and analytics
3. Configure any additional integrations
4. Consider setting up a CI/CD pipeline for automated deployments
