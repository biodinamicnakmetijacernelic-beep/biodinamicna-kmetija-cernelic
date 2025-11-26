
import React, { useEffect, useState } from 'react';
import { fetchGalleryImages } from '../sanityClient';
import { GalleryItem } from '../types';
import Gallery from '../components/Gallery';

const GalleryPage: React.FC = () => {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const data = await fetchGalleryImages();
                setImages(data);
            } catch (error) {
                console.error('Failed to load gallery images:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadImages();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-olive-dark text-lg">Nalaganje...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream pt-20">
            <Gallery images={images} showViewAll={false} />
        </div>
    );
};

export default GalleryPage;
