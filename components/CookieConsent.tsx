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
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-6 rounded-3xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-olive/10 rounded-2xl text-olive shrink-0">
                        <Cookie size={24} />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-serif text-lg text-olive-dark mb-1">Piškotki</h3>
                            <p className="text-sm text-olive/70 leading-relaxed">
                                Uporabljamo nujne piškotke za delovanje strani in video vsebine. Z uporabo strani se strinjate z našo <Link to="/pravno#piskotki" className="text-terracotta hover:underline font-medium">politiko piškotkov</Link>.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2.5 bg-olive text-white text-sm font-bold rounded-xl hover:bg-olive-dark transition-colors shadow-lg shadow-olive/20 flex-1"
                            >
                                Sprejmi
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleAccept}
                        className="text-olive/40 hover:text-olive-dark transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
