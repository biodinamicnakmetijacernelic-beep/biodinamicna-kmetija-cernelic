
import { FeatureItem, GalleryItem, OpeningHours, AwardItem, PreOrderItem } from './types';

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
      content: "V središču našega dela je celostni, zaprti cikel in spoštovanje naravnih ritmov. Rodovitnost tal gradimo brez kemije: z močjo dragocenega komposta iz lastne reje, posebno izbranimi posevki za biotsko pestrost in certificiranimi biodinamičnimi preparati. Ta celovit model nam omogoča pridelavo hrane z izjemno vitalnostjo in je bil potrjen z najvišjimi evropskimi priznanji, vključno z nagrado za najboljše upravljanje s tlemi.",
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
    description: "Kmetija je organizem, kjer živali, rastline in zemlja delujejo v popolni simbiozi. Rodovitnost ustvarjamo z lastnim dragocenim kompostom in gnojem krav, ki so del našega kroga. Ne vnašamo umetnih gnojil ali uvoženih virov. Smo samozadostni in avtonomni.",
    icon: 'recycle' // Circle/Cycle
  },
  {
    id: 'soil',
    title: "Aktivno Zdravje Tla in Vitalnost",
    description: "Ne gojimo samo rastlin, temveč gojimo živo zemljo. Z globokim kolobarjenjem in posevki za biotsko pestrost aktivno obnavljamo strukturo tal. Bolj zdrava in vitalna kot so tla, bolj odporni so pridelki in višja je njihova življenjska energija.",
    icon: 'sprout' // Roots/Soil representation
  },
  {
    id: 'cosmic',
    title: "Kozmični Ritem in Demeter Preparati",
    description: "Delamo v harmoniji z naravnimi, lunarnimi in kozmičnimi ritmi. Uporabljamo posebne, visoko potencirane biodinamične preparate, ki v zemljo in pridelke vnašajo vitalnost. To je bistvo Demeter standarda, ki je najvišja garancija za kakovost.",
    icon: 'moon' // Moon/Star/Cosmic
  }
];

export const OPENING_HOURS: OpeningHours[] = [
  {
    day: "Torek & Petek",
    time: "Ob mraku - 22:00",
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

// Blog Posts Data (from existing website) - PLACEHOLDER CONTENT
// TODO: Replace with actual full content from old website and upload images to Sanity
export const BLOG_POSTS = [
  {
    title: "SEKEM",
    slug: "sekem",
    publishedAt: "2025-01-14T00:00:00.000Z",
    image: null, // TODO: Upload actual image to Sanity and add reference
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "PLACEHOLDER: Čudež biodinamike v egipčanski puščavi skozi oči kmeta. [TODO: Dodajte polno vsebino iz stare spletne strani]"
          }
        ]
      }
    ]
  },
  {
    title: "BIODINAMIČNA KMETIJA ČERNELIČ NA OBMOČJU KGZS",
    slug: "biodinamicna-kmetija-cernelic-na-obmocju-kgzs",
    publishedAt: "2024-08-01T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Biodinamika je način kmetovanja oziroma obdelovanja zemlje, ki poleg..."
          }
        ]
      }
    ]
  },
  {
    title: "2 dnevno izobraževanje o osnovah",
    slug: "2-dnevno-izobrazevanje-o-osnovah",
    publishedAt: "2022-12-14T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "biodinamične kmetijske pridelave za Direktorat za strokovno podporo razvoju..."
          }
        ]
      }
    ]
  },
  {
    title: "Obrazi nevladnikov: Zvone Černelič",
    slug: "obrazi-nevladnikov-zvone-cernelic",
    publishedAt: "2022-05-23T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Društvo za biološko-dinamično gospodarjenje Ajda Posavje – Dobre hrane ne vržeš proč"
          }
        ]
      }
    ]
  },
  {
    title: "Zdrava Zelena in Trajnostna Evropa",
    slug: "zdrava-zelena-in-trajnostna-evropa",
    publishedAt: "2022-01-07T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "My Europe My Future. Ta video je bil predvajan tudi na Brdu ob lanskem Predsedovanju Slovenije Svetu Eu."
          }
        ]
      }
    ]
  },
  {
    title: "Posnemati kar je dobro, je modro!",
    slug: "posnemati-kar-je-dobro-je-modro",
    publishedAt: "2021-11-14T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Metoda, ki ohranja trajno plodnost tal, zagotavlja ekološko ravnotežje in omogoča pridelovanje..."
          }
        ]
      }
    ]
  },
  {
    title: "Upravljanje z zemljišči in tlemi",
    slug: "upravljanje-z-zemljisci-in-tlemi",
    publishedAt: "2021-08-01T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "oddaja Ljudje in zemlja"
          }
        ]
      }
    ]
  },
  {
    title: "Evropska nagrada za upravljanje z zemljišči in tlemi",
    slug: "evropska-nagrada-za-upravljanje-z-zemljisci-in-tlemi",
    publishedAt: "2021-07-22T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Černeliču je čestital tudi evropski poslanec Franc Bogovič.V Dečno selo sta mu jo prišla izročit generalni sekretar ELO Thierry de L'Escaille in Emmanuelle Mikosz, ki je pri ELO zadolžena za..."
          }
        ]
      }
    ]
  },
  {
    title: "Priznanje najvišjega ranga na ravni Evrope",
    slug: "priznanje-najvissjega-ranga-na-ravni-evrope",
    publishedAt: "2021-07-22T12:00:00.000Z", // Slightly different time to avoid duplicate
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Prejem priznanja najvišjega ranga na ravni Evrope ni mačji kašelj, sploh če je to že drugo priznanje v dveh letih. Biodinamična kmetija Černelič iz Dečnega sela pri Brežicah je letos prejela priznanje Evropskega združenja lastnikov zemljišč, lani pa je prejela največ glasov na evropskem natečaju Rural Inspiration Award (RIA) v kategoriji »glas ljudstva«."
          }
        ]
      }
    ]
  },
  {
    title: "Korak v Zeleno",
    slug: "korak-v-zeleno",
    publishedAt: "2021-07-21T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Biodinamično kmetovanje dokumentarno informativna oddaja"
          }
        ]
      }
    ]
  },
  {
    title: "Mednarodna nagrada za upravljanje z zemljišči in tlemi",
    slug: "mednarodna-nagrada-za-upravljanje-z-zemljisci-in-tlemi",
    publishedAt: "2021-03-17T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Evropska organizacija lastnikov zemljišč (ELO) je med devetnajstimi kandidati iz devetih držav biodinamični kmetiji Černelič podelila nagrado za njen izjemen prispevek k razvoju načina kmetovanja, ki..."
          }
        ]
      }
    ]
  },
  {
    title: "Učinkovitost biodinamičnega pristopa",
    slug: "ucinkovitost-biodinamicnega-pristopa",
    publishedAt: "2021-02-12T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "pri regeneraciji zbitih nepropustnih tal pri hidroelektrarni Brežice"
          }
        ]
      }
    ]
  },
  {
    title: "Slovenija bi morala postati ekološka",
    slug: "slovenija-bi-morala-postati-ekoloska",
    publishedAt: "2020-11-20T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Če bi bili otroci v šolah, bi dobili tradicionalni slovenski zajtrk: kruh, maslo, med, mleko in jabolko. Zaradi šolanja na daljavo bodo namesto tega dve uri poslušali vsebine, ki poudarjajo prednosti lokalno pridelane, slovenske hrane. Ekološki in biodinamični kmet Zvone Černelič,"
          }
        ]
      }
    ]
  },
  {
    title: "Župan obiskal biodinamično kmetijo Černelič",
    slug: "zupan-obiskal-biodinamicno-kmetijo-cernelic",
    publishedAt: "2020-10-10T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Župan občine Brežice Ivan Molan je obiskal prejemnico nagrade evropske javnosti, Rural Inspiration Awards"
          }
        ]
      }
    ]
  },
  {
    title: "Evropsko priznanje za navdihujoče prakse v kmetijstvu",
    slug: "evropsko-priznanje-za-navdihujoce-prakse-v-kmetijstvu",
    publishedAt: "2020-09-29T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Državni sekretar na Ministrstvu za kmetijstvo, gozdarstvo in prehrano dr. Jože Podgoršek je v ponedeljek tudi uradno podelil priznanje Evropske komisije"
          }
        ]
      }
    ]
  },
  {
    title: "Državni sekretar dr. Podgoršek predal priznanje",
    slug: "drzavni-sekretar-dr-podgorsek-predal-priznanje",
    publishedAt: "2020-09-29T12:00:00.000Z", // Slightly different time
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Biodinamični kmetiji Černelič, ki je na letošnjem evropskem natečaju »Rural Inspiration Awards 2020« prejela največ glasov javnosti ter zasedla prvo mesto v kategoriji »Popular vote«. Dogodek je organiziralo Društvo Ajda Posavje."
          }
        ]
      }
    ]
  },
  {
    title: "Michelinova zvezdica?",
    slug: "michelinova-zvezdica",
    publishedAt: "2020-09-25T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Je priznanje za vse,kar počnemo slovenski biodinamiki, in nagrada vsem, ki so me popeljali na to pot. Najprej bi se zahvalil Meti Vrhunc, ki je v Sloveniji začela biodinamično prakso,"
          }
        ]
      }
    ]
  },
  {
    title: "Strah ni dober življenjski sopotnik",
    slug: "strah-ni-dober-zivljenjski-sopotnik",
    publishedAt: "2020-09-25T12:00:00.000Z", // Slightly different time
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Brez strahu na sojo potKo je bil star 11 let, so starši kupili prvi traktor. »Oče je na traktor namestil škropilnico in poškropil njivo s koruzo. Gledal sem, kako škropi"
          }
        ]
      }
    ]
  },
  {
    title: "Srce v košarici septembrskih jagod",
    slug: "srce-v-kosarici-septembrskih-jagod",
    publishedAt: "2020-07-16T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Zmagoviti nastop na evropskem natečaju – Zvone Černelič iz Dečnega sela z biodinamično metodo uspešno nad opustošeno zemljo pri hidroelektrarni Brežice Vesel, da so delo prepoznali v Ljubljani in Bruslju"
          }
        ]
      }
    ]
  },
  {
    title: "Samooskrba",
    slug: "samooskrba",
    publishedAt: "2020-04-03T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Anton Baznik v svojem sadovnjaku lani septembra. Narava ti ponudi marsikaj, če..."
          }
        ]
      }
    ]
  },
  {
    title: "Ekskurzija ajda posavje na štajersko",
    slug: "ekskurzija-ajda-posavje-na-stajersko",
    publishedAt: "2018-09-02T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Tudi v letošnjem septembru(2018) smo se člani Društva Ajda Posavje odpravili na..."
          }
        ]
      }
    ]
  },
  {
    title: "Ekološko kmetijstvo? priložnost ali modna muha?",
    slug: "ekolosko-kmetijstvo-priloznost-ali-modna-muha",
    publishedAt: "2017-06-02T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Vsekakor priložnost še posebej za današnje krizne čase."
          }
        ]
      }
    ]
  },
  {
    title: "Ekskurzija Društva Ajda Posavje v Avstrijo",
    slug: "ekskurzija-drustva-ajda-posavje-v-avstrijo",
    publishedAt: "2016-09-19T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Tudi letos smo se v našem društvu odpravili na ekskurzijo, tokrat v Avstrijo"
          }
        ]
      }
    ]
  },
  {
    title: "Zanimiv poiskus s kumaram",
    slug: "zanimiv-poiskus-s-kumarami",
    publishedAt: "2016-11-11T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Zgornjo sem kupil v trgovini, bila je slovenskega porekla, iz integrirane pridelave."
          }
        ]
      }
    ]
  },
  {
    title: "Ekskurzija ekoloških kmetov v Nemčijo",
    slug: "ekskurzija-ekoloskih-kmetov-v-nemcijo",
    publishedAt: "2012-06-25T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "ZEK vsako leto organizira dve strokovni ekskurziji za svoje člane: eno v tujino in eno po Sloveniji"
          }
        ]
      }
    ]
  },
  {
    title: "Ekskurzija ekoloških kmetov v Nemčijo",
    slug: "ekskurzija-ekoloskih-kmetov-v-nemcijo-2010",
    publishedAt: "2010-06-18T00:00:00.000Z",
    image: null,
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "ZEK vsako leto organizira dve strokovni ekskurziji za svoje člane: eno v tujino in eno po Sloveniji"
          }
        ]
      }
    ]
  }
];
