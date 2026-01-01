# DocProcess MVP - Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- npm or pnpm

## Installation

1. Clone or download the project
2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Neon database URL:
```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=your-secure-random-string-here
```

## Database Setup

1. Create your Neon database at https://neon.tech
2. Copy the connection string to `DATABASE_URL` in `.env.local`
3. Run the database initialization:
```bash
# Using curl to run the SQL script
curl -X POST http://localhost:3000/api/health -H "Content-Type: application/json"
```

Or manually run the SQL from `scripts/01-init-database.sql` in your Neon console.

## Running Locally

```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:3000 in your browser.

## Features

### User Authentication
- Email/password registration and login
- Secure JWT-based sessions
- Protected routes

### File Operations
- Upload documents (PDF, DOCX, JPG, PNG, WEBP)
- Compress files with quality controls
- Resize documents to standard page sizes
- Convert images to PDF
- Add digital signatures
- Share files with secure tokens

### Usage Limits (Free Trial)
- 10 uploads per day
- 10 compressions per day
- 10 edits per day
- 10 signatures per day
- 5 conversions per day

### File Sharing
- Generate secure share links
- Set view-only or download permissions
- Optional expiry times

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Documents
- `GET /api/documents` - List user's documents
- `POST /api/documents/upload` - Upload document
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/[id]/share` - Create share link

### Processing
- `POST /api/compress` - Compress file
- `POST /api/resize` - Resize document
- `POST /api/convert` - Convert file format
- `POST /api/sign` - Add signature

### Sharing
- `GET /api/share/[token]` - Get shared file info
- `GET /api/download/[token]` - Download shared file

### Usage
- `GET /api/usage` - Get today's usage limits

## Deployment

### To Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   - `DATABASE_URL` - Your Neon database URL
   - `JWT_SECRET` - Secure random string
4. Deploy

### To Other Platforms

1. Ensure Node.js 18+ is available
2. Set environment variables
3. Build: `npm run build`
4. Start: `npm start`

## Testing the MVP

1. Register a new account at `/register`
2. Login at `/login`
3. Upload a document in the dashboard
4. Try compressing, resizing, or converting files
5. Create a signature and sign a document
6. Share a file and test the share link
7. Check usage limits on the dashboard

## Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` in `.env.local`
- Ensure Neon database is accessible
- Run `/api/health` endpoint to test connection

### "Cannot find module 'sharp'"
- Run `npm install sharp` (may require build tools)
- On Windows: Install Visual Studio Build Tools

### "File upload fails"
- Check file size (max 50MB)
- Verify file format is supported
- Ensure `/public/uploads` directory is writable

### JWT validation errors
- Clear browser cookies and log in again
- Check `JWT_SECRET` matches in `.env.local`

## Architecture

```
app/
├── (public pages)
├── login/
├── register/
├── dashboard/
├── upload/
├── compress/
├── resize/
├── convert/
├── sign/
├── share/[token]/
├── api/
│   ├── auth/
│   ├── documents/
│   ├── compress
│   ├── resize
│   ├── convert
│   ├── sign
│   └── share/

lib/
├── db.ts (Database queries)
├── auth.ts (JWT & password hashing)
└── compression.ts (Image & PDF processing)

scripts/
└── 01-init-database.sql (Database schema)
```

## Next Steps for Production

1. Change `JWT_SECRET` to a cryptographically secure random value
2. Add paid plan functionality
3. Implement cloud storage (AWS S3, Cloudflare R2)
4. Add email notifications
5. Implement file auto-cleanup
6. Add advanced PDF editing with pdf-lib
7. Add rate limiting
8. Add monitoring and logging

## Support

For issues, check the error logs and ensure:
- All dependencies are installed
- Environment variables are set correctly
- Database migrations have run
- File permissions are correct
