# Testing the Organize PDF Feature

## How to Test

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the Organize page**
   - Go to `http://localhost:3000/dashboard`
   - Click on the "Organize" button (pink/rose colored)
   - OR go directly to `http://localhost:3000/organize`

3. **Upload a PDF**
   - Click or drag a PDF file to upload
   - The PDF should load and display all pages as thumbnails

4. **Test Features**
   
   **Reorder Pages:**
   - Drag and drop any page thumbnail to a new position
   - The page numbers should update automatically
   
   **Rotate Pages:**
   - Hover over a page thumbnail
   - Click the blue rotate button (↻)
   - The page should rotate 90° clockwise
   - Click again to rotate further (90° → 180° → 270° → 0°)
   
   **Delete Pages:**
   - Hover over a page thumbnail
   - Click the red delete button (🗑️)
   - The page should be removed
   - Note: You cannot delete the last remaining page
   
   **Save Changes:**
   - Click "Save Changes" button in the header
   - Wait for processing
   - Click "Download PDF" to get the reorganized PDF

## What Was Fixed

### Issue
The organize feature wasn't loading PDF pages properly.

### Root Cause
Each page thumbnail was creating its own `Document` component, causing:
- Multiple PDF loads (inefficient)
- Potential race conditions
- Missing `onDocumentLoadSuccess` callback

### Solution
1. Wrapped the entire page grid in a single `Document` component
2. Added `onDocumentLoadSuccess` callback to initialize page order
3. Added `onLoadError` callback with proper error display
4. Each thumbnail now only renders a `Page` component (not full Document)

## Expected Behavior

✅ PDF loads once and displays all pages as thumbnails
✅ Drag and drop works smoothly
✅ Rotate button rotates pages visually
✅ Delete button removes pages (except last one)
✅ Page numbers update correctly
✅ Save Changes processes and downloads reorganized PDF
✅ Error messages display if PDF fails to load

## Common Issues

**PDF not loading:**
- Check browser console for errors
- Ensure PDF is valid and not corrupted
- Check network tab for failed requests

**Drag and drop not working:**
- Ensure browser supports HTML5 drag and drop
- Try on desktop (mobile drag may behave differently)

**Save not working:**
- Check that `/api/sign` endpoint is accessible
- Verify backend is running
- Check browser console for API errors

## File Changes

- `app/organize/page.tsx` - Optimized PDF loading
- `app/api/sign/route.ts` - Supports page reordering and rotation
