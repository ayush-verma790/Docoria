# DocProcess - Testing Guide

## Test Scenarios

### User Authentication
```
1. Register new user
   - Navigate to /register
   - Fill in name, email, password
   - Click "Create Account"
   - Should redirect to /login or /dashboard

2. Login existing user
   - Navigate to /login
   - Enter email and password
   - Should redirect to /dashboard

3. Logout
   - Click "Logout" button on dashboard
   - Should clear auth cookie and redirect to home
```

### File Upload
```
1. Upload valid PDF
   - Go to /upload
   - Select PDF file
   - Click "Upload"
   - Should appear in dashboard

2. Upload image
   - Select JPG, PNG, or WEBP
   - Should upload successfully

3. Upload DOCX
   - Select Word document
   - Should upload successfully

4. Upload too large file
   - Try file > 50MB
   - Should show error

5. Upload invalid format
   - Try .exe or other format
   - Should reject with error
```

### File Compression
```
1. Compress with low quality
   - Upload image
   - Select "Low" quality
   - Check file size reduction (should be ~40-60%)

2. Compress with medium quality
   - Should reduce size ~20-40%

3. Compress with high quality
   - Should reduce size minimally but high quality

4. Download compressed file
   - Click download
   - File should be smaller than original
```

### File Resizing
```
1. Resize to A4
   - Upload image
   - Select "A4"
   - Download resized version

2. Resize to US Letter
   - Select "US Letter"
   - Dimensions should be 216x279

3. Resize custom
   - Enter custom dimensions
   - Should resize accordingly
```

### File Conversion
```
1. Convert image to PDF
   - Upload JPG/PNG
   - Should convert to PDF
   - Download should be .pdf file

2. Convert multiple images to PDF
   - Upload multiple images
   - Should create single PDF with all pages

3. Download converted file
   - Should be valid PDF
```

### E-Signature
```
1. Draw signature
   - Go to /sign
   - Draw signature in canvas
   - Should capture drawing

2. Clear signature
   - Click "Clear"
   - Canvas should be empty

3. Sign document
   - Upload file
   - Draw signature
   - Click "Sign Document"
   - Should add signature and allow download
```

### File Sharing
```
1. Create share link
   - In dashboard, click share icon on document
   - Should generate token
   - Copy link to clipboard

2. Visit share link
   - Open link in new tab/window
   - Should show file info
   - Should NOT require login

3. Download from share link
   - Click download button
   - File should download

4. View-only share
   - Create share with view-only
   - Should NOT have download button

5. Share link expiry
   - Create link with expiry date
   - After expiry, link should not work
```

### Usage Limits
```
1. Hit daily limit
   - Use feature 10 times
   - 11th attempt should fail with limit message

2. Check usage display
   - Dashboard should show X/10 for each feature
   - Should reset at midnight

3. Different limits
   - Uploads: 10
   - Compressions: 10
   - Edits: 10
   - Signatures: 10
   - Conversions: 5
```

### Dashboard
```
1. View documents list
   - Should show all uploaded documents
   - Should show file name, size, date

2. Download from dashboard
   - Click download icon
   - Should download original file

3. Delete document
   - Click trash icon
   - Should remove from list

4. View usage
   - Should display current usage for all features
   - Should show X/limit format
```

### Error Handling
```
1. Network error
   - Disconnect internet
   - Try upload
   - Should show error message

2. File corruption
   - Upload corrupted file
   - Should handle gracefully

3. Database error
   - Simulate DB unavailable
   - Should show friendly error

4. Invalid session
   - Clear cookies manually
   - Try to access protected route
   - Should redirect to login
```

## Performance Testing

```
1. Upload large file (50MB)
   - Should not timeout
   - Should show upload progress

2. Compress large file
   - Should complete in < 30 seconds
   - Should not crash browser

3. Multiple concurrent operations
   - Open multiple feature pages
   - Perform operations simultaneously
   - Should handle without errors
```

## Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari
- Chrome Mobile

## Accessibility Testing

```
1. Keyboard navigation
   - Tab through all elements
   - Should be able to interact without mouse

2. Screen reader
   - Test with NVDA or JAWS
   - All buttons should have labels
   - Form fields should have labels

3. Color contrast
   - Check text is readable
   - Test with color blindness simulator
```

## Security Testing

```
1. SQL Injection
   - Try entering SQL in forms
   - Should be sanitized

2. XSS
   - Try uploading file with malicious name
   - Should escape in display

3. CSRF
   - Try CSRF attack
   - Should have proper token handling

4. Session Hijacking
   - Try using token from another user
   - Should reject
```

## Test Checklist

- [ ] All auth flows work
- [ ] File upload works
- [ ] Compression reduces file size
- [ ] Resize works correctly
- [ ] Conversion creates valid files
- [ ] Signatures can be drawn
- [ ] Share links work
- [ ] Usage limits are enforced
- [ ] Dashboard displays correctly
- [ ] Error messages are clear
- [ ] Mobile is responsive
- [ ] Accessibility is good
- [ ] No console errors
- [ ] No memory leaks
- [ ] Database operations complete
- [ ] File downloads work
- [ ] Share links expire correctly

## Known Issues

None at this time.

## Future Testing

- Load testing with 1000+ concurrent users
- Stress testing file processing
- Database performance testing
- Security penetration testing
