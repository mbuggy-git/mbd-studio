# MBD Studio - Make App

A comprehensive web application built with React, TypeScript, Vite, and Tailwind CSS featuring:
- YouTube video database and analytics (TubeLab)
- VidPod Studio showcase
- Training and contact pages
- Studio Gallery with Supabase integration
- Helper resources page

## Local Development Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (recommended) or npm

### Installation

1. Extract the project files
2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Start the development server:
```bash
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
pnpm build
# or
npm run build
```

## Important Notes

### Figma Assets
This project was originally built in Figma Make. The `figma:asset` imports have been configured to work locally using a Vite plugin that provides placeholder images. In production within Figma Make, these resolve to actual assets.

### Supabase Integration
The app uses Supabase for:
- Authentication (TubeLab)
- YouTube video database
- Studio Gallery storage

Supabase credentials are included in `/src/app/utils/supabase/info.tsx`. For the Studio Gallery to work, you need to set up the database tables and storage as documented in `/DOWNLOADS_GALLERY_SETUP.md`.

### Project Structure
- `/src/app` - Main application code
  - `/components` - Reusable React components
  - `/pages` - Page components
  - `/utils` - Utility functions and Supabase client
  - `/imports` - Figma-imported components
- `/src/styles` - Global styles and Tailwind config
- `/public` - Static assets

### Environment
- Uses React Router for navigation
- Tailwind CSS v4 for styling
- Vite for build tooling
- Material-UI and Radix UI components

## Features

### TubeLab
A YouTube video database application with:
- OAuth authentication with YouTube
- Video import and management
- Advanced analytics and tagging
- Performance tracking
- 30-day free trial system

### Studio Gallery
Image gallery with:
- Folder management
- Drag & drop uploads
- Image lightbox viewer
- Search functionality
- Bulk downloads
- Supabase storage integration

### Other Pages
- Home page with promotional content
- 1-1 Personal Training information
- VidPod Studio showcase
- Get the Goods page
- Helpers page with downloadable resources
- Contact page

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

## Brand Colors
- Primary Purple: `#5928CB`
- Pink Accent: `rgba(255, 93, 228, 0.95)`
- Blue: `#22A8E1`

## Typography
- Font Family: DM Sans
