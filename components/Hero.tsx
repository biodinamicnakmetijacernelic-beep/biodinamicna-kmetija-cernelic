
import React, { useState } from 'react';
import { Wheat, Leaf, Layers, ShieldCheck, Play } from 'lucide-react';
import { HERO_TEXT, YOUTUBE_VIDEO_ID } from '../constants';
import FadeIn from './FadeIn';
import VideoModal from './VideoModal';

const Hero: React.FC = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-olive-dark">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/pw/AP1GczNEDNDzB4dOSGui3fMFWMz-N33TA9EHRs-tBtXz8SEIdHSLQsxR6TNSFbJ2pxVWiv1V7WoBzm9zUzzFG63SS41a45OI-iMccYZ9scf1RMWCx0FGxyJhW9iA8FyEV7u7gL2I5J6GnrsrW4cjXNSpJXJy=w3024-h1702-s-no?authuser=0')",
          animation: 'slow-zoom 25s infinite alternate ease-in-out'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-olive-dark/90" />
      </div>

      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-border-flow {
          background-size: 200% 200%;
          animation: border-flow 4s ease infinite;
        }
        .group:hover .shine-effect {
          animation: shine 1.5s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center flex-grow pt-20 pb-40 md:pb-48">

        {/* Demeter Badge */}
        <FadeIn delay={200} direction="up" blur={true}>
          <div className="group relative inline-flex items-center justify-center mb-6 md:mb-10">
            {/* Animated Gradient Border */}
            <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-orange-400 via-yellow-200 to-orange-400 opacity-60 blur-[2px] animate-border-flow transition-opacity duration-500 group-hover:opacity-100"></div>

            {/* Badge Content */}
            <div className="relative flex items-center gap-3 md:gap-4 px-4 md:px-6 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              <img
                src="https://demeter.net/wp-content/uploads/2021/04/Demeter_RGB.png"
                alt="Demeter Logo"
                className="h-6 md:h-8 w-auto object-contain drop-shadow-md"
              />
              <div className="h-4 w-[1px] bg-white/20"></div>
              <span className="text-[10px] md:text-[11px] font-bold text-white/90 uppercase tracking-[0.2em] whitespace-nowrap">
                Certifikat od leta 2014
              </span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={400} direction="up" blur={true}>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[1.1] md:leading-none text-cream mb-6 md:mb-8 drop-shadow-2xl tracking-tight">
            Kjer narava <br />
            <span className="italic text-terracotta relative inline-block px-2 md:px-4">
              <span className="relative z-10">sreča</span>
              <svg className="absolute -bottom-1 left-0 w-full h-3 md:h-4 text-terracotta opacity-80" viewBox="0 0 100 15" preserveAspectRatio="none">
                <path d="M0 8 Q 50 15 100 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span> tradicijo.
          </h1>
        </FadeIn>

        <FadeIn delay={600} direction="up" blur={true}>
          <p className="font-sans text-base sm:text-lg md:text-2xl font-light text-cream/90 max-w-xl md:max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12 drop-shadow-lg px-2">
            {HERO_TEXT.subtitle}
          </p>
        </FadeIn>

        <FadeIn delay={800} direction="up" scale={true}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center mb-8 w-full sm:w-auto">
            <a
              href="#ponudba"
              className="w-full sm:w-auto group relative bg-cream text-olive-dark px-8 md:px-10 py-3 md:py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
            >
              <span className="relative z-10 group-hover:text-olive transition-colors block text-center">Razišči Ponudbo</span>
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
            </a>

            {/* Watch Video Button with Rotating Light Border */}
            <div className="w-full sm:w-auto relative group p-[1px] rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer flex justify-center" onClick={() => setIsVideoOpen(true)}>
              {/* Rotating Conic Gradient Border */}
              <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.8)_90deg,transparent_180deg)] animate-spin-slow opacity-60"></div>

              <button
                className="w-full sm:w-auto relative z-10 flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest text-white bg-black/30 hover:bg-black/50 transition-colors backdrop-blur-md"
              >
                <span>Poglej Video</span>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-terracotta text-olive-dark flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play size={12} fill="currentColor" className="ml-0.5" />
                </div>
              </button>
            </div>

          </div>
        </FadeIn>
      </div>

      {/* Minimalist Feature Grid at Bottom with Shimmer */}
      <FadeIn delay={1000} direction="up" className="w-full absolute bottom-8 md:bottom-12 z-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 pb-4">

          {/* VITALNOST */}
          <div className="flex flex-col items-center text-center group cursor-default">
            <div className="mb-2 md:mb-4 relative p-3 md:p-4 rounded-full bg-white/5 overflow-hidden group-hover:bg-white/10 transition-colors duration-500">
              <Wheat size={24} className="md:w-8 md:h-8 text-white/80 group-hover:text-terracotta transition-colors relative z-10" strokeWidth={1} />
              {/* Shimmer overlay masked by rounded-full */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shine-effect z-0"></div>
            </div>
            <h4 className="text-white font-serif font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 group-hover:text-terracotta transition-colors">Vitalnost</h4>
            <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-wide group-hover:text-white/70 transition-colors hidden sm:block">Energija narave</p>
          </div>

          {/* SOŽITJE */}
          <div className="flex flex-col items-center text-center group cursor-default">
            <div className="mb-2 md:mb-4 relative p-3 md:p-4 rounded-full bg-white/5 overflow-hidden group-hover:bg-white/10 transition-colors duration-500">
              <Leaf size={24} className="md:w-8 md:h-8 text-white/80 group-hover:text-terracotta transition-colors relative z-10" strokeWidth={1} />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shine-effect z-0"></div>
            </div>
            <h4 className="text-white font-serif font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 group-hover:text-terracotta transition-colors">Sožitje</h4>
            <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-wide group-hover:text-white/70 transition-colors hidden sm:block">Harmonija okolja</p>
          </div>

          {/* TLA */}
          <div className="flex flex-col items-center text-center group cursor-default">
            <div className="mb-2 md:mb-4 relative p-3 md:p-4 rounded-full bg-white/5 overflow-hidden group-hover:bg-white/10 transition-colors duration-500">
              <Layers size={24} className="md:w-8 md:h-8 text-white/80 group-hover:text-terracotta transition-colors relative z-10" strokeWidth={1} />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shine-effect z-0"></div>
            </div>
            <h4 className="text-white font-serif font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 group-hover:text-terracotta transition-colors">Tla</h4>
            <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-wide group-hover:text-white/70 transition-colors hidden sm:block">Temelj rodovitnosti</p>
          </div>

          {/* ODGOVORNOST */}
          <div className="flex flex-col items-center text-center group cursor-default">
            <div className="mb-2 md:mb-4 relative p-3 md:p-4 rounded-full bg-white/5 overflow-hidden group-hover:bg-white/10 transition-colors duration-500">
              <ShieldCheck size={24} className="md:w-8 md:h-8 text-white/80 group-hover:text-terracotta transition-colors relative z-10" strokeWidth={1} />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full shine-effect z-0"></div>
            </div>
            <h4 className="text-white font-serif font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 group-hover:text-terracotta transition-colors">Odgovornost</h4>
            <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-wide group-hover:text-white/70 transition-colors hidden sm:block">Demeter Standard</p>
          </div>

        </div>
      </FadeIn>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoId={YOUTUBE_VIDEO_ID}
      />
    </section>
  );
};

export default Hero;
