
import { FeatureItem, GalleryItem, OpeningHours, AwardItem, PreOrderItem } from './types';
export type { PreOrderItem };

export const HERO_TEXT = {
  title: "Kjer narava in tradicija rodita kakovost.",
  subtitle: "Zdrava tla za pridelke z izjemno vitalnostjo.",
  cta: "Razišči našo ponudbo"
};

// Updated Main Video from the provided playlist
export const YOUTUBE_VIDEO_ID = "vfPZG4Szmic";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/c/BiodinamičnaKmetijaČernelič";

export const VIDEO_GALLERY = [
  {
    id: 'XNoxdosgmPM',
    title: 'Trošenje komposta IMT 539 deluxe',
    category: 'Mehanizacija'
  },
  {
    id: 'QvpCisXTYtE',
    title: 'Ripanje - IMT 539 Deluxe',
    category: 'Mehanizacija'
  },
  {
    id: 'qYwbyOI_K9c',
    title: 'Kmetija Černelič - Predstavitev',
    category: 'O Kmetiji'
  },
  {
    id: 'Nq-yVQWax6Y',
    title: 'Upravljanje z zemljišči in tlemi (Oddaja Ljudje in zemlja)',
    category: 'Reportaža'
  },
  {
    id: 'gG8mWBDgPUQ',
    title: 'Košnja Trave New Holland T4040 & Krone Easy Cut 280',
    category: 'Mehanizacija'
  },
  {
    id: 'xbjt6PuBXRw',
    title: 'Selitev Krav Na Drug Pašnik New Holland T4040',
    category: 'Živali'
  },
  {
    id: 'R4LSMWU-4fQ',
    title: 'IMT 539 Deluxe - Polaganje Folije - Laying foil',
    category: 'Mehanizacija'
  }
];

export const ABOUT_TEXT = {
  title: "Od njive do evropskega priznanja",
  quote: "Vse se začne pri tleh. Če so tla živa in zdrava, bo takšna tudi hrana – in ljudje, ki jo uživajo. To je preprosta, a mogočna filozofija, ki nas vodi že več kot dve desetletji.",
  storyBlocks: [
    {
      id: '2003',
      title: "Prelomno leto 2003",
      content: "Takrat smo sprejeli odločitev, ki je spremenila vse. Opustili smo konvencionalne metode in stopili na pot ekološkega kmetovanja. Želeli smo kmetovati z naravo, ne proti njej.",
      image: "/images/leto-2003.jpg",
      imageAlt: "Začetki na polju"
    },
    {
      id: '2014',
      title: "Korak k odličnosti",
      content: "Želeli smo več kot le 'brez pesticidov'. Želeli smo hrano polno življenjske energije. Konec leta 2014 smo pridobili certifikat Demeter. To pomeni, da našo kmetijo obravnavamo kot zaključen, živ organizem.",
      image: "/images/leto-2014.jpg",
      imageAlt: "Govedo na paši"
    },
    {
      id: 'today',
      title: "Kako delamo danes?",
      content: "V središču našega dela je celostni, zaprti cikel in spoštovanje naravnih ritmov. Rodovitnost tal gradimo brez kemije: z močjo dragocenega komposta iz lastne reje goveda, posebno izbranimi posevki za biotsko pestrost in biodinamičnimi preparati. Ta celovit model nam omogoča pridelavo hrane z izjemno vitalnostjo in je bil potrjen z najvišjimi evropskimi priznanji, vključno z nagrado za najboljše upravljanje s tlemi.",
      image: "/images/sedanjost.jpg",
      imageAlt: "Zvone Černelič s pridelkom"
    }
  ],
  awards: "Prejemniki nagrade za najbolj inovativnega mladega kmeta in ambasadorji ekološkega kmetijstva."
};

export const PHILOSOPHY_TEXT = {
  title: "Biodinamična Načela",
  subtitle: "Temelji našega uspeha",
  intro: "Biodinamika ni samo 'ekološko' kmetovanje. To je celosten, spoštljiv pogled na kmetijo kot samozadosten, živi organizem. Naša predanost je potrjena s certifikatom Demeter in evropskimi nagradami. To so naši temelji:"
};

export const AWARDS_LIST: AwardItem[] = [
  {
    id: 'land-soil',
    year: '2020/21',
    title: 'Land and Soil Management Award',
    issuer: 'European Landowners’ Organization & Evropska komisija',
    description: 'Zmagovalci med 19 kandidati iz 9 držav. Prvi slovenski projekt s to prestižno nagrado za najboljše prakse varovanja tal in biotske pestrosti.',
    highlight: 'Evropski zmagovalec',
    image: 'https://lh3.googleusercontent.com/pw/AP1GczMJo-hmsB9_ApjT3z4FYEcKi8r_bKOmOeVzj5pl68VYNU8CcXWvAUZIY4N-4sTojRCamPB4jJjZfTtpENbtFzCZvT-bZt-FgSTLQrtmgjbCqGnxSjn0VIbAzxzYckD6oOR66TJs2VwaT2p2D1gzAvuW=w1008-h756-s-no?authuser=2'
  },
  {
    id: 'rural-inspiration',
    year: '2020',
    title: 'Rural Inspiration Awards',
    issuer: 'Evropska komisija (Popular Vote Winner)',
    description: 'Zmagovalec ljudstva z največ glasovi v celotni EU v kategoriji prispevka k zmanjševanju vpliva na podnebne spremembe.',
    highlight: 'Glas ljudstva EU',
    image: 'https://lh3.googleusercontent.com/pw/AP1GczMEDGfei14MYnJ3la1ErxxdxRZiKRWHXXQ_4XzkajY288sI7lx9zTNmBWmEXRmX_0-7ZeXicf27_KXSX78gLPfSU7JN2idNve6KSyrkemGwSiJ85DvD-RlWtAtSYA4FyloIQASFtxx4NCNnn1frj9aotB9rXqc65PF9NwrJvUwjgAp0i8Te98jgYDhbi7oxbh30sVA9vkOsjV3dLzJR8VyFqskJNJEHxS8k4h46S_leeJSPAkvhWIZpYtoRUicxgQhpnNlXfNUZFjniimTRLk1JvOowOWWKwJ1LYYSI5KuXlpplSyIIk2fbyIyRvK9V1P2Fc1e1mVGxS_YkXHwHGk4AqoZ281YGYdhr20V4qFBtzHX3KuD8mUd5Rew_hd0D-776jtz-aC74I4n7IZfIwH3j4osxN857CDiG4VOqu9BKBl6gzChaDdja3QZzFsBhAJCnSiGKONLH9cKc9u7ZQAY_tGSJiqYU843PzBbQ-l28v46ImxQTBjJ9DwXUI7U-DgrxB5kmJGbEOeCuCsqD3TFcriPgrsf21Hc74qw3wEBkMLlClaup6pXBaFUBPLvmg8jKV_y0gzxLQ_4etbF4sW2twKrH3f1OIvbQ1J7BWw7-sDM9nrt8ErT4iprod_HXbj7TmOZI3yP2ldha4JueHU2iYijHIoJuaq5js1ufu3UvWbyLLYdbd1BdK9PiJqB2TymZvbXtfoZ8Uph5fbSFrmV_D9G_7hpH6oxIDhI-KNpP8LxD04dFv513ee6Fu93A5t9KTK0Lw3d8ebPbIAEW9OuDDd6eFx4BP1CbnzQv7UNA5ij5g7zE6Tj81_E5Bkp_8P6Kx7BOoBTTSYCZPz28k7VFB9hUB5LPQsSh3mBXvPhqflDeYCD3tepDxdtFryuzoayg8fv_x5Ef2H6KjXvZBkvvt0BAZ7iU7bChdvPsYTXMskhDUnGFRLrUZXOqKAugQFbt0UEG6ustNIffvRxu2rNUESDh=w1282-h1718-s-no?authuser=2'
  },
  {
    id: 'brezice',
    year: '2020',
    title: 'Oktobrska nagrada Občine Brežice',
    issuer: 'Občina Brežice',
    description: 'Najvišje priznanje lokalne skupnosti za izjemne dosežke na področju kmetijstva in promocije regije Posavje.',
    highlight: 'Lokalni ponos',
    image: 'https://lh3.googleusercontent.com/pw/AP1GczOa5QbuyqQOgGahWq6jq0OwC3kC25oDEmSA_ec0vf-STAvTiC5R957yryS5lQzaTFGls-lmsRUXEfGnmkc8Zon03ftIqPBbKXWE1c14zdkq7xyEbauTIO4JuEZEeUuVOfvdZsagFp28yfNporWmtu-D=w1282-h1718-s-no?authuser=2'
  }
];

export const PRODUCTS_TEXT = {
  title: "Pridelki, polni življenjske energije.",
  subtitle: "Celostna ponudba, ki povezuje njivo, mlin in hlev v popoln naravni krog."
};

export const PRODUCT_CATEGORIES = [
  {
    id: 'fresh',
    title: 'Sveže z biodinamične njive',
    iconType: 'carrot',
    items: [
      'Blitva', 'Brokoli', 'Buča', 'Bučke', 'Česen', 'Cvetača', 'Fižol',
      'Jajčevci', 'Kolerabica', 'Korenje', 'Koruza', 'Krompir', 'Kumare',
      'Motovilec', 'Ohrovt', 'Paprika', 'Paradižnik', 'Peteršilj', 'Por',
      'Radič', 'Rdeča pesa', 'Repa', 'Rukola', 'Sladki krompir', 'Solata',
      'Zelena', 'Zelje', 'Češnja', 'Jabolko', 'Jagode', 'Lubenica', 'Maline',
      'Melona', 'Oreh'
    ]
  },
  {
    id: 'processed',
    title: 'Moke, Olja in Žita',
    iconType: 'wheat',
    items: [
      'Moka: Ajdova', 'Moka: Pirina', 'Moka: Pšenična', 'Moka: Koruzna',
      'Olja: Sončnično olje',
      'Žita: Pira', 'Žita: Pšenica', 'Surovina: Sončnice', 'Sadike', 'Seno', 'Trava'
    ]
  },
  {
    id: 'animals',
    title: 'Odgovornost do živali in kompost',
    iconType: 'sprout',
    items: [
      'Govedo (Krave dojilje)',
      'Kokoši (Jajca)',
      'Gnoj/Kompost (zaokrožen cikel)',
      'Prostorastoče rastline'
    ]
  }
];

export const PREORDER_PRODUCTS: PreOrderItem[] = [
  // FRESH (Block 1)
  { id: 'carrot', name: 'Korenje', category: 'fresh', price: 2.50, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400', status: 'available' },
  { id: 'potato', name: 'Krompir', category: 'fresh', price: 1.20, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82a6b69d?auto=format&fit=crop&q=80&w=400', status: 'available' },
  { id: 'salad', name: 'Solata', category: 'fresh', price: 1.50, unit: 'kos', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c958a2f?auto=format&fit=crop&q=80&w=400', status: 'available' },
  { id: 'strawberries', name: 'Jagode', category: 'fresh', price: 6.00, unit: 'kg', image: 'https://images.unsplash.com/photo-1589820296156-2454bb8a4d50?auto=format&fit=crop&q=80&w=400', status: 'coming-soon' },
  { id: 'tomato', name: 'Paradižnik', category: 'fresh', price: 3.00, unit: 'kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400', status: 'sold-out' },
  { id: 'eggplant', name: 'Jajčevci', category: 'fresh', price: 2.80, unit: 'kg', image: 'https://images.unsplash.com/photo-1615485925763-867862f80a3a?auto=format&fit=crop&q=80&w=400', status: 'coming-soon' },

  // DRY (Block 2)
  { id: 'flour-buckwheat', name: 'Ajdova Moka', category: 'dry', price: 5.20, unit: 'kg', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', status: 'available' },
  { id: 'flour-spelt', name: 'Pirina Moka', category: 'dry', price: 4.50, unit: 'kg', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=400', status: 'available' },
  { id: 'oil-sunflower', name: 'Sončnično Olje', category: 'dry', price: 8.00, unit: 'l', image: 'https://images.unsplash.com/photo-1473973266708-193516936351?auto=format&fit=crop&q=80&w=400', status: 'sold-out' },
  { id: 'spelt-grain', name: 'Pira (zrna)', category: 'dry', price: 3.00, unit: 'kg', image: 'https://images.unsplash.com/photo-1595855709920-4538602b186c?auto=format&fit=crop&q=80&w=400', status: 'available' },
];

export const FEATURES: FeatureItem[] = [
  {
    id: 'ecosystem',
    title: "Kmetija kot Zaprti Ekosistem",
    description: "Kmetija je organizem, kjer živali, rastline in zemlja delujejo v popolni simbiozi. Rodovitnost ustvarjamo z lastnim dragocenim kompostom, kolobarjenjem in uporabo biodinamičnih preparatov kot osnova za vitalnost tal.",
    icon: 'recycle' // Circle/Cycle
  },
  {
    id: 'soil',
    title: "Aktivno Zdravje Tla in Vitalnost",
    description: "Ne gojimo samo rastlin, temveč gojimo živo zemljo. Z pravilnim kolobarjenjem in posevki za biotsko pestrost aktivno obnavljamo strukturo tal. Bolj zdrava in vitalna kot so tla, bolj odporni so pridelki in višja je njihova življenjska energija.",
    icon: 'sprout' // Roots/Soil representation
  },
  {
    id: 'cosmic',
    title: "Kozmičnimi Ritmi in biodinamičnimi preparati",
    description: "Delamo v harmoniji z naravnimi, lunarnimi in kozmičnimi ritmi. Uporabljamo posebne, visoko potencirane biodinamične preparate, ki v zemljo in pridelke vnašajo vitalnost. To je bistvo Demeter standarda, ki je najvišja garancija za kakovost.",
    icon: 'moon' // Moon/Star/Cosmic
  }
];

export const OPENING_HOURS: OpeningHours[] = [
  {
    day: "Torek & Petek",
    time: "Poletni čas: 19:00 - 20:30 | Zimski čas: 17:00 - 19:00",
    location: "Biodinamična kmetija Černelič",
    address: "Dečno selo 48, 8253 Artiče",
    season: "Torek: maj-sep | Petek: maj-nov",
    note: "Nakup možen tudi ostale dni po predhodnem telefonskem dogovoru.",
    iconType: 'home',
    phoneNumber: "051 363 447",
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Dečno+selo+48+Artiče"
  },
  {
    day: "Sreda & Sobota",
    time: "07:30 - 14:00",
    location: "Ekološka tržnica Ljubljana",
    address: "Pogačarjev trg, 1000 Ljubljana",
    season: "Sreda: maj-sep | Sobota: maj-dec",
    iconType: 'market',
    deliveryOption: "Možnost dostave na poti do tržnice takoj ob avtocesti po predhodnem dogovoru.",
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Pogačarjev+trg+Ljubljana"
  }
];

export const GALLERY_IMAGES: GalleryItem[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1595855709920-4538602b186c?auto=format&fit=crop&q=80&w=800', alt: 'Pira in žita', category: 'Žita', date: '12.08.2023', description: 'Domača pira tik pred žetvijo v popoldanskem soncu.' },
  { id: '2', src: 'https://images.unsplash.com/photo-1589820296156-2454bb8a4d50?auto=format&fit=crop&q=80&w=800', alt: 'Domače jagode', category: 'Sezonsko', date: '25.05.2023', description: 'Sveže nabrane jagode, polne okusa in naravne sladkobe.' },
  { id: '3', src: 'https://images.unsplash.com/photo-1473973266708-193516936351?auto=format&fit=crop&q=80&w=800', alt: 'Bučno olje', category: 'Olja', date: '10.11.2023', description: 'Sveže stiskano bučno olje iz naših buč.' },
  { id: '4', src: 'https://images.unsplash.com/photo-1516467508483-a72120608869?auto=format&fit=crop&q=80&w=800', alt: 'Krškopoljci na paši', category: 'Živali', date: '15.04.2023', description: 'Naši krškopoljci uživajo v prosti reji na svežem zraku.' },
  { id: '5', src: 'https://images.unsplash.com/photo-1621459569766-3d6d03d1576f?auto=format&fit=crop&q=80&w=800', alt: 'Krompir in zelenjava', category: 'Vrt', date: '18.09.2023', description: 'Bogat pridelek krompirja in jesenske zelenjave.' },
  { id: '6', src: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800', alt: 'Polja v soncu', category: 'Posestvo', date: '30.06.2023', description: 'Pogled na naša polja v polnem razcvetu poletja.' },
];

// SVG Paths
export const LOGO_PATHS = {
  // A clean leaf shape
  leaf: "M17.4,6.7C16.6,6.2,15.6,6,14.7,6c-1.7,0-3.2,0.6-4.4,1.7c-0.2,0.2-0.5,0.2-0.7,0C9.1,7.2,8.6,6.7,8,6.3 c-1.6-1-3.5-1.3-5.3-0.9C2.3,5.5,2,5.9,2.1,6.3c0.1,0.5,0.4,0.9,0.7,1.3c2,2.3,2.5,5.6,1.4,8.4c-0.5,1.2-1.3,2.3-2.2,3.2 c-0.3,0.3-0.2,0.8,0.2,1c0.4,0.2,0.9,0.1,1.2-0.2c1.1-1,2.1-2.2,2.8-3.6c0.5-1,0.8-2.1,1-3.2c0.1-0.4,0.6-0.5,0.9-0.2 c1.6,1.9,3.8,3,6.3,3c1.7,0,3.3-0.5,4.7-1.4C20.4,13.7,21.3,11.5,21.3,9S19.6,7.2,17.4,6.7z M15.3,13.8c-1,0.6-2.2,1-3.4,1 c-1,0-1.9-0.2-2.8-0.7c-0.4-0.2-0.5-0.3-1.1c0.2-0.4,0.7-0.5,1.1-0.3c0.6,0.3,1.3,0.5,2,0.5c0.9,0,1.8-0.3,2.5-0.7 c0.4-0.3,0.9-0.1,1.1,0.3C15.8,13.2,15.7,13.6,15.3,13.8z",

  // A stylized abstract plant/flower for Demeter (inspired by organic growth)
  demeter: "M12,2c-0.6,0-1,0.4-1,1v5.2c-2.1-1.3-4.4-1.9-6.5-1.5C3.6,6.9,3,7.7,3.2,8.5c0.6,2.3,2.4,4.2,4.6,5l-1.9,4.4 c-0.2,0.5,0,1.1,0.5,1.4C6.6,19.3,6.8,19.4,7,19.4c0.3,0,0.7-0.2,0.9-0.5l2.4-5.6c0.6,0.2,1.2,0.3,1.8,0.3c0.6,0,1.2-0.1,1.8-0.3 l2.4,5.6c0.2,0.5,0.7,0.7,1.2,0.5c0.5-0.2,0.7-0.8,0.5-1.4l-1.9-4.4c2.2-0.8,4-2.7,4.6-5c0.2-0.9-0.4-1.7-1.3-1.8 c-2.1-0.4-4.4,0.2-6.5,1.5V3C13,2.4,12.6,2,12,2z M8.1,8.7c1.3-0.3,2.7,0.1,3.9,1V9.6C12,9.6,11.9,9.6,11.9,9.6 C10.1,9.4,8.7,8.8,8.1,8.7z M15.9,8.7c-0.6,0.1-2,0.7-3.8,0.9c0,0-0.1,0-0.1,0v0.1c1.2-0.9,2.6-1.3,3.9-1V8.7z"
};

export const FARM_LOGO = "https://cdn.sanity.io/images/swdrisve/production/49db8f4a224216924458f4aa46d7f900ebee1e9c-549x276.webp?w=2000&fit=max&auto=format&dpr=2";

