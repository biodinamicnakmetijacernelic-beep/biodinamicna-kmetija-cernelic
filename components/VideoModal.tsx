
import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { YOUTUBE_VIDEO_ID } from '../constants';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId?: string; // Optional prop to override default video
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoId }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Use the passed videoId, or fallback to the constant default ID
  const activeVideoId = videoId || YOUTUBE_VIDEO_ID;

  // Construct URL with autoplay and strict security policies
  const videoSrc = `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`;
  const directLink = `https://www.youtube.com/watch?v=${activeVideoId}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop - Glass Effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10 ring-1 ring-white/5 flex flex-col">
        <button
          onClick={onClose}
          className="absolute -top-2 md:top-6 right-4 md:right-6 z-20 p-3 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all backdrop-blur-md border border-white/10 group"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <div className="flex-1 relative">
           <iframe 
             className="absolute inset-0 w-full h-full"
             src={videoSrc}
             title="Kmetija Černelič Video"
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
             referrerPolicy="strict-origin-when-cross-origin"
             allowFullScreen
           ></iframe>
        </div>

        {/* Fallback Link */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent pointer-events-none flex justify-center pb-8 opacity-0 hover:opacity-100 transition-opacity">
           <a 
             href={directLink} 
             target="_blank" 
             rel="noopener noreferrer"
             className="pointer-events-auto flex items-center gap-2 text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors"
           >
             <span>Težave s predvajanjem?</span>
             <ExternalLink size={12} />
           </a>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
