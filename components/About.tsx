
import React, { useState, useEffect } from 'react';
import { Sprout, Recycle, Leaf, Trophy, Globe, Medal, Users, Moon, Maximize2, X } from 'lucide-react';
import { ABOUT_TEXT, FEATURES, AWARDS_LIST, PHILOSOPHY_TEXT } from '../constants';
import { AwardItem } from '../types';
import FadeIn from './FadeIn';
import { fetchAwards } from '../sanityClient';

const About: React.FC = () => {
  const [selectedAward, setSelectedAward] = useState<AwardItem | null>(null);
  const [awards, setAwards] = useState<AwardItem[]>(AWARDS_LIST);

  // Fetch awards from Sanity
  useEffect(() => {
    const loadAwards = async () => {
      const sanityAwards = await fetchAwards();
      if (sanityAwards && sanityAwards.length > 0) {
        setAwards(sanityAwards);
      }
    };
    loadAwards();
  }, []);

  // Lock body scroll when award modal is open
  useEffect(() => {
    if (selectedAward) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedAward]);

  return (
    <section id="o-nas" className="bg-cream relative z-20 transition-colors duration-300">

      {/* Header & Intro Quote */}
      <div className="pt-16 md:pt-24 pb-10 md:pb-16 container mx-auto px-6 max-w-7xl">
        <FadeIn delay={100} direction="up">
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-olive-dark text-center mb-10 md:mb-16 leading-[0.9]">
            {ABOUT_TEXT.title}
          </h2>
        </FadeIn>

        <FadeIn delay={300} direction="up" scale>
          <div className="max-w-4xl mx-auto text-center relative px-2">
            <div className="absolute top-0 left-0 text-6xl md:text-8xl text-terracotta/10 font-serif transform -translate-x-4 md:-translate-x-8 -translate-y-4 md:-translate-y-6">"</div>
            <p className="font-serif text-lg sm:text-2xl md:text-3xl text-olive leading-relaxed font-light italic relative z-10">
              {ABOUT_TEXT.quote}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Narrative Story Blocks (Zig-Zag Layout) */}
      <div className="container mx-auto px-6 max-w-7xl pb-24 md:pb-48">
        <div className="space-y-20 md:space-y-32">
          {ABOUT_TEXT.storyBlocks.map((block, index) => (
            <div key={block.id} className={`flex flex-col md:flex-row items-center gap-10 md:gap-24 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>

              {/* Content Side */}
              <div className="w-full md:w-1/2">
                <FadeIn direction={index % 2 === 0 ? 'right' : 'left'} delay={200}>
                  <div className="flex flex-col gap-4 md:gap-6">
                    <span className="inline-block text-terracotta font-bold tracking-widest uppercase text-xs md:text-sm border-b border-terracotta/30 w-max pb-2">
                      {block.id === 'today' ? 'Sedanjost' : `Leto ${block.id}`}
                    </span>
                    <h3 className="font-serif text-3xl md:text-4xl text-olive-dark leading-tight">
                      {block.title}
                    </h3>
                    <p className="font-sans text-base md:text-lg text-olive/70 leading-relaxed font-light">
                      {block.content}
                    </p>
                  </div>
                </FadeIn>
              </div>

              {/* Image Side */}
              <div className="w-full md:w-1/2">
                <FadeIn direction={index % 2 === 0 ? 'left' : 'right'} delay={400} scale>
                  <div className="relative group">
                    <div className={`absolute -inset-4 bg-terracotta/10 rounded-[2rem] md:rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${index % 2 === 0 ? '-rotate-2' : 'rotate-2'}`}></div>
                    <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl h-[300px] sm:h-[400px] md:h-[500px]">
                      <img
                        src={block.image}
                        alt={block.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </FadeIn>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Awards Section (Premium Dark Block) */}
      <div className="bg-olive-dark py-20 md:py-32 rounded-t-[3rem] md:rounded-t-[4rem] -mt-10 md:-mt-20 relative z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-7xl">
          <FadeIn>
            <div className="text-center mb-12 md:mb-20">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-terracotta/30 bg-terracotta/10 text-terracotta text-xs md:text-sm font-bold uppercase tracking-widest mb-6 md:mb-8">
                <Trophy size={16} />
                <span>Priznanja in Dosežki</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-6xl text-cream mb-6 md:mb-8">Izjemna Evropska Priznanja</h2>
              <p className="text-cream/60 max-w-2xl mx-auto text-base md:text-xl font-light leading-relaxed">
                Naša zavezanost živim tlom in biodinamiki je bila prepoznana na najvišji evropski ravni.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {awards.map((award, idx) => (
              <FadeIn key={award.id} delay={idx * 200} className="h-full">
                <div
                  onClick={() => setSelectedAward(award)}
                  className="group relative bg-[#2A3829] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] min-h-[450px] cursor-pointer flex flex-col"
                >

                  {/* Glow Effect on Hover (White/Bright) */}
                  <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-white/50 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500 pointer-events-none z-30"></div>

                  {/* Background Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={award.image}
                      alt={award.title}
                      className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700 ease-out"
                    />
                  </div>

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:bg-black/70 transition-all duration-500" />

                  {/* Centered CTA Button (Visible on Hover) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100 z-30 pointer-events-none">
                    <div className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <Maximize2 size={18} className="text-terracotta" />
                      <span className="text-sm font-bold uppercase tracking-widest">Poglej certifikat</span>
                    </div>
                  </div>

                  {/* Content at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full z-20 pointer-events-none group-hover:opacity-100 transition-opacity duration-500">

                    {/* Icon Badge */}
                    <div className="absolute top-6 right-6 p-3 bg-white/5 backdrop-blur-md rounded-2xl text-terracotta border border-white/10 shadow-lg">
                      {idx === 0 && <Globe size={24} />}
                      {idx === 1 && <Users size={24} />}
                      {idx === 2 && <Medal size={24} />}
                    </div>

                    <div className="transform translate-y-0 transition-transform duration-500">
                      <span className="inline-block px-3 py-1 bg-terracotta text-olive-dark text-[10px] font-bold uppercase tracking-widest mb-4 rounded-full">
                        {award.highlight}
                      </span>

                      <h3 className="font-serif text-xl sm:text-2xl text-white leading-tight mb-2 drop-shadow-md">
                        {award.title}
                      </h3>

                      <p className="text-white/60 text-xs font-bold uppercase tracking-wide">
                        {award.issuer}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Award Floating Window Modal (Smaller Size) */}
      {selectedAward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-24">
          {/* Soft Blurred Backdrop */}
          <div
            className="absolute inset-0 bg-olive-dark/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedAward(null)}
          />

          {/* Floating Window Container - Smaller */}
          <div className="relative z-10 w-full max-w-2xl bg-cream rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[80vh]">

            {/* Window Header / Close */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 bg-white/50 backdrop-blur-sm">
              <h3 className="font-serif text-lg md:text-xl text-olive-dark px-2 truncate">{selectedAward.title}</h3>
              <button
                onClick={() => setSelectedAward(null)}
                className="p-2 text-olive hover:text-olive-dark bg-black/5 hover:bg-black/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image Container - Smaller */}
            <div className="bg-white overflow-auto p-4 md:p-6 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              <img
                src={selectedAward.image}
                alt={selectedAward.title}
                className="w-auto h-auto max-w-full max-h-[50vh] object-contain shadow-lg rounded-lg"
              />
            </div>

            {/* Footer Details */}
            <div className="bg-white p-4 md:p-6 border-t border-black/5 text-center">
              <p className="text-terracotta font-bold uppercase tracking-widest text-xs md:text-sm mb-2">{selectedAward.highlight}</p>
              <p className="text-olive/70 text-sm leading-relaxed max-w-xl mx-auto">{selectedAward.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Philosophy / Principles Section - Updated "3 Pillars" Design */}
      <div className="bg-white py-20 md:py-32 border-b border-black/5 transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-7xl">

          {/* Section Intro */}
          <div className="mb-12 md:mb-20 text-center max-w-3xl mx-auto">
            <FadeIn>
              <span className="text-terracotta uppercase tracking-widest text-xs font-bold mb-4 block">
                {PHILOSOPHY_TEXT.subtitle}
              </span>
              <h3 className="font-serif text-3xl md:text-4xl text-olive-dark mb-6 md:mb-8 leading-tight">
                {PHILOSOPHY_TEXT.title}
              </h3>
              <p className="text-olive/70 text-base md:text-xl font-light leading-relaxed">
                {PHILOSOPHY_TEXT.intro}
              </p>
            </FadeIn>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {FEATURES.map((feature, index) => (
              <FadeIn key={feature.id} delay={index * 150} className="h-full">
                <div className="group h-full bg-cream rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-t-4 border-terracotta flex flex-col">

                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-olive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Icon Header */}
                  <div className="flex justify-center mb-6 md:mb-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-terracotta flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white transition-all duration-500">
                      {feature.icon === 'recycle' && <Recycle size={32} strokeWidth={1.5} />}
                      {feature.icon === 'sprout' && <Sprout size={32} strokeWidth={1.5} />}
                      {feature.icon === 'moon' && <Moon size={32} strokeWidth={1.5} />}
                      {feature.icon === 'leaf' && <Leaf size={32} strokeWidth={1.5} />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10 flex flex-col flex-grow">
                    <h4 className="font-serif text-xl md:text-2xl font-bold text-olive-dark mb-4 md:mb-6 leading-tight group-hover:text-olive transition-colors">
                      {feature.title}
                    </h4>

                    <p className="text-olive/70 text-sm md:text-base leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>

                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
