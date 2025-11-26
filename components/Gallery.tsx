
import React, { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '../types';
import FadeIn from './FadeIn';
import { X, ChevronLeft, ChevronRight, Maximize2, Plus, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GalleryProps {
  images: GalleryItem[];
  showViewAll?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ images, showViewAll = true }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(showViewAll ? 6 : 12);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  // Infinite scroll for full gallery page
  useEffect(() => {
    if (showViewAll) return; // Only for full gallery page

    const handleScroll = () => {
      // Check if user scrolled near bottom
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= pageHeight - 500 && visibleCount < images.length) {
        setVisibleCount(prev => Math.min(prev + 6, images.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showViewAll, visibleCount, images.length]);

  // Keyboard Navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return;

    if (e.key === 'Escape') setSelectedIndex(null);
    if (e.key === 'ArrowLeft') navigateImage(-1);
    if (e.key === 'ArrowRight') navigateImage(1);
  }, [selectedIndex, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navigateImage = (direction: number) => {
    if (selectedIndex === null) return;
    const newIndex = (selectedIndex + direction + images.length) % images.length;
    setSelectedIndex(newIndex);
  };

  // Display images based on visibleCount
  const displayImages = images.slice(0, visibleCount);
  const hasMore = visibleCount < images.length;

  return (
    <section id="galerija" className={`bg-cream relative transition-colors duration-300 ${showViewAll ? 'py-20 md:py-32' : 'py-12 md:py-16'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        <FadeIn>
          <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
            <span className="text-terracotta font-bold uppercase tracking-widest text-xs mb-3 block">Utrinki s kmetije</span>
            <h2 className="font-serif text-4xl md:text-5xl text-olive-dark mb-4 md:mb-6">Galerija Narave</h2>
            <p className="text-olive/60 text-base md:text-lg font-light leading-relaxed">
              Skozi objektiv ujeti trenutki našega vsakdana, ritem letnih časov in lepota biodinamičnega kmetovanja.
            </p>
          </div>
        </FadeIn>

        {/* Static Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayImages.map((img, idx) => (
            <div key={img.id}>
              <FadeIn delay={(idx % 3) * 100}>
                <div
                  className="group relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-zoom-in shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-100 aspect-[4/3]"
                  onClick={() => setSelectedIndex(idx)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transform transition-transform duration-1000 ease-out group-hover:scale-110"
                  />

                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-olive-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center backdrop-blur-[2px]">
                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center text-center p-6">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 border border-white/30">
                        <Maximize2 size={20} />
                      </div>
                      <p className="text-white/90 text-sm font-bold uppercase tracking-widest mb-2 px-4 text-center">
                        {img.alt}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          ))}
        </div>

        {/* View All Button (Homepage only) */}
        {showViewAll && (
          <div className="flex justify-center">
            <Link
              to="/galerija"
              className="group bg-white text-olive-dark px-6 md:px-8 py-3 md:py-4 rounded-full shadow-md hover:shadow-lg border border-black/5 transition-all duration-300 flex items-center gap-3 hover:-translate-y-1"
            >
              <span className="text-xs md:text-sm font-bold uppercase tracking-widest">Prikaži več slik</span>
              <div className="bg-gray-100 p-1 rounded-full group-hover:bg-olive-dark group-hover:text-white transition-colors">
                <Plus size={14} />
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Apple-Style Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-500">

          {/* Translucent Backdrop */}
          <div
            className="absolute inset-0 bg-olive-dark/90 backdrop-blur-xl md:backdrop-blur-2xl transition-opacity"
            onClick={() => setSelectedIndex(null)}
          />

          {/* Floating Content Container */}
          <div className="relative w-full max-w-6xl h-[100vh] md:h-[90vh] flex items-center justify-center p-0 md:p-8 z-10">

            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 text-white hover:text-white hover:bg-white/10 rounded-full transition-all backdrop-blur-md bg-black/20 md:bg-transparent"
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons - Visible on ALL devices */}
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
              className="absolute left-2 md:left-8 z-50 p-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center backdrop-blur-md bg-black/20 md:bg-transparent"
            >
              <ChevronLeft size={32} strokeWidth={1} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
              className="absolute right-2 md:right-8 z-50 p-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center justify-center backdrop-blur-md bg-black/20 md:bg-transparent"
            >
              <ChevronRight size={32} strokeWidth={1} />
            </button>

            {/* Image Wrapper with "Window" look */}
            <div
              className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-black/20 backdrop-blur-sm rounded-xl md:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-full">
                <img
                  src={images[selectedIndex].src}
                  alt={images[selectedIndex].alt}
                  className="max-w-full max-h-[60vh] md:max-h-[75vh] object-contain animate-in zoom-in-95 duration-500"
                />
              </div>

              <div className="mt-6 md:mt-8 text-center animate-in slide-in-from-bottom-4 duration-700 delay-100 max-w-2xl px-4">
                <div className="flex items-center justify-center gap-3 mb-2 md:mb-3">
                  {images[selectedIndex].date && (
                    <span className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} />
                      {images[selectedIndex].date}
                    </span>
                  )}
                </div>
                {(images[selectedIndex].description || images[selectedIndex].alt) && (
                  <p className="text-white/90 font-light text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-none">
                    {images[selectedIndex].description || images[selectedIndex].alt}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
