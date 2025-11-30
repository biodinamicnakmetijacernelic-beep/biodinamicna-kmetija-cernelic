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
        // Initial placeholders for logos
        leftLogo: "https://placehold.co/200x80/f3f4f6/9ca3af?text=Logo+Levo",
        rightLogo: "https://placehold.co/200x80/f3f4f6/9ca3af?text=Logo+Desno"
    },
    hero: {
        title: "Učinkovitost biodinamičnega pristopa pri regeneraciji zbitih nepropustnih tal",
        location: "Parcela v Krški vasi",
        context: "Začasna deponija materiala v času gradbenih del ob Hidroelektrarni Brežice (od 2014 do 2017)"
    },
    timeline: [
        // --- Page 1 ---
        {
            year: "2014 - 2017",
            title: "Začasna Deponija",
            description: "Začasna deponija materiala v času gradbenih del ob Hidroelektrarni Brežice. Tla so bila v tem obdobju močno zbita in nepropustna zaradi težke mehanizacije.",
            imageCaption: "Začasna deponija materiala (od 2014 do 2017)",
            image: "https://picsum.photos/seed/img1_deponija/1200/800",
        },
        {
            year: "2014",
            title: "Atlas Okolja",
            description: "Pogled na lokacijo iz zraka v času deponije. Rdeči krog označuje območje parcele 4338/1, ki je bila uporabljena za odlaganje materiala.",
            imageCaption: "Začasna deponija materiala leta 2014, parcela 4338/1, ortofoto",
            image: "https://picsum.photos/seed/img2_ortofoto2014/1200/800",
        },

        // --- Page 2 ---
        {
            year: "Junij 2017",
            title: "Stanje po Odstranitvi",
            description: "Vzpostavitev prvotnega stanja kmetijskih zemljišč. Tla so bila gola in vidno prizadeta.",
            imageCaption: "Pogled na parcelo junija 2017",
            image: "https://picsum.photos/seed/img3_junij2017/1200/800",
        },
        {
            year: "Junij 2017",
            title: "Lokacije Profilov",
            description: "Strokovno mnenje Univerze v Ljubljani (Biotehniška fakulteta). Na sliki so označene točke odvzemov vzorcev (Profil 1, 2 in 3).",
            imageCaption: "Zračni posnetek z označenimi profili (Φ1, Φ2, Φ3)",
            image: "https://picsum.photos/seed/img4_profili/1200/800",
        },
        {
            year: "Junij 2017",
            title: "Analiza Profila 1",
            description: "Izkop profila do globine, kjer so bila analizirana tla. Rezultati so pokazali nizko vsebnost organske snovi.",
            imageCaption: "Profil 1 - Izkop in meritve",
            image: "https://picsum.photos/seed/img5_profil1/1200/800",
            stats: {
                om: "2.6%",
                p2o5: "0.7",
                k2o: "7.9"
            }
        },

        // --- Page 3 ---
        {
            year: "April 2018",
            title: "GERK Ortofoto",
            description: "Javni pregledovalnik grafičnih podatkov prikazuje stanje parcele spomladi 2018, preden se je vegetacija v celoti razvila.",
            imageCaption: "Ortofoto april 2018 (http://rkg.gov.si/GERK/WebViewer)",
            image: "https://picsum.photos/seed/img6_gerk2018/1200/800",
            details: "Številka GERK-a: 987836, k.o. Krška vas"
        },

        // --- Page 4 ---
        {
            year: "Sept 2018",
            title: "Mulčenje",
            description: "Mulčenje biodiverzitetne mešanice za regenerativno kmetovanje. Mešanica je vsebovala 25 vrst rastlin za povečanje humusa.",
            imageCaption: "Traktor pri mulčenju mešanice",
            image: "https://picsum.photos/seed/img7_tractor_front/1200/800",
            videos: [
                { title: "Video mulčenja (25 sek)", url: "#" }
            ],
            links: [
                { label: "Katalog Camena (str. 61)", url: "https://www.camena-samen.de/liste_2021.pdf" }
            ]
        },
        {
            year: "Sept 2018",
            title: "Visoka Biomasa",
            description: "Rastline so dosegle višino preko 2 metrov, kar zagotavlja ogromno organske mase za tla.",
            imageCaption: "Pogled na polje med mulčenjem",
            image: "https://picsum.photos/seed/img8_field_view/1200/800",
        },

        // --- Page 5 ---
        {
            year: "Sept 2018",
            title: "Podrahljavanje",
            description: "Podrahljavanje z riperjem 30 cm globoko. Oblika nogače je zelo pomembna za pravilno rahljanje brez obračanja plasti. Hitrost vožnje max 5 km/h.",
            imageCaption: "Podrahljavanje z riperjem (30 cm globoko)",
            image: "https://picsum.photos/seed/img9_subsoiling/1200/800",
            videos: [
                { title: "Video podrahljavanje (20 sek)", url: "#" }
            ]
        },
        {
            year: "Sept 2018",
            title: "Ročno Škropljenje",
            description: "Škropljenje biodinamičnih preparatov z nahrbtno škropilnico. Za 1,4 ha veliko parcelo je to vzelo le 20 minut.",
            subtext: "Uporabljeni preparati: 500, 500P ali preparat po Mariji Thun.",
            imageCaption: "Ročno škropljenje na polju",
            image: "https://picsum.photos/seed/img10_spraying/1200/800",
            videos: [
                { title: "Video škropljenja (20 sek)", url: "#" }
            ]
        },

        // --- Page 6 ---
        {
            year: "Maj 2019",
            title: "Mulčenje",
            description: "28. maj 2019: Mulčenje prezimne mešanice (Wintergrün, 7 vrst rastlin). Ponovno visoka biomasa za regeneracijo.",
            imageCaption: "Zračni posnetek mulčenja - maj 2019",
            image: "https://picsum.photos/seed/img11_drone2019/1200/800",
            videos: [
                { title: "Video mulčenja 2019 (12 sek)", url: "#" }
            ],
            links: [
                { label: "Opis mešanice (str. 62)", url: "https://www.camena-samen.de/liste_2021.pdf" }
            ]
        },
        {
            year: "Maj 2019",
            title: "Višina Rastlin",
            description: "Prikaz višine rastlin v primerjavi s človekom. Mešanica je bila ponovno višja od 2 metrov.",
            imageCaption: "Človek v visoki travi - maj 2019",
            image: "https://picsum.photos/seed/img12_man_grass/1200/800",
        },

        // --- Page 7 ---
        {
            year: "Maj 2019",
            title: "Potek Dela",
            description: "Pogled na potek mulčenja prezimne mešanice.",
            imageCaption: "Traktor sredi dela - maj 2019",
            image: "https://picsum.photos/seed/img13_mowing_may/1200/800",
        },
        {
            year: "April 2020",
            title: "Travno Deteljna Mešanica",
            description: "Stanje parcele spomladi 2020. Travno deteljna mešanica je bila posejana septembra 2019.",
            imageCaption: "Zelenje na polju - april 2020",
            image: "https://picsum.photos/seed/img14_april2020/1200/800",
        },

        // --- Page 8 ---
        {
            year: "Junij 2020",
            title: "1. Košnja",
            description: "Uspešna prva košnja, ki je prinesla 19 bal sena s parcele velikosti 1,4 hektarja.",
            imageCaption: "19 bal sena na parceli - junij 2020",
            image: "https://picsum.photos/seed/img15_bales/1200/800",
        },
        {
            year: "Sept 2020",
            title: "Mulčenje 3. Košnje",
            description: "Vzdrževanje travne ruše z mulčenjem tretje košnje v letu.",
            imageCaption: "Zračni posnetek mulčenja - sept 2020",
            image: "https://picsum.photos/seed/img16_drone2020/1200/800",
            videos: [
                { title: "Video mulčenja (2 min)", url: "#" }
            ]
        },

        // --- Page 9 ---
        {
            year: "Januar 2021",
            title: "Struktura Tal",
            description: "Vidno izboljšana struktura tal, polna življenja in korenin.",
            imageCaption: "Gruda zemlje in koreninski sistem - jan 2021",
            image: "https://picsum.photos/seed/img17_soil_shovel/1200/800",
        },
        {
            year: "Januar 2021",
            title: "Zaključno Stanje",
            description: "Primož Černelič na parceli. Rezultati analiz kažejo izjemno izboljšanje v samo 3.5 letih.",
            imageCaption: "Primož na polju - jan 2021",
            image: "https://picsum.photos/seed/img18_primoz/1200/800",
        }
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
        preparedBy: "Zapis pripravila: Vesna Čuček, univ. dipl. ekon. in univ. dipl. inž. agr., vodja oddelka za kmetijsko svetovanje na KGZS-Zavodu CE"
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, callback: (src: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (typeof ev.target?.result === 'string') callback(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left Logo */}
                <div
                    onClick={() => leftInputRef.current?.click()}
                    className="relative group cursor-pointer h-12 md:h-16 flex items-center"
                    title="Klikni za zamenjavo logotipa"
                >
                    <img src={leftLogo} alt="Levi logo" className="h-full object-contain max-w-[150px] md:max-w-[200px]" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-gray-600 bg-white/80 rounded-full p-1" />
                    </div>
                    <input type="file" ref={leftInputRef} onChange={(e) => handleFileChange(e, onUpdateLeft)} className="hidden" accept="image/*" />
                </div>

                {/* Right Logo */}
                <div
                    onClick={() => rightInputRef.current?.click()}
                    className="relative group cursor-pointer h-12 md:h-16 flex items-center"
                    title="Klikni za zamenjavo logotipa"
                >
                    <img src={rightLogo} alt="Desni logo" className="h-full object-contain max-w-[150px] md:max-w-[200px]" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-gray-600 bg-white/80 rounded-full p-1" />
                    </div>
                    <input type="file" ref={rightInputRef} onChange={(e) => handleFileChange(e, onUpdateRight)} className="hidden" accept="image/*" />
                </div>
            </div>
        </motion.header>
    );
};

const Hero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-white pt-20">
            <div className="max-w-4xl mx-auto px-6 text-center z-10">
                <motion.div
                    style={{ y, opacity }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-green-700 text-xs font-semibold tracking-wide mb-6">
                        Blog Post / Študija Primera
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                        Regeneracija<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-800">
                            Nepropustnih Tal
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                        {INITIAL_CONTENT.hero.title}
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4 text-gray-400 text-sm">
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {INITIAL_CONTENT.hero.location}</div>
                    </div>
                </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-green-50 rounded-full blur-3xl opacity-60" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60" />
            </div>
        </section>
    );
};

interface TimelineItemProps {
    data: TimelineItemData;
    index: number;
    onImageUpdate: (newSrc: string) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ data, index, onImageUpdate }) => {
    const isEven = index % 2 === 0;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax Logic
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Parallax effect
    const yImage = useTransform(scrollYProgress, [0, 1], [0, -30]);
    const yText = useTransform(scrollYProgress, [0, 1], [30, -30]);
    const yBackground = useTransform(scrollYProgress, [0, 1], [50, -50]);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === 'string') {
                    onImageUpdate(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-[40vh] flex flex-col md:flex-row items-center gap-8 md:gap-16 overflow-hidden py-12 relative"
        >
            {/* Giant Background Year Parallax */}
            <motion.div
                style={{ y: yBackground }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none select-none"
            >
                <span className="text-[10rem] md:text-[16rem] font-bold text-gray-50 opacity-80 whitespace-nowrap">
                    {data.year.split(' ')[0]}
                </span>
            </motion.div>

            {/* Image Column */}
            <motion.div
                style={{ y: yImage }}
                className={`flex-1 w-full ${isEven ? 'md:order-1' : 'md:order-2'}`}
            >
                <div
                    onClick={handleImageClick}
                    className="relative group rounded-3xl shadow-xl bg-gray-50 cursor-pointer border border-gray-100 overflow-hidden"
                    title="Klikni za zamenjavo slike"
                >
                    <img
                        src={data.image}
                        alt={data.imageCaption}
                        className="w-full h-auto max-h-[70vh] object-contain md:object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Default Caption Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 p-4 pointer-events-none w-full">
                        <p className="text-white/90 text-sm font-medium leading-snug">{data.imageCaption}</p>
                    </div>

                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-2">
                            <Camera className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-semibold tracking-wide drop-shadow-md">Zamenjaj sliko</span>
                    </div>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </motion.div>

            {/* Text Column */}
            <motion.div
                style={{ y: yText }}
                className={`flex-1 ${isEven ? 'md:order-2' : 'md:order-1'}`}
            >
                <div className="flex flex-col gap-4 p-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-green-600 font-bold tracking-widest uppercase text-xs md:text-sm">{data.year}</span>
                        <div className="h-px bg-green-200 flex-grow"></div>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{data.title}</h3>
                    <p className="text-base md:text-lg text-gray-500 leading-relaxed font-light">
                        {data.description}
                    </p>

                    {data.subtext && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                            <p className="text-sm text-green-800 italic">
                                {data.subtext}
                            </p>
                        </div>
                    )}

                    {data.details && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white shadow-sm border border-gray-100 p-2 rounded-lg w-fit">
                            <Info className="w-4 h-4 text-blue-500" /> {data.details}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {data.videos && data.videos.length > 0 && data.videos.map((video, vIndex) => (
                            <a
                                key={vIndex}
                                href={video.url}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-xs md:text-sm font-medium transition hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <Play className="w-3 h-3 fill-current" />
                                {video.title}
                            </a>
                        ))}

                        {data.links && data.links.length > 0 && data.links.map((link, lIndex) => (
                            <a
                                key={lIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-xs md:text-sm font-medium transition hover:bg-gray-50 hover:text-green-600"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Stats Box */}
                    {data.stats && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {Object.entries(data.stats).map(([key, value]) => (
                                <div key={key} className="bg-white p-2 rounded-xl text-center border border-gray-100 shadow-sm">
                                    <div className="text-lg font-bold text-green-600">{value}</div>
                                    <div className="text-[9px] uppercase text-gray-400 font-bold mt-1">
                                        {key === 'om' ? 'Org. Snov' : key === 'p2o5' ? 'P2O5' : 'K2O'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const ComparisonSection = () => {
    const { data } = INITIAL_CONTENT.finalResults;

    return (
        <section className="py-32 bg-black text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <FadeInView className="text-center mb-20">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        {INITIAL_CONTENT.finalResults.title}
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {INITIAL_CONTENT.finalResults.subtitle}
                    </p>
                </FadeInView>

                <div className="grid md:grid-cols-3 gap-8">
                    {data.map((item, index) => (
                        <FadeInView key={index} delay={index * 0.2} className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                            <div className="flex justify-between items-start mb-8">
                                <span className="text-lg font-medium text-gray-300">{item.label}</span>
                                <BarChart3 className="text-green-500 opacity-50" />
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                                        <span>{INITIAL_CONTENT.finalResults.beforeDate}</span>
                                        <span className="text-red-400 font-mono">{item.before} {item.unit}</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "30%" }} // Visual representation relative to "After"
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-red-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                                        <span className="font-semibold text-green-400">{INITIAL_CONTENT.finalResults.afterDate}</span>
                                        <span className="text-white font-mono text-xl">{item.after} {item.unit}</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "100%" }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-green-600 to-green-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </FadeInView>
                    ))}
                </div>

                <FadeInView className="mt-16 text-center">
                    <p className="text-sm text-gray-500">{INITIAL_CONTENT.finalResults.description}</p>
                </FadeInView>
            </div>

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </section>
    );
};

const Footer = () => (
    <footer className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Credits</h3>
                <p className="text-gray-500">{INITIAL_CONTENT.footer.credits}</p>
            </div>
            <div className="h-px w-24 bg-gray-200 mx-auto"></div>
            <div>
                <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
                    {INITIAL_CONTENT.footer.preparedBy}
                </p>
            </div>
            <div className="pt-8">
                <Sprout className="w-8 h-8 text-gray-300 mx-auto" />
            </div>
        </div>
    </footer>
);

export default function RegenerativePost() {
    const [timelineData, setTimelineData] = useState<TimelineItemData[]>(INITIAL_CONTENT.timeline);
    const [logos, setLogos] = useState({
        left: INITIAL_CONTENT.header.leftLogo,
        right: INITIAL_CONTENT.header.rightLogo
    });

    const handleUpdateImage = (index: number, newImageUrl: string) => {
        setTimelineData(prevData => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], image: newImageUrl };
            return newData;
        });
    };

    const updateLogo = (side: 'left' | 'right', src: string) => {
        setLogos(prev => ({ ...prev, [side]: src }));
    };

    return (
        <div className="bg-white min-h-screen text-gray-900 selection:bg-green-100 selection:text-green-900 overflow-x-hidden">
            <Header
                leftLogo={logos.left}
                rightLogo={logos.right}
                onUpdateLeft={(src) => updateLogo('left', src)}
                onUpdateRight={(src) => updateLogo('right', src)}
            />

            <Hero />

            <main className="max-w-7xl mx-auto px-6 space-y-0">
                <div className="py-12 text-center max-w-3xl mx-auto">
                    <FadeInView>
                        <p className="text-2xl font-medium text-gray-900 leading-normal">
                            {INITIAL_CONTENT.hero.context}
                        </p>
                    </FadeInView>
                </div>

                {timelineData.map((item, index) => (
                    <TimelineItem
                        key={index}
                        data={item}
                        index={index}
                        onImageUpdate={(newUrl) => handleUpdateImage(index, newUrl)}
                    />
                ))}
            </main>

            <ComparisonSection />

            <Footer />
        </div>
    );
}
