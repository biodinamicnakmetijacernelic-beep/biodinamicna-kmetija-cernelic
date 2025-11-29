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
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10"
            >
                <X size={24} />
            </button>

            <div
                className="relative max-w-[85vw] max-h-[85vh] flex items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={image}
                    alt="Povečana slika"
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
                    style={{ maxHeight: '85vh' }}
                />
            </div>
        </div>
    );
};

export default Lightbox;
