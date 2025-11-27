#!/usr/bin/env node

/**
 * Blog Migration Script
 * Processes HTML blog posts from old website and extracts content
 */

const fs = require('fs');
const path = require('path');

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

// Get all HTML files
const htmlFiles = fs.readdirSync(BLOG_POSTS_DIR)
  .filter(file => file.endsWith('.html'))
  .sort();

console.log(`📁 Found ${htmlFiles.length} HTML files to process\n`);

const processedPosts = [];

htmlFiles.forEach((file, index) => {
  const filePath = path.join(BLOG_POSTS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  console.log(`${index + 1}. Processing: ${file}`);

  // Extract title (basic regex - you might need to adjust based on HTML structure)
  const titleMatch = content.match(/<title>(.*?)<\/title>/i) ||
                    content.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
                    content.match(/<h2[^>]*>(.*?)<\/h2>/i);

  const title = titleMatch ? titleMatch[1].trim() : `Blog Post ${index + 1}`;

  // Extract main content (this is a basic extraction - adjust based on your HTML structure)
  const bodyMatch = content.match(/<body[^>]*>(.*?)<\/body>/is) ||
                   content.match(/<main[^>]*>(.*?)<\/main>/is) ||
                   content.match(/<article[^>]*>(.*?)<\/article>/is);

  const bodyContent = bodyMatch ? bodyMatch[1].trim() : content;

  // Create slug from filename
  const slug = file.replace('.html', '').toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Basic post structure
  const post = {
    title,
    slug,
    publishedAt: new Date().toISOString(), // You'll need to extract actual dates
    image: null, // You'll need to match images
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: `MIGRATED CONTENT: ${title}\n\n${bodyContent.substring(0, 500)}...` // First 500 chars as preview
          }
        ]
      }
    ],
    originalFile: file,
    needsProcessing: true
  };

  processedPosts.push(post);
});

// Save processed posts
const outputPath = path.join(PROCESSED_DIR, 'migrated-posts.json');
fs.writeFileSync(outputPath, JSON.stringify(processedPosts, null, 2));

console.log(`\n✅ Migration complete!`);
console.log(`📄 Processed ${processedPosts.length} blog posts`);
console.log(`💾 Saved to: ${outputPath}`);
console.log(`\n📋 Next steps:`);
console.log(`1. Review the processed content`);
console.log(`2. Extract actual publish dates from HTML`);
console.log(`3. Match images to posts`);
console.log(`4. Upload images to Sanity`);
console.log(`5. Update the constants.ts file with real content`);
console.log(`6. Run the import in admin panel`);

console.log(`\n🎯 Ready for Sanity import!`);
