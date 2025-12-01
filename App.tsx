

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminInventory from './components/AdminInventory';
import AllPostsPopup from './components/AllPostsPopup';
import NewPostPopup from './components/NewPostPopup';
import { GALLERY_IMAGES } from './constants';
import { GalleryItem } from './types';
import { fetchGalleryImages } from './sanityClient';
import { Settings } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import GalleryPage from './pages/GalleryPage';
import LegalPage from './pages/LegalPage';

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
          className="fixed bottom-4 right-4 z-40 w-10 h-10 bg-terracotta text-white rounded-full shadow-lg hover:bg-terracotta-dark transition-all duration-300 hover:scale-110 group flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300"
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
  const [adminInitialTab, setAdminInitialTab] = useState<'inventory' | 'orders' | 'gallery' | 'news' | 'videos' | 'settings'>('inventory');
  const [isAdminMode, setIsAdminMode] = useState(true); // Always visible for user convenience now
  const [showAllPostsPopup, setShowAllPostsPopup] = useState(false);
  const [showNewPostPopup, setShowNewPostPopup] = useState(false);

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

  const openAdminWithTab = (tab: 'inventory' | 'orders' | 'gallery' | 'news' | 'videos' | 'settings') => {
    setAdminInitialTab(tab);
    setShowAdmin(true);
  };

  // Listen for admin menu events from navbar
  useEffect(() => {
    const handleNewPost = () => setShowNewPostPopup(true);
    const handleEditPosts = () => setShowAllPostsPopup(true);
    const handleManageGallery = () => openAdminWithTab('gallery');
    const handleManageVideos = () => openAdminWithTab('videos');
    const handleManageInventory = () => openAdminWithTab('inventory');
    const handleManageOrders = () => openAdminWithTab('orders');

    window.addEventListener('admin-new-post', handleNewPost);
    window.addEventListener('admin-edit-posts', handleEditPosts);
    window.addEventListener('admin-manage-gallery', handleManageGallery);
    window.addEventListener('admin-manage-videos', handleManageVideos);
    window.addEventListener('admin-manage-inventory', handleManageInventory);
    window.addEventListener('admin-manage-orders', handleManageOrders);

    return () => {
      window.removeEventListener('admin-new-post', handleNewPost);
      window.removeEventListener('admin-edit-posts', handleEditPosts);
      window.removeEventListener('admin-manage-gallery', handleManageGallery);
      window.removeEventListener('admin-manage-videos', handleManageVideos);
      window.removeEventListener('admin-manage-inventory', handleManageInventory);
      window.removeEventListener('admin-manage-orders', handleManageOrders);
    };
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
          <Route path="/pravno" element={<LegalPage />} />
        </Routes>
      </main>
      <Footer onAdminClick={() => setShowAdmin(true)} />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Admin Interface Modal */}
      {showAdmin && (
        <AdminInventory
          onClose={() => setShowAdmin(false)}
          initialTab={adminInitialTab}
        />
      )}

      {/* Admin News Popups - Available on all pages */}
      {showAllPostsPopup && (
        <AllPostsPopup onClose={() => setShowAllPostsPopup(false)} />
      )}
      {showNewPostPopup && (
        <NewPostPopup
          onClose={() => setShowNewPostPopup(false)}
          onSuccess={() => {
            setShowNewPostPopup(false);
            // Optionally refresh the current page or show success message
          }}
        />
      )}
    </div>
  );
};


export default App;
