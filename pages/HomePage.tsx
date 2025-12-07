import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Products from '../components/Products';
import Locations from '../components/Locations';
import VideoGallery from '../components/VideoGallery';
import Gallery from '../components/Gallery';
import NewsSection from '../components/NewsSection';
import { GalleryItem } from '../types';

interface HomePageProps {
  galleryImages: GalleryItem[];
}

const HomePage: React.FC<HomePageProps> = ({ galleryImages }) => {
  useEffect(() => {
    // Scroll to section if hash is present in URL
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <Hero />
      <About />
      <Products />
      <Locations />
      <VideoGallery />
      <Gallery images={galleryImages} />
      <NewsSection />
    </>
  );
};

export default HomePage;
























