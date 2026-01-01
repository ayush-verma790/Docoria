# DocProcess MVP - Document Processing Platform

A modern, full-stack document processing platform built with Next.js. Process, compress, edit, and share documents with ease.

## Features

✨ **User Authentication**
- Secure email/password authentication
- Protected routes with JWT tokens
- Automatic session management

📄 **File Processing**
- Upload: PDF, DOCX, JPG, PNG, WEBP
- Compress: Reduce file size with quality controls
- Resize: Standard (A4, Letter) or custom page sizes
- Convert: Images to PDF, DOCX to PDF
- Sign: Add digital signatures to documents
- Edit: View and manage documents

🔗 **File Sharing**
- Generate secure share links
- View-only or downloadable options
- Optional link expiry
- No account required for recipients

📊 **Usage Limits**
- Free trial: 10 uploads, 10 compressions, 10 edits, 10 signatures, 5 conversions per day
- Daily reset at midnight
- Visual progress indicators

🎨 **User Experience**
- Mobile-first responsive design
- Drag-and-drop file upload
- Real-time compression feedback
- Clean, intuitive interface

## Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**
- Next.js API Routes
- Node.js
- PostgreSQL (Neon)

**Libraries:**
- Sharp (image processing)
- PDFKit (PDF generation)
- jose (JWT)
- bcryptjs (password hashing)

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your database URL

# Run development server
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
app/                      # Next.js app directory
├── api/                  # API routes
├── (auth)/              # Auth pages
├── dashboard/           # User dashboard
└── [feature]/           # Feature pages

lib/
├── db.ts               # Database client
├── auth.ts             # Authentication utilities
└── compression.ts      # File processing utilities

public/uploads/         # Temporary file storage
scripts/               # Database migrations
```

## Available Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Main dashboard |
| `/upload` | Upload documents |
| `/compress` | Compress files |
| `/resize` | Resize documents |
| `/convert` | Convert file formats |
| `/sign` | Add signatures |
| `/share/[token]` | View shared files |

## API Endpoints

All endpoints require authentication except `/api/auth/*` and `/api/share/*`.

**Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

**Documents**
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload
- `DELETE /api/documents/[id]` - Delete
- `POST /api/documents/[id]/share` - Create share link

**Processing**
- `POST /api/compress` - Compress files
- `POST /api/resize` - Resize documents
- `POST /api/convert` - Convert formats
- `POST /api/sign` - Add signatures

**Sharing**
- `GET /api/share/[token]` - Get file info
- `GET /api/download/[token]` - Download file

## Database Schema

**users** - User accounts
**documents** - Uploaded documents
**shared_links** - Share links with expiry
**usage_tracking** - Daily usage limits
**signatures** - Saved signatures

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing

## Testing

Test account flow:
1. Go to `/register` and create account
2. Login at `/login`
3. Upload file from `/upload`
4. Try features: compress, resize, convert, sign
5. Share file and test share link
6. Check usage limits on `/dashboard`

## Known Limitations

- File storage is temporary (local)
- PDF editing is basic (signature only)
- No image cropping/advanced editing yet
- Single user deployment suitable

## Future Enhancements

- Cloud storage (S3, Cloudflare R2)
- Advanced PDF editor
- Batch processing
- API for integrations
- Webhooks
- Team collaboration
- Premium tiers

## License

MIT

## Support

See [SETUP.md](./SETUP.md) for troubleshooting.
