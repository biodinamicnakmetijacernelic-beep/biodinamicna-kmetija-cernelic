#!/usr/bin/env node

/**
 * Blog Migration Script
 * Processes HTML blog posts from old website and extracts content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OLD_WEBSITE_DIR = path.join(__dirname, '../old-website');
const PROCESSED_DIR = path.join(__dirname, '../processed');
const BLOG_POSTS_DIR = path.join(OLD_WEBSITE_DIR, 'blog-posts');

// Create processed directory if it doesn't exist
if (!fs.existsSync(PROCESSED_DIR)) {
  fs.mkdirSync(PROCESSED_DIR, { recursive: true });
}

console.log('🚀 Starting blog migration...\n');

// Check if blog posts directory exists
if (!fs.existsSync(BLOG_POSTS_DIR)) {
  console.log('❌ Blog posts directory not found. Please upload HTML files to migration/old-website/blog-posts/');
  process.exit(1);
}

// Recursively get all HTML files from subfolders
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.html')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(BLOG_POSTS_DIR).sort();

console.log(`📁 Found ${htmlFiles.length} HTML files to process\n`);

const processedPosts = [];

htmlFiles.forEach((filePath, index) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(BLOG_POSTS_DIR, filePath);

  console.log(`${index + 1}. Processing: ${relativePath}`);

  // Extract title (try multiple patterns)
  const titleMatch = content.match(/<title>(.*?)<\/title>/i) ||
                    content.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
                    content.match(/<h2[^>]*>(.*?)<\/h2>/i) ||
                    content.match(/<h3[^>]*>(.*?)<\/h3>/i);

  const title = titleMatch ? cleanHtml(titleMatch[1]) : `Blog Post ${index + 1}`;

  // Extract main content (try multiple content containers)
  let bodyContent = '';

  // Try to find main content areas
  const contentSelectors = [
    /<main[^>]*>(.*?)<\/main>/is,
    /<article[^>]*>(.*?)<\/article>/is,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is,
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>(.*?)<\/div>/is,
    /<div[^>]*class="[^"]*entry[^"]*"[^>]*>(.*?)<\/div>/is,
    /<body[^>]*>(.*?)<\/body>/is
  ];

  for (const selector of contentSelectors) {
    const match = content.match(selector);
    if (match && match[1] && match[1].length > bodyContent.length) {
      bodyContent = match[1];
    }
  }

  // If no specific content found, use whole body
  if (!bodyContent) {
    bodyContent = content;
  }

  // Clean up the content - remove scripts, styles, navigation, etc.
  bodyContent = cleanBlogContent(bodyContent);

  // Extract images from content
  const images = extractImages(bodyContent, filePath);

  // Try to extract date from content or filename
  const date = extractDate(content, relativePath);

  // Create slug from title or filename
  const slug = createSlug(title) || relativePath.replace(/\.html$/, '').replace(/[^a-z0-9]/g, '-');

  // Create proper Sanity content blocks
  const bodyBlocks = createSanityBlocks(bodyContent);

  const post = {
    title,
    slug,
    publishedAt: date,
    image: images.length > 0 ? images[0] : null, // Use first image as main image
    images: images, // Store all images found
    body: bodyBlocks,
    originalFile: relativePath,
    extractedImages: images.length,
    contentLength: bodyContent.length
  };

  processedPosts.push(post);
  console.log(`  ✅ Title: "${title}"`);
  console.log(`  📅 Date: ${date}`);
  console.log(`  🖼️  Images: ${images.length}`);
  console.log(`  📝 Content: ${bodyContent.length} chars`);
});

// Helper functions
function cleanHtml(text) {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function cleanBlogContent(content) {
  // Remove script and style tags
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove navigation, header, footer
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

  // Remove common unwanted elements
  content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
  content = content.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');
  content = content.replace(/<input[^>]*>/gi, '');
  content = content.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '');

  // Clean up extra whitespace
  content = content.replace(/\s+/g, ' ').trim();

  return content;
}

function extractImages(content, filePath) {
  const images = [];
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];

    // Skip data URLs and very small images
    if (!src.startsWith('data:') && !src.includes('icon') && !src.includes('logo')) {
      // Convert relative URLs to absolute if needed
      let fullSrc = src;
      if (!src.startsWith('http')) {
        // Try to construct full URL based on file location
        const fileDir = path.dirname(filePath);
        fullSrc = path.resolve(fileDir, src);
      }

      images.push({
        src: fullSrc,
        alt: '',
        originalSrc: src
      });
    }
  }

  return images;
}

function extractDate(content, filePath) {
  // Try to extract date from content
  const datePatterns = [
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/, // DD.MM.YYYY
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
  ];

  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match) {
      try {
        if (pattern.source.includes('MM.YYYY')) {
          // DD.MM.YYYY format
          const date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
          return date.toISOString();
        } else if (pattern.source.includes('YYYY-MM-DD')) {
          return new Date(match[0]).toISOString();
        }
      } catch (e) {
        // Invalid date, continue
      }
    }
  }

  // Try to extract from filename
  const dateMatch = filePath.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    return new Date(dateMatch[0]).toISOString();
  }

  // Default to file modification date
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

function createSanityBlocks(content) {
  // Split content into paragraphs and create Sanity blocks
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  return paragraphs.map(paragraph => ({
    _type: "block",
    children: [
      {
        _type: "span",
        text: cleanHtml(paragraph)
      }
    ]
  }));
}

// Save processed posts
const outputPath = path.join(PROCESSED_DIR, 'migrated-posts.json');
fs.writeFileSync(outputPath, JSON.stringify(processedPosts, null, 2));

console.log(`\n✅ Migration complete!`);
console.log(`📄 Processed ${processedPosts.length} blog posts`);
console.log(`🖼️  Total images found: ${processedPosts.reduce((sum, post) => sum + (post.extractedImages || 0), 0)}`);
console.log(`📝 Total content length: ${processedPosts.reduce((sum, post) => sum + (post.contentLength || 0), 0)} chars`);
console.log(`💾 Saved to: ${outputPath}`);
console.log(`\n📋 Next steps:`);
console.log(`1. Review the processed content in migrated-posts.json`);
console.log(`2. Upload extracted images to Sanity Studio`);
console.log(`3. Update image references in the JSON file`);
console.log(`4. Run the import in admin panel`);
console.log(`5. Manually edit posts if needed for better formatting`);

console.log(`\n🎯 Ready for Sanity import!`);
