# DocProcess MVP - Testing & Verification Guide

## Overview
This guide walks through testing all features of the DocProcess MVP to ensure everything works correctly.

## Prerequisites
- Node.js 18+
- PostgreSQL/Neon database connected
- Environment variables configured (.env.local)

## Quick Start Testing

### 1. Database Setup
```bash
# Initialize database tables
curl -X POST http://localhost:3000/api/init-db

# Check health
curl http://localhost:3000/api/health
```

### 2. Authentication Testing
```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. File Operations Testing
```bash
# Upload a file
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@/path/to/file.pdf"

# Get documents list
curl http://localhost:3000/api/documents

# Get usage stats
curl http://localhost:3000/api/usage
```

### 4. Feature Testing
- **Compression**: Upload image → Compress with different quality levels
- **Resize**: Upload image → Resize to A4, Letter, or custom dimensions
- **Convert**: Upload images → Convert to PDF
- **Sharing**: Create share link → Access via public URL
- **Signing**: Upload document → Draw signature → Download signed file

## Manual UI Testing Checklist

### Landing Page
- [ ] Links to Login/Register work
- [ ] Features section displays correctly
- [ ] Responsive on mobile/desktop

### Registration
- [ ] Can create new account
- [ ] Password validation (min 6 chars)
- [ ] Email uniqueness check
- [ ] Redirects to login after success

### Login
- [ ] Valid credentials accepted
- [ ] Invalid credentials rejected
- [ ] Redirects to dashboard after login

### Dashboard
- [ ] Displays user's documents
- [ ] Shows daily usage limits
- [ ] Action buttons navigate to correct pages
- [ ] Can delete documents
- [ ] Can create share links
- [ ] Logout works

### Upload
- [ ] Drag & drop works
- [ ] Click to select files works
- [ ] Shows file list
- [ ] Rejects unsupported file types
- [ ] Rejects files > 50MB
- [ ] Upload success redirects to dashboard

### Compression
- [ ] File upload works
- [ ] Quality level selection works
- [ ] Shows original vs compressed size
- [ ] Download link works
- [ ] Daily limit enforcement works

### Resize
- [ ] A4 preset works
- [ ] Letter preset works
- [ ] Custom dimensions work
- [ ] Download works

### Conversion
- [ ] Single image to PDF works
- [ ] Multiple images to PDF works
- [ ] Download works

### Signing
- [ ] Signature pad draws correctly
- [ ] Clear button works
- [ ] File upload works
- [ ] Download signed document works

### File Sharing
- [ ] Share link generated correctly
- [ ] Public link accessible
- [ ] Expired links rejected
- [ ] View-only mode respected
- [ ] Download restrictions work

## Deployment Checklist

Before deploying to production:

- [ ] Database migrations complete
- [ ] All environment variables set
- [ ] SSL/TLS configured
- [ ] File upload directories secure
- [ ] Temporary files cleanup scheduled
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Error logging configured
- [ ] Backups configured

## Troubleshooting

### Database Connection Errors
- Check DATABASE_URL environment variable
- Verify Neon/PostgreSQL is running
- Check network connectivity

### File Upload Fails
- Check upload directory permissions
- Check available disk space
- Verify file size limits

### Signature Pad Not Drawing
- Check browser canvas support
- Try different browser
- Check for JavaScript errors

### Share Links Not Working
- Verify token in database
- Check expiry timestamp
- Verify file still exists

## Performance Testing

### Load Testing
- Test with 100+ concurrent uploads
- Test with large files (40MB+)
- Monitor database performance

### File Processing
- Compression time for various file sizes
- Conversion speed for multiple files
- Memory usage during processing

## Security Testing

- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF protection working
- [ ] Rate limiting prevents abuse
- [ ] File type validation strict
- [ ] Authentication tokens secure
- [ ] Password hashing verified
