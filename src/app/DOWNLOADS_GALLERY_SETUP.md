# Studio Gallery Setup Guide

## Overview
The Studio Gallery page (`/downloads`) is a full-featured image management system with folder organization, upload capabilities, and download functionality.

## Features
✅ Photo gallery with grid/list views
✅ Drag & drop image upload (admin only)
✅ Create/rename/delete folders
✅ Nested folder navigation with breadcrumbs
✅ Download individual images or bulk download selected images
✅ Image lightbox preview
✅ Search and filter functionality
✅ Admin-only upload/delete controls (requires authentication)
✅ Public browsing and downloading (no auth required)

## Supabase Setup

### 1. Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Create gallery_folders table
CREATE TABLE IF NOT EXISTS gallery_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES gallery_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES gallery_folders(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_folders_parent ON gallery_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_folder ON gallery_images(folder_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created ON gallery_images(created_at DESC);
```

### 2. Set Up Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE gallery_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to folders
CREATE POLICY "Public can view folders"
  ON gallery_folders
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage folders
CREATE POLICY "Authenticated users can insert folders"
  ON gallery_folders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update folders"
  ON gallery_folders
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete folders"
  ON gallery_folders
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow public read access to images
CREATE POLICY "Public can view images"
  ON gallery_images
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage images
CREATE POLICY "Authenticated users can insert images"
  ON gallery_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update images"
  ON gallery_images
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete images"
  ON gallery_images
  FOR DELETE
  TO authenticated
  USING (true);
```

### 3. Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it: `gallery-images`
4. Make it **Public** (so images can be viewed without auth)
5. Click **Create**

### 4. Set Storage Policies

In the Storage section, click on `gallery-images` bucket and go to **Policies**:

You'll need to create **3 separate policies**. Click **New policy** for each one:

#### Policy 1: Public View (SELECT)

- **Policy name:** `Public can view images`
- **Allowed operation:** ✅ Check **SELECT** only
- **Target roles:** `Defaults to all (public) roles if none selected` (leave dropdown as default)
- **Policy definition:**
```
bucket_id = 'gallery-images'
```
Click **Review** → **Save policy**

#### Policy 2: Authenticated Upload (INSERT)

Click **New policy** again, then:

- **Policy name:** `Authenticated users can upload images`
- **Allowed operation:** ✅ Check **INSERT** only
- **Target roles:** Change dropdown to **`authenticated`**
- **Policy definition:**
```
bucket_id = 'gallery-images'
```
Click **Review** → **Save policy**

#### Policy 3: Authenticated Delete (DELETE)

Click **New policy** again, then:

- **Policy name:** `Authenticated users can delete images`
- **Allowed operation:** ✅ Check **DELETE** only
- **Target roles:** Change dropdown to **`authenticated`**
- **Policy definition:**
```
bucket_id = 'gallery-images'
```
Click **Review** → **Save policy**

---

**OLD SQL METHOD (Optional - ignore if using UI above):**

If you prefer using SQL instead of the UI, you can run this in SQL Editor:

```sql
-- Allow public to view/download images
CREATE POLICY "Public can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'gallery-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery-images');
```

## Usage

### Access the Page
Navigate to: `https://your-domain.com/downloads`

### For Admins (Authenticated Users)
1. Sign in to your account
2. Go to `/downloads`
3. You'll see **New Folder** and **Upload Images** buttons
4. Create folders to organize images
5. Upload images (supports multiple files at once)
6. Delete folders or images as needed

### For Public Users
1. Visit `/downloads` (no login required)
2. Browse folders and images
3. Search for specific files
4. Toggle between grid and list view
5. Click images to preview in lightbox
6. Download individual images or select multiple for bulk download

## Page Access
- **URL**: `/downloads`
- **Not in navigation**: As requested, this page is not linked in the main navigation menu
- **Direct access only**: Users must know the URL to access it

## Tips
- Images are stored in Supabase Storage with optimized paths
- File sizes are automatically calculated and displayed
- Folder structure supports unlimited nesting
- All uploads are timestamped for easy tracking
- Search works across all filenames in the current folder
- Grid view shows thumbnails, list view shows more metadata

## Security Notes
- Only authenticated users can upload, create folders, or delete content
- All users (including anonymous) can browse and download
- If you want to restrict downloads to authenticated users only, update the RLS policies
- Files are stored in a public bucket for easy access