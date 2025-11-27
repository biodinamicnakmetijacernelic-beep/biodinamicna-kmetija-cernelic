# Migracija Stare Spletne Strani

## 📁 Struktura Mape

```
migration/
├── old-website/          # Tukaj naložite vsebino stare strani
│   ├── blog-posts/       # HTML datoteke blog objav
│   ├── images/          # Vse slike iz stare strani
│   └── content/         # Ostala vsebina (CSS, JS, itd.)
├── scripts/             # Pomožni skripti za procesiranje
└── processed/           # Procesirana vsebina (generirano)
```

## 🚀 Kako Uporabiti

### 1. Prenos Vsebine Stare Strani

**Naložite naslednje v `migration/old-website/`:**

- **Blog objave:** Kopirajte HTML datoteke objav v `blog-posts/`
- **Slike:** Kopirajte vse slike v `images/`
- **Ostala vsebina:** CSS, JS datoteke v `content/`

### 2. Procesiranje Vsebine

Po nalaganju vsebine, zaženite:
```bash
# V terminalu projekta
npm run migrate-blog
```

To bo:
- ✅ Izvleklo besedila iz HTML objav
- ✅ Procesiralo slike za Sanity
- ✅ Ustvarilo JSON strukturo za uvažanje

### 3. Uvoz v Novo Stran

- Procesirana vsebina bo v `migration/processed/`
- Uporabite admin panel za dokončni uvoz

## 📋 Primer Strukture

```
migration/old-website/
├── blog-posts/
│   ├── sekem.html
│   ├── biodinamicna-kmetija-cernelic.html
│   └── ...
├── images/
│   ├── sekem-image.jpg
│   ├── award-2020.jpg
│   └── ...
└── content/
    ├── style.css
    └── scripts.js
```

## 🛠️ Pomožni Skripti

- `migrate-blog.js` - Procesira blog objave
- `process-images.js` - Optimizira slike
- `generate-import.js` - Ustvari uvozno strukturo

## 📞 Podpora

Če imate težave z nalaganjem ali procesiranjem, sporočite!
