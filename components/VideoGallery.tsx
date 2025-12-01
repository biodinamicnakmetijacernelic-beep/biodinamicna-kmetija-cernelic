
import React, { useState, useEffect } from 'react';
import { Play, Youtube, ChevronDown } from 'lucide-react';
import { VIDEO_GALLERY, YOUTUBE_CHANNEL_URL } from '../constants';
import { fetchVideoGallery } from '../sanityClient';
import VideoModal from './VideoModal';
import FadeIn from './FadeIn';

const VideoGallery: React.FC = () => {
   const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
   const [displayVideos, setDisplayVideos] = useState(VIDEO_GALLERY);
   const [visibleCount, setVisibleCount] = useState(6);

   useEffect(() => {
      const loadVideos = async () => {
         const sanityVideos = await fetchVideoGallery();
         // Only override if we got videos from Sanity
         if (sanityVideos && sanityVideos.length > 0) {
            setDisplayVideos(sanityVideos);
         }
      };
      loadVideos();
   }, []);

   const handleVideoClick = (id: string) => {
      setSelectedVideoId(id);
   };

   const handleClose = () => {
      setSelectedVideoId(null);
   };

   return (
      <section id="video-galerija" className="py-20 md:py-32 bg-olive-dark relative overflow-hidden transition-colors duration-300">
         {/* Background Ambience */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

         <div className="container mx-auto px-6 max-w-7xl relative z-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-8">
               <FadeIn>
                  <div>
                     <span className="text-terracotta font-bold uppercase tracking-widest text-xs mb-3 block">Video Galerija</span>
                     <h2 className="font-serif text-3xl md:text-5xl text-cream mb-4">Biodinamika v Gibanju</h2>
                     <p className="text-cream/60 text-base md:text-lg font-light max-w-xl">
                        Skozi objektiv ujemamo predanost in delo, ki spoštuje naravo in njene cikle.
                     </p>
                  </div>
               </FadeIn>

               <FadeIn delay={200}>
                  <a
                     href={YOUTUBE_CHANNEL_URL}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full border border-white/20 text-cream hover:bg-red-600 hover:border-red-600 hover:text-white transition-all group"
                  >
                     <Youtube size={18} />
                     <span className="text-xs font-bold uppercase tracking-widest">Obišči YouTube Kanal</span>
                  </a>
               </FadeIn>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
               {displayVideos.slice(0, visibleCount).map((video, idx) => (
                  <FadeIn key={idx} delay={Math.min(idx * 50, 500)}>
                     <div
                        className="group relative aspect-video bg-black rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-white/5 hover:border-terracotta/50 transition-colors"
                        onClick={() => handleVideoClick(video.videoId)}
                     >
                        {/* Thumbnail Image (Auto-fetched from YouTube) */}
                        <img
                           src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                           alt={video.title}
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                           loading={idx < 6 ? "eager" : "lazy"}
                        />

                        {/* Overlay Content */}
                        <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 bg-gradient-to-t from-black/80 via-transparent to-black/20" >
                           <div className="flex justify-end">
                              {video.category && (
                                 <span className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-black/40 backdrop-blur text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-cream border border-white/10">
                                    {video.category}
                                 </span>
                              )}
                           </div>

                           <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              <h3 className="font-serif text-base md:text-lg text-white leading-tight drop-shadow-md group-hover:text-terracotta transition-colors line-clamp-2">
                                 {video.title}
                              </h3>
                           </div>
                        </div >

                        {/* Centered Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" >
                           <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-terracotta group-hover:border-terracotta transition-all duration-300 shadow-xl">
                              <Play size={20} fill="currentColor" className="ml-1" />
                           </div>
                        </div >
                     </div >
                  </FadeIn >
               ))}
            </div >

            {/* Load More Button */}
            {visibleCount < displayVideos.length && (
               <div className="mt-12 flex justify-center">
                  <FadeIn>
                     <button
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="group inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 bg-white/5 text-cream hover:bg-terracotta hover:border-terracotta hover:text-white transition-all duration-300"
                     >
                        <span className="text-xs font-bold uppercase tracking-widest">Prikaži več videov</span>
                        <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                     </button>
                  </FadeIn>
               </div>
            )}

         </div >

         {/* Reusable Video Modal */}
         < VideoModal
            isOpen={!!selectedVideoId}
            onClose={handleClose}
            videoId={selectedVideoId || undefined}
         />
      </section >
   );
};

export default VideoGallery;
