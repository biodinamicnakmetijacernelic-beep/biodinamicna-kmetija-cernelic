
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { FARM_LOGO } from '../constants';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Check if we're on homepage
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Domov', href: '/', isSection: false },
    { name: 'O Nas', href: '#o-nas', isSection: true },
    { name: 'Pridelki', href: '#ponudba', isSection: true },
    { name: 'Video', href: '#video-galerija', isSection: true },
    { name: 'Galerija', href: '#galerija', isSection: true },
    { name: 'Novice', href: '/blog-novice', isSection: false },
    { name: 'Kontakt', href: '#kontakt', isSection: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${(isScrolled || !isHomePage)
        ? 'glass border-black/5 py-0'
        : 'bg-transparent border-transparent py-1'
        }`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex justify-between items-center">
        {/* Logo Section - Dynamic Background & Resizing */}
        <Link to="/" className="relative z-10 group rounded-xl overflow-hidden p-[1px] hover:scale-105 transition-transform duration-300 origin-left">

          {/* Rotating Conic Gradient Border - Visible only at top of homepage */}
          <div className={`absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.7)_90deg,transparent_180deg)] animate-[spin_4s_linear_infinite] transition-opacity duration-500 ${(isScrolled || !isHomePage) ? 'opacity-0' : 'opacity-60'}`}></div>

          {/* Inner Container: 50% White at Top, Transparent on Scroll */}
          <div className={`relative backdrop-blur-md rounded-xl px-2 py-1 flex items-center justify-center transition-all duration-500 ${(isScrolled || !isHomePage) ? 'bg-transparent border-transparent' : 'bg-white/50 border border-white/20'}`}>
            <img
              src={FARM_LOGO}
              alt="Kmetija Černelič"
              className="w-auto h-12 object-contain"
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.isSection ? `/${link.href}` : link.href}
              onClick={(e) => {
                // Special handling for Domov link
                if (link.name === 'Domov' && isHomePage) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (link.isSection && isHomePage) {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-300 hover:scale-105 transform ${(isScrolled || !isHomePage) ? 'text-olive hover:text-terracotta' : 'text-cream/90 hover:text-white'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-3">
          {/* Menu Toggle */}
          <button
            className={`focus:outline-none transition-colors ${(isScrolled || !isHomePage) ? 'text-olive' : 'text-cream'}`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-full left-0 w-full glass-dark border-b border-white/10 shadow-2xl transition-all duration-500 overflow-hidden ${isMobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col items-center py-6 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.isSection ? `/${link.href}` : link.href}
              onClick={(e) => {
                setIsMobileOpen(false);
                // Special handling for Domov link
                if (link.name === 'Domov' && isHomePage) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (link.isSection && isHomePage) {
                  e.preventDefault();
                  const element = document.querySelector(link.href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="text-cream text-lg font-serif tracking-wide hover:text-terracotta transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
