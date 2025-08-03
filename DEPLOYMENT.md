# FQ-Generator - Deployment Guide

## Vercel Deployment Instructions

### Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Ensure your project is pushed to Git repository

### Quick Deploy

```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview
```

### Manual Deployment Steps

1. **Initialize Vercel Project**

   ```bash
   vercel
   ```

2. **Configure Project Settings**

   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Environment Variables (Optional)

If you need environment variables, add them in Vercel dashboard:

- `NEXT_PUBLIC_APP_NAME=FQ-Generator`
- `NEXT_PUBLIC_APP_VERSION=1.0.0`

### Domain Configuration

After deployment, you can:

1. Use the auto-generated `.vercel.app` domain
2. Add a custom domain in Vercel dashboard
3. Configure DNS settings if using custom domain

### HTTPS Requirements

The app requires HTTPS for full functionality:

- ✅ Vercel provides HTTPS by default
- ✅ MediaDevices API will work properly
- ✅ Audio device selection will be available
- ✅ All browser security features enabled

### Performance Optimizations

- ✅ Next.js App Router optimizations
- ✅ Turbopack for faster builds
- ✅ Code splitting and lazy loading
- ✅ Package import optimizations
- ✅ Standalone output for smaller deployments

### Troubleshooting

If deployment fails:

1. Check build logs: `vercel logs`
2. Verify dependencies: `npm ci && npm run build`
3. Test locally: `npm run start`
4. Check Vercel dashboard for errors

### Post-Deployment Checklist

- [ ] Verify audio generation works
- [ ] Test frequency slider functionality
- [ ] Confirm spectrum analyzer displays
- [ ] Check output device selection (HTTPS)
- [ ] Test on different browsers
- [ ] Verify mobile responsiveness
