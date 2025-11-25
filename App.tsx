

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminInventory from './components/AdminInventory';
import { GALLERY_IMAGES } from './constants';
import { GalleryItem } from './types';
import { fetchGalleryImages } from './sanityClient';
import { Settings } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';

const App: React.FC = () => {
  // State for Gallery images (fetched from Sanity or fallback to constants)
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(GALLERY_IMAGES);

  // Admin UI State
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true); // Always visible for user convenience now

  // Fetch images from Sanity on mount
  useEffect(() => {
    const loadImages = async () => {
      const sanityImages = await fetchGalleryImages();
      // Only override static images if we actually got something from Sanity
      if (sanityImages && sanityImages.length > 0) {
        setGalleryImages(sanityImages);
      }
    };
    loadImages();
  }, []);

  return (
    <div className="font-sans text-olive antialiased selection:bg-terracotta selection:text-white bg-cream min-h-screen transition-colors duration-300">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage galleryImages={galleryImages} />} />
          <Route path="/blog-novice" element={<BlogListPage />} />
          <Route path="/blog-novice/:slug" element={<BlogPostPage />} />
        </Routes>
      </main>
      <Footer />

      {/* Floating Admin Button (Always visible now) */}
      {isAdminMode && (
        <button
          onClick={() => setShowAdmin(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-olive-dark text-white rounded-full shadow-2xl hover:bg-terracotta transition-colors border border-white/10"
        >
          <Settings size={24} />
        </button>
      )}

      {/* Admin Interface Modal */}
      {showAdmin && (
        <AdminInventory
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
};


export default App;
