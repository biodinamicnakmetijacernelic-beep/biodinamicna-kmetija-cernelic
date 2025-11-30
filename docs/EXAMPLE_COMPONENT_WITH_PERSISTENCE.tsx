// POMEMBNO: Ta komponenta uporablja globalne spremenljivke, ki jih zagotavlja sistem:
// - uploadImage(key: string, file: File): Promise<string> - za nalaganje slik
// - savedImages: Record<string, string> - shranjene slike iz prejšnjih nalaganj

import React, { useRef, useState, ChangeEvent } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, BarChart3, Info, Camera, Play, ExternalLink, ImagePlus, Sprout } from 'lucide-react';

// --- Types & Interfaces ---
interface SectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    delay?: number;
}

interface VideoLink {
    title: string;
    url: string;
}

interface TimelineItemData {
    year: string;
    title: string;
    description: string;
    imageCaption: string;
    image: string;
    details?: string;
    subtext?: string;
    stats?: { om: string; p2o5: string; k2o: string };
    videos?: VideoLink[];
    links?: { label: string; url: string }[];
}

// --- Content Data (Initial State) ---
const INITIAL_CONTENT = {
    header: {
        // Uporabi shranjene slike ali placeholder
        leftLogo: (typeof savedImages !== 'undefined' && savedImages.leftLogo) || "https://placehold.co/200x80/f3f4f6/9ca3af?text=Logo+Levo",
        rightLogo: (typeof savedImages !== 'undefined' && savedImages.rightLogo) || "https://placehold.co/200x80/f3f4f6/9ca3af?text=Logo+Desno"
    },
    hero: {
        title: "Učinkovitost biodinamičnega pristopa pri regeneraciji zbitih nepropustnih tal",
        location: "Parcela v Krški vasi",
        context: "Začasna deponija materiala v času gradbenih del ob Hidroelektrarni Brežice (od 2014 do 2017)"
    },
    timeline: [
        // Timeline data remains the same...
        {
            year: "2014 - 2017",
            title: "Začasna Deponija",
            description: "Začasna deponija materiala v času gradbenih del ob Hidroelektrarni Brežice.",
            imageCaption: "Začasna deponija materiala (od 2014 do 2017)",
            image: (typeof savedImages !== 'undefined' && savedImages.timeline_0) || "https://picsum.photos/seed/img1_deponija/1200/800",
        },
        // ... add more timeline items as needed
    ],
    finalResults: {
        title: "Neverjeten Napredek",
        subtitle: "Primerjava analize tal v obdobju 3.5 let",
        description: "Analize tal na območju profila 1 (do globine 20 cm) kažejo drastično povečanje organske snovi in hranil.",
        beforeDate: "Junij 2017",
        afterDate: "Januar 2021",
        data: [
            { label: "Organska snov (W&B)", unit: "%", before: 2.6, after: 5.18 },
            { label: "P2O5", unit: "mg/100g", before: 0.7, after: 2.8 },
            { label: "K2O", unit: "mg/100g", before: 7.9, after: 15.9 },
        ]
    },
    footer: {
        credits: "Fotografije in video posnetki: Primož in Zvone Černelič",
        preparedBy: "Zapis pripravila: Vesna Čuček, univ. dipl. ekon. in univ. dipl. inž. agr."
    }
};

// --- Helper Components ---
const FadeInView: React.FC<SectionProps> = ({ children, className, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

interface HeaderProps {
    leftLogo: string;
    rightLogo: string;
    onUpdateLeft: (src: string) => void;
    onUpdateRight: (src: string) => void;
}

const Header: React.FC<HeaderProps> = ({ leftLogo, rightLogo, onUpdateLeft, onUpdateRight }) => {
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, callback: (src: string) => void, key: string) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Uporabi uploadImage namesto FileReader
                if (typeof uploadImage !== 'undefined') {
                    const url = await uploadImage(key, file);
                    callback(url);
                } else {
                    // Fallback za lokalni razvoj
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        if (typeof ev.target?.result === 'string') callback(ev.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            } catch (error) {
                console.error('Image upload failed:', error);
                alert('Napaka pri nalaganju slike');
            }
        }
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div
                    onClick={() => leftInputRef.current?.click()}
                    className="relative group cursor-pointer h-12 md:h-16 flex items-center"
                    title="Klikni za zamenjavo logotipa"
                >
                    <img src={leftLogo} alt="Levi logo" className="h-full object-contain max-w-[150px] md:max-w-[200px]" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-gray-600 bg-white/80 rounded-full p-1" />
                    </div>
                    <input
                        type="file"
                        ref={leftInputRef}
                        onChange={(e) => handleFileChange(e, onUpdateLeft, 'leftLogo')}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                <div
                    onClick={() => rightInputRef.current?.click()}
                    className="relative group cursor-pointer h-12 md:h-16 flex items-center"
                    title="Klikni za zamenjavo logotipa"
                >
                    <img src={rightLogo} alt="Desni logo" className="h-full object-contain max-w-[150px] md:max-w-[200px]" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-gray-600 bg-white/80 rounded-full p-1" />
                    </div>
                    <input
                        type="file"
                        ref={rightInputRef}
                        onChange={(e) => handleFileChange(e, onUpdateRight, 'rightLogo')}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            </div>
        </motion.header>
    );
};

// Ostale komponente ostanejo enake (Hero, TimelineItem, ComparisonSection, Footer)...
// Za krajšavo jih izpuščam, ampak princip je enak

export default function App() {
    const [logos, setLogos] = useState({
        left: INITIAL_CONTENT.header.leftLogo,
        right: INITIAL_CONTENT.header.rightLogo
    });

    const updateLogo = (side: 'left' | 'right', src: string) => {
        setLogos(prev => ({ ...prev, [side]: src }));
    };

    return (
        <div className="bg-white min-h-screen text-gray-900">
            <Header
                leftLogo={logos.left}
                rightLogo={logos.right}
                onUpdateLeft={(src) => updateLogo('left', src)}
                onUpdateRight={(src) => updateLogo('right', src)}
            />
            {/* Ostale komponente */}
        </div>
    );
}
