import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:bottom-6 md:w-[340px] z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/90 backdrop-blur-md border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 md:p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-olive/10 rounded-xl text-olive shrink-0">
                        <Cookie size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] md:text-xs text-olive/80 leading-tight mb-2">
                            Uporabljamo piškotke. <Link to="/pravno#piskotki" className="text-terracotta hover:underline font-bold">Več info</Link>
                        </p>
                        <button
                            onClick={handleAccept}
                            className="w-full py-1.5 bg-olive text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-olive-dark transition-colors shadow-sm"
                        >
                            Sprejmi
                        </button>
                    </div>
                    <button
                        onClick={handleAccept}
                        className="text-olive/30 hover:text-olive-dark transition-colors self-start -mt-1 -mr-1 p-1"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
