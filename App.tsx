

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
import GalleryPage from './pages/GalleryPage';

// Scroll to Top Component
const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-terracotta text-white rounded-full shadow-lg hover:bg-terracotta-dark transition-all duration-300 hover:scale-110 group flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
};

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
          <Route path="/galerija" element={<GalleryPage />} />
          <Route path="/blog-novice" element={<BlogListPage />} />
          <Route path="/blog-novice/:slug" element={<BlogPostPage />} />
        </Routes>
      </main>
      <Footer onAdminClick={() => setShowAdmin(true)} />

      {/* Scroll to Top Button */}
      <ScrollToTop />

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
