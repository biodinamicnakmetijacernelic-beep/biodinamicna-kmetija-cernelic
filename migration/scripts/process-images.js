#!/usr/bin/env node

/**
 * Image Processing Script for Migration
 * Lists and prepares images for Sanity upload
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../old-website/images');
const PROCESSED_DIR = path.join(__dirname, '../processed');

console.log('🖼️  Processing images for migration...\n');

// Check if images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  console.log('❌ Images directory not found. Please upload images to migration/old-website/images/');
  process.exit(1);
}

// Get all image files
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  })
  .sort();

console.log(`📁 Found ${imageFiles.length} image files\n`);

const processedImages = [];

imageFiles.forEach((file, index) => {
  const filePath = path.join(IMAGES_DIR, file);
  const stats = fs.statSync(filePath);

  const imageInfo = {
    filename: file,
    path: filePath,
    size: stats.size,
    sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
    needsUpload: true,
    sanityId: null // Will be filled after upload to Sanity
  };

  processedImages.push(imageInfo);

  console.log(`${index + 1}. ${file} (${imageInfo.sizeMB} MB)`);
});

// Save processed images list
const outputPath = path.join(PROCESSED_DIR, 'images-to-upload.json');
fs.writeFileSync(outputPath, JSON.stringify(processedImages, null, 2));

console.log(`\n✅ Image processing complete!`);
console.log(`🖼️  Prepared ${processedImages.length} images for upload`);
console.log(`💾 Saved list to: ${outputPath}`);
console.log(`\n📋 Next steps:`);
console.log(`1. Upload images to Sanity Studio`);
console.log(`2. Note the asset IDs`);
console.log(`3. Update image references in blog posts`);
console.log(`4. Run final import`);

console.log(`\n🎯 Images ready for Sanity upload!`);
