
import React from 'react';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { LOGO_PATHS, FARM_LOGO } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer id="kontakt" className="bg-white text-olive-dark pt-16 md:pt-20 pb-8 rounded-t-[2rem] md:rounded-t-[3rem] mt-[-2rem] relative z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12">

          {/* Brand & Info */}
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-4">
              {/* Farm Logo */}
              <img
                src={FARM_LOGO}
                alt="Kmetija Černelič Logo"
                className="h-14 md:h-16 w-auto object-contain"
              />
            </div>
            <p className="text-olive/70 text-sm md:text-base leading-relaxed max-w-md font-light">
              V sožitju z naravo pridelujemo hrano, ki hrani telo in duha.
              Pionirji biodinamike v Posavju, zavezani najvišjim standardom kakovosti.
            </p>

            {/* Control Numbers Block */}
            <div className="pt-4 border-t border-olive/10">
              <p className="text-xs text-olive/60 font-mono space-y-1">
                <span className="block">Šifra kontrolne organizacije: <strong className="text-olive-dark">SI-EKO-001</strong></span>
                <span className="block">Kontrolna številka kmetije: <strong className="text-olive-dark">15403</strong></span>
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-terracotta text-xs font-bold uppercase tracking-widest">Kontakt</h4>
            <div className="space-y-4">
              <a href="mailto:ekocernelic@gmail.com" className="flex items-center gap-3 text-olive/80 hover:text-terracotta transition-colors group">
                <div className="p-2 bg-olive/5 rounded-full group-hover:bg-terracotta/10 transition-colors">
                  <Mail size={16} />
                </div>
                <span className="font-medium">ekocernelic@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-olive/80 group">
                <div className="p-2 bg-olive/5 rounded-full">
                  <Phone size={16} />
                </div>
                <span className="font-medium">+386 51 363 447</span>
              </div>
            </div>
          </div>

          {/* Social & Certs */}
          <div className="space-y-6">
            <h4 className="text-terracotta text-xs font-bold uppercase tracking-widest">Povezave & Certifikati</h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="p-3 bg-olive/5 rounded-full hover:bg-[#1877F2] hover:text-white transition-all transform hover:-translate-y-1 text-olive">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-3 bg-olive/5 rounded-full hover:bg-[#E4405F] hover:text-white transition-all transform hover:-translate-y-1 text-olive">
                <Instagram size={20} />
              </a>
            </div>

            <div className="flex items-center gap-4">
              {/* Demeter Logo SVG (Dark for white bg) */}
              <div className="group relative">
                <div className="h-12 w-12 bg-olive/5 rounded-full flex items-center justify-center hover:bg-orange-500/10 transition-colors cursor-help">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-olive-dark group-hover:text-orange-500 transition-colors">
                    <path d={LOGO_PATHS.demeter} />
                  </svg>
                </div>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-olive-dark text-white px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Demeter</span>
              </div>

              {/* EU Organic Logo Placeholder */}
              <div className="group relative">
                <div className="h-12 w-16 bg-olive/5 rounded-lg flex items-center justify-center hover:bg-green-500/10 transition-colors cursor-help">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-olive-dark rounded-full"></div>
                    <div className="w-1 h-1 bg-olive-dark rounded-full"></div>
                    <div className="w-1 h-1 bg-olive-dark rounded-full"></div>
                  </div>
                </div>
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-olive-dark text-white px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">EU Ekološko</span>
              </div>
            </div>
          </div>
        </div>

        {/* EIP Banner Image - Full Width / Centered */}
        <div className="border-t border-olive/10 pt-8 pb-8 flex justify-center">
          <img
            src="https://www.fkbv.um.si/wp-content/uploads/2022/01/Zajeta-slika-oznacitev-EIP-4.png"
            alt="Evropsko partnerstvo za inovacije - EIP"
            className="max-w-full h-auto max-h-28 object-contain"
          />
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-olive/40 pt-8 border-t border-olive/10">
          <p className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} Kmetija Černelič. Vse pravice pridržane.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-olive-dark transition-colors">Zasebnost</a>
            <a href="#" className="hover:text-olive-dark transition-colors">Pogoji uporabe</a>
            <a href="#" className="hover:text-olive-dark transition-colors">Piškotki</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
