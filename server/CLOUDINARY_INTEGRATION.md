# Cloudinary Integration for Perla E-commerce

This document outlines the integration of Cloudinary for image storage in the Perla e-commerce application.

## Overview

We've replaced the local file storage system with Cloudinary, a cloud-based image and video management service. This allows for:

- Secure and reliable image storage
- Automatic image optimization
- CDN delivery for faster loading
- No need to manage local storage and file cleanup

## Implementation Details

### 1. Configuration

The Cloudinary configuration is stored in `src/config/cloudinary.ts`:

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dqoyo5ngc',
  api_key: '424324412844515',
  api_secret: 'Hsa4accasQfSOmO0PDEZdywwrAk',
});

// Create Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perla-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }],
  } as any,
});

export { cloudinary, storage };
```

### 2. Database Changes

A new column `public_id` has been added to the `product_images` table to store the Cloudinary public_id, which is needed for image deletion.

Migration file: `src/db/migrations/add_public_id_to_product_images.sql`

```sql
ALTER TABLE product_images ADD COLUMN public_id VARCHAR(255) NULL AFTER image;
```

### 3. Upload Middleware

The upload middleware has been modified to use Cloudinary storage:

```typescript
import multer from 'multer';
import { storage } from '../config/cloudinary';

export function saveImages(field: string, maxFiles = 5) {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB per file
    },
  }).array(field, maxFiles);
}
```

### 4. Product Service

The product service has been updated to:
- Store Cloudinary URLs in the database
- Save Cloudinary public_ids for future deletion
- Handle Cloudinary-specific image data

### 5. Image Deletion

When deleting product images, we now:
1. Get the image information from the database
2. Delete the image from Cloudinary using the public_id
3. Remove the database record

## Running the Migration

To add the `public_id` column to your existing database:

```
node src/db/run-migration.js
```

## Usage in Frontend

Frontend code doesn't need changes as it already uses the image URLs provided by the API. The only difference is that these URLs now point to Cloudinary instead of local files.

## Benefits

- Improved performance with CDN-delivered images
- Automatic image optimization
- Reduced server storage requirements
- Better scalability
- No need to manage file cleanup on product/image deletion 