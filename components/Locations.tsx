
import React from 'react';
import { Sun, Store, MapPin, ArrowRight, Navigation, Phone, Calendar, Home, Truck } from 'lucide-react';
import { OPENING_HOURS } from '../constants';
import FadeIn from './FadeIn';

const Locations: React.FC = () => {
  return (
    <section id="kontakt" className="py-20 md:py-32 bg-black text-cream relative overflow-hidden transition-colors duration-300">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-olive-light/20 blur-[150px] pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-none">Kje nas najdete</h2>
              <p className="text-lg md:text-xl text-gray-400 font-light">
                Sveži pridelki neposredno z naše kmetije ali na tržnici v središču prestolnice.
              </p>
            </div>
            <div className="hidden md:block">
              <a href="tel:+38651363447" className="flex items-center gap-2 text-white border border-white/30 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all">
                Kontaktirajte nas <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {OPENING_HOURS.map((item, index) => (
            <FadeIn key={index} delay={index * 200}>
              <div className="group relative bg-[#121212] border border-white/10 p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] hover:border-terracotta/40 transition-all duration-500 overflow-hidden flex flex-col h-full hover:shadow-[0_0_50px_rgba(204,164,59,0.1)]">

                {/* Background Icon */}
                <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-white transform group-hover:rotate-12 duration-700 pointer-events-none">
                  {item.iconType === 'home' ? <Home size={250} /> : item.iconType === 'market' ? <Store size={250} /> : <Sun size={250} />}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="inline-block p-4 bg-white/5 text-terracotta rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      {item.iconType === 'home' ? <Home size={28} /> : item.iconType === 'market' ? <Store size={28} /> : <Sun size={28} />}
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl text-white mb-3 leading-tight">{item.location}</h3>
                  <p className="text-gray-400 font-light text-sm mb-6 md:mb-8 flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-terracotta" />
                    {item.address}
                  </p>

                  <div className="mt-auto space-y-4 md:space-y-6">
                    <div className="border-l-2 border-terracotta/30 pl-6 py-2">
                      <p className="text-2xl md:text-3xl font-light text-white tracking-tight mb-2 whitespace-pre-line">{item.time}</p>
                      <p className="text-terracotta font-medium tracking-wide uppercase text-xs">{item.day}</p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-start gap-3">
                        <Calendar size={18} className="text-gray-500 mt-0.5" />
                        <div className="text-sm text-gray-400 leading-relaxed w-full">
                          <span className="text-white font-bold block text-xs uppercase tracking-widest mb-1 opacity-70">Sezonski urnik</span>
                          {item.season.split('|').map((part, i) => (
                            <span key={i} className="block">{part.trim()}</span>
                          ))}
                        </div>
                      </div>
                      {item.note && (
                        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-terracotta/80 italic">
                          * {item.note}
                        </div>
                      )}
                    </div>

                    {/* Delivery Option Block (For Market) */}
                    {item.deliveryOption && (
                      <div className="p-3 bg-terracotta/10 border border-terracotta/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <Truck size={18} className="text-terracotta shrink-0 mt-0.5" />
                        <p className="text-xs text-cream/80 leading-relaxed">
                          <span className="font-bold text-terracotta block mb-1">Dostava na poti:</span>
                          {item.deliveryOption}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 mt-4">
                      {/* Phone Button (For Farm) */}
                      {item.phoneNumber && (
                        <a
                          href={`tel:${item.phoneNumber.replace(/\s/g, '')}`}
                          className="w-full bg-terracotta text-olive-dark py-3 md:py-4 px-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 group/btn text-sm text-center"
                        >
                          <Phone size={18} />
                          <span className="leading-tight">
                            Pokliči za naročilo
                            <br className="sm:hidden" />
                            {item.phoneNumber && <span className="sm:inline"> </span>}
                            {item.phoneNumber}
                          </span>
                        </a>
                      )}

                      <a
                        href={item.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-white text-black py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg flex items-center justify-center gap-2 group/btn text-sm"
                      >
                        <Navigation size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                        <span>Navodila za pot</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Locations;
