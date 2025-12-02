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
        <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/85 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 md:p-6 rounded-2xl md:rounded-3xl">
                <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-olive/10 rounded-xl md:rounded-2xl text-olive shrink-0">
                        <Cookie size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="space-y-3 md:space-y-4 w-full">
                        <div>
                            <h3 className="font-serif text-base md:text-lg text-olive-dark mb-0.5 md:mb-1">Piškotki</h3>
                            <p className="text-xs md:text-sm text-olive/70 leading-relaxed">
                                Uporabljamo nujne piškotke za delovanje strani. Z uporabo se strinjate z našo <Link to="/pravno#piskotki" className="text-terracotta hover:underline font-medium">politiko piškotkov</Link>.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="w-full px-4 py-2 md:py-2.5 bg-olive text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl hover:bg-olive-dark transition-colors shadow-lg shadow-olive/20"
                            >
                                Sprejmi
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleAccept}
                        className="text-olive/40 hover:text-olive-dark transition-colors -mt-1 -mr-1 p-1"
                    >
                        <X size={16} className="md:w-5 md:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
