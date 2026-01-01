# DocProcess - Deployment Guide

## Quick Start Deployment to Vercel

### 1. Prerequisites
- GitHub account with code pushed
- Neon PostgreSQL account (https://neon.tech)
- Vercel account (https://vercel.com)

### 2. Create Database

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)

### 3. Deploy to Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Connect your GitHub repo
4. Fill in environment variables:
   - `DATABASE_URL`: Paste your Neon connection string
   - `JWT_SECRET`: Generate a random string:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

5. Click "Deploy"

### 4. Initialize Database

After deployment:

1. Go to your Vercel deployment URL
2. Visit `https://your-app.vercel.app/api/init-db`
3. POST request (or just visit in browser) to initialize tables
4. You should see: `{ "success": true, "message": "Database initialized" }`

### 5. Test

1. Visit your app at the Vercel URL
2. Register a new account
3. Test all features

## Environment Variables

Required:
```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secure-random-string-here
NODE_ENV=production
```

Optional:
```
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Database Backups

Neon automatically backs up your database. To restore:

1. Go to Neon dashboard
2. Select your project
3. Database section has backup options

## Monitoring

### Check Health
- Visit `/api/health` - returns database status
- Visit `/api/init-db?check=true` - verifies database tables

### View Logs
1. Go to Vercel dashboard
2. Select your project
3. Click "Logs" to see runtime logs

### Usage Analytics
- Vercel dashboard shows:
  - Requests per day
  - Function execution time
  - Error rates

## Scaling

### Current Limits
- Free Vercel plan: 100 GB bandwidth/month
- Neon free plan: 3GB storage

### Upgrade Path
1. **Vercel Pro** ($20/month): 1TB bandwidth
2. **Neon Growth Plan**: $19/month after free tier

### Optimization
- Add CDN for static assets
- Implement caching headers
- Compress images before upload
- Clean up old files regularly

## Custom Domain

1. Go to Vercel project settings
2. Domain section
3. Add your domain
4. Follow DNS setup instructions

## SSL/TLS

Vercel provides free SSL for:
- vercel.app domains
- Custom domains via Let's Encrypt

## Continuous Deployment

1. Every push to main branch auto-deploys
2. Preview deployments for pull requests
3. Rollback available in deployment history

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` in Vercel environment variables
- Verify Neon database is running
- Test with `/api/health`

### "500 errors after deployment"
- Check Vercel function logs
- Ensure all environment variables are set
- Verify database is initialized
- Check file permissions in logs

### "File upload fails"
- Check `/public/uploads` directory exists
- Verify write permissions
- Ensure database has correct permissions

## Security Checklist

- [ ] Change JWT_SECRET to random value
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set secure cookie flags (done in code)
- [ ] Validate all file uploads
- [ ] Implement rate limiting
- [ ] Monitor for suspicious activity
- [ ] Regular security audits

## Performance Optimization

1. **Images**: Compress before upload
2. **Caching**: Enable Vercel Edge Caching
3. **Database**: Use connection pooling (Neon supports)
4. **Functions**: Keep handlers simple
5. **Assets**: Minify CSS/JS

## Backup Strategy

1. **Database**: Neon automatic backups (7 days)
2. **Files**: Implement cloud storage backup
3. **Code**: GitHub is backup

## Support

- Vercel: https://vercel.com/help
- Neon: https://neon.tech/docs
- Next.js: https://nextjs.org/docs
