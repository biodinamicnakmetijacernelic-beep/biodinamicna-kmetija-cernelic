import React, { useRef, useState, ChangeEvent, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, BarChart3, Info, Camera, Play, ExternalLink, ImagePlus, Sprout } from 'lucide-react';
import set from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';


// --- TYPES ---
// Note: All types are kept the same as in the original file.
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

interface PostContent {
    header: {
        leftLogo: string;
        rightLogo: string;
    };
    hero: {
        title: string;
        location: string;
        context: string;
    };
    timeline: TimelineItemData[];
    finalResults: {
        title: string;
        subtitle: string;
        description: string;
        beforeDate: string;
        afterDate: string;
        data: { label: string; unit: string; before: number; after: number }[];
    };
    footer: {
        credits: string;
        preparedBy: string;
    };
}

// --- PROPS FOR THE MAIN COMPONENT ---

interface RegenerativePostProps {
    /**
     * The initial content structure for the post.
     */
    initialContent: PostContent;
    /**
     * A record of previously saved images with their keys.
     */
    savedImages?: Record<string, string>;
    /**
     * A function provided by the parent to handle file uploads.
     * It should return a promise that resolves with the new image URL.
     */
    onImageUpload: (key: string, file: File) => Promise<string>;
}


// ====================================================================================
// REUSABLE & DECOUPLED CHILD COMPONENTS
// These components are now "dumb" - they only display data and emit events.
// They do not contain any upload logic themselves.
// ====================================================================================

const FadeInView: React.FC<SectionProps> = ({ children, className, delay = 0 }) => (
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

interface HeaderProps {
    leftLogo: string;
    rightLogo: string;
    onSelectFile: (side: 'left' | 'right', file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ leftLogo, rightLogo, onSelectFile }) => {
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
        const file = e.target.files?.[0];
        if (file) {
            onSelectFile(side, file);
        }
    };

    const ImageSlot: React.FC<{
        side: 'left' | 'right';
        logo: string;
        inputRef: React.RefObject<HTMLInputElement>;
    }> = ({ side, logo, inputRef }) => (
        <div
            onClick={() => inputRef.current?.click()}
            className="relative group cursor-pointer h-12 md:h-16 flex items-center"
            title="Klikni za zamenjavo logotipa"
        >
            <img src={logo} alt={`${side} logo`} className="h-full object-contain max-w-[150px] md:max-w-[200px]" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-gray-600 bg-white/80 rounded-full p-1" />
            </div>
            <input
                type="file"
                ref={inputRef}
                onChange={(e) => handleFileChange(e, side)}
                className="hidden"
                accept="image/*"
            />
        </div>
    );

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <ImageSlot side="left" logo={leftLogo} inputRef={leftInputRef} />
                <ImageSlot side="right" logo={rightLogo} inputRef={rightInputRef} />
            </div>
        </motion.header>
    );
};


interface TimelineItemProps {
    data: TimelineItemData;
    onFileSelect: (file: File) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ data, onFileSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
    const yImage = useTransform(scrollYProgress, [0, 1], [0, -30]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };
    
    // Most of the JSX is identical to the original, only the upload logic is removed.
    // For brevity, only the changed parts are shown with full detail.
    return (
        <motion.div ref={containerRef} /* ... styles */ >
            {/* ... background year ... */}
            <motion.div style={{ y: yImage }} className="flex-1 w-full">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group rounded-3xl shadow-xl bg-gray-50 cursor-pointer border border-gray-100 overflow-hidden"
                    title="Klikni za zamenjavo slike"
                >
                    <img src={data.image} alt={data.imageCaption} className="w-full h-auto max-h-[70vh] object-contain" />
                    {/* ... overlays ... */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-2">
                            <Camera className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-semibold">Zamenjaj sliko</span>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </motion.div>
            {/* ... text column ... */}
        </motion.div>
    );
};


// Other stateless components (Hero, ComparisonSection, Footer) remain unchanged as they were already correct.
// They are included here for completeness.

const Hero: React.FC<{ content: PostContent['hero'] }> = ({ content }) => {
     const ref = useRef(null);
     const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"]});
     const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
     const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
 
     return (
         <section ref={ref} className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-white pt-20">
             <div className="max-w-4xl mx-auto px-6 text-center z-10">
                 <motion.div style={{ y, opacity }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }}>
                     <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-800">
                             Regeneracija Nepropustnih Tal
                         </span>
                     </h1>
                     <p className="text-lg md:text-xl text-gray-500 font-light max-w-2xl mx-auto">{content.title}</p>
                     <div className="mt-8 flex items-center justify-center gap-4 text-gray-400 text-sm">
                         <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {content.location}</div>
                     </div>
                 </motion.div>
             </div>
         </section>
     );
};
 
const ComparisonSection: React.FC<{ content: PostContent['finalResults'] }> = ({ content }) => (
     <section className="py-32 bg-black text-white">
         <div className="max-w-7xl mx-auto px-6">
             <FadeInView className="text-center mb-20">
                 <h2 className="text-5xl md:text-7xl font-bold">{content.title}</h2>
                 <p className="text-xl text-gray-400 max-w-2xl mx-auto">{content.subtitle}</p>
             </FadeInView>
             {/* ... mapping over content.data ... */}
         </div>
     </section>
);
 
const Footer: React.FC<{ content: PostContent['footer'] }> = ({ content }) => (
    <footer className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <p className="text-gray-500">{content.credits}</p>
            <div className="h-px w-24 bg-gray-200 mx-auto"></div>
            <p className="text-sm text-gray-400 max-w-lg mx-auto">{content.preparedBy}</p>
        </div>
    </footer>
);

// ====================================================================================
// MAIN COMPONENT: RegenerativePost
// This is the primary, self-contained component. It manages its own state
// and uses the `onImageUpload` prop to delegate file uploading to its parent.
// ====================================================================================

export const RegenerativePost: React.FC<RegenerativePostProps> = ({ initialContent, savedImages, onImageUpload }) => {

    // Initialize the state by merging initial content with any saved images.
    const getInitialState = () => {
        const content = cloneDeep(initialContent);
        if (savedImages) {
            Object.entries(savedImages).forEach(([key, url]) => {
                if(url) set(content, key, url);
            });
        }
        return content;
    };

    const [content, setContent] = useState<PostContent>(getInitialState);
    const [uploadingStatus, setUploadingStatus] = useState<Record<string, boolean>>({});

    const handleImageUpdate = useCallback(async (key: string, file: File) => {
        setUploadingStatus(prev => ({ ...prev, [key]: true }));
        try {
            const newUrl = await onImageUpload(key, file);
            setContent(currentContent => {
                const newContent = cloneDeep(currentContent);
                set(newContent, key, newUrl);
                return newContent;
            });
        } catch (error) {
            console.error(`Upload failed for key ${key}:`, error);
            alert(`Napaka pri nalaganju slike za ${key}`);
        } finally {
            setUploadingStatus(prev => ({ ...prev, [key]: false }));
        }
    }, [onImageUpload]);

    return (
        <div className="bg-white min-h-screen text-gray-900">
            <Header
                leftLogo={content.header.leftLogo}
                rightLogo={content.header.rightLogo}
                onSelectFile={(side, file) => handleImageUpdate(`header.${side}Logo`, file)}
            />

            <Hero content={content.hero} />

            <main className="max-w-7xl mx-auto px-6 space-y-0">
                <div className="py-12 text-center max-w-3xl mx-auto">
                    <FadeInView>
                        <p className="text-2xl font-medium">{content.hero.context}</p>
                    </FadeInView>
                </div>

                {content.timeline.map((item, index) => (
                    <TimelineItem
                        key={index}
                        data={item}
                        onFileSelect={(file) => handleImageUpdate(`timeline[${index}].image`, file)}
                    />
                ))}
            </main>

            <ComparisonSection content={content.finalResults} />
            <Footer content={content.footer} />
        </div>
    );
}

// ====================================================================================
// EXAMPLE USAGE / DEMO
// This App component demonstrates how to use the `RegenerativePost` component.
// In a real application, this logic would be part of your main app structure.
// ====================================================================================

// --- Mock Data and Functions for Demonstration ---

const MOCK_INITIAL_CONTENT: PostContent = {
    header: {
        leftLogo: "https://placehold.co/200x80/f3f4f6/9ca3af?text=Levo",
        rightLogo: "https://placehold.co/200x80/f3f4f6/9ca3af?text=Desno"
    },
    hero: { /* ... */ title: "Učinkovitost biodinamičnega pristopa", location: "Krška vas", context: "Začasna deponija materiala..." },
    timeline: [
        {
            year: "2014 - 2017",
            title: "Začasna Deponija",
            description: "Opis deponije...",
            imageCaption: "Deponija materiala",
            image: "https://picsum.photos/seed/demo1/1200/800",
        },
        {
            year: "Junij 2017",
            title: "Stanje po Odstranitvi",
            description: "Tla so bila gola...",
            imageCaption: "Pogled na parcelo",
            image: "https://picsum.photos/seed/demo2/1200/800",
        }
        // ... more timeline items
    ],
    finalResults: { /* ... */ title: "Neverjeten Napredek", subtitle:"Primerjava", description: "Analize tal...", beforeDate: "Junij 2017", afterDate: "Januar 2021", data: [] },
    footer: { credits: "Foto: P. Černelič", preparedBy: "Pripravila: V. Čuček" }
};

/**
 * MOCK `savedImages` object. In a real app, this would come from your database or backend.
 */
const MOCK_SAVED_IMAGES: Record<string, string> = {
    'header.leftLogo': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    'timeline[1].image': 'https://images.unsplash.com/photo-1586796677499-4ac044d42198?w=800'
};

/**
 * MOCK upload handler. In a real app, this would contain your fetch/axios call to your server.
 */
const mockUploadHandler = async (key: string, file: File): Promise<string> => {
    console.log(`[Uploader] Started uploading for key: "${key}", file:`, file.name);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, you would upload the file and get a URL.
    // Here, we'll just return a new placeholder image URL.
    const newImageUrl = `https://picsum.photos/seed/${Math.random()}/1200/800`;
    
    console.log(`[Uploader] Finished. New URL is: ${newImageUrl}`);
    
    // To see the state persistence locally, you could use localStorage:
    // const saved = JSON.parse(localStorage.getItem('savedImages') || '{}');
    // saved[key] = newImageUrl;
    // localStorage.setItem('savedImages', JSON.stringify(saved));

    return newImageUrl;
};


export default function App() {
    return (
        <RegenerativePost
            initialContent={MOCK_INITIAL_CONTENT}
            savedImages={MOCK_SAVED_IMAGES}
            onImageUpload={mockUploadHandler}
        />
    );
}
