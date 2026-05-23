# Deployment Guide

## For FTP Server Deployment

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Application
```bash
npm run build
```
This creates a `dist` folder with all the compiled files.

### Step 3: Upload to FTP Server
Upload **only the contents** of the `dist` folder to your FTP server's web directory (usually `public_html`, `www`, or similar).

The `dist` folder will contain:
- `index.html` (main entry point)
- `assets/` folder (contains CSS, JS, and other assets)
- Any other static files

### Important Notes:
- Upload the **contents** of the `dist` folder, not the `dist` folder itself
- Make sure `index.html` is in the root of your web directory
- Ensure your web server is configured to serve the `index.html` file for all routes (SPA routing)
- Your API key is embedded in the JavaScript, so make sure your domain is properly configured in the YouTube Data API console

### File Structure on FTP Server:
```
public_html/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
```

### Testing:
After upload, visit your domain and the YouTube channel showcase should load automatically.

## Alternative: Static Host Deployment
You can also drag and drop the `dist` folder contents to services like:
- Netlify Drop
- Vercel
- GitHub Pages
- Any static hosting service