import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxProps {
    image: string | null;
    onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ image, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (image) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [image, onClose]);

    if (!image) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors p-2 bg-black/20 rounded-full backdrop-blur-md"
            >
                <X size={32} />
            </button>

            <div
                className="relative max-w-full max-h-full"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking image
            >
                <img
                    src={image}
                    alt="Povečana slika"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                />
            </div>
        </div>
    );
};

export default Lightbox;
