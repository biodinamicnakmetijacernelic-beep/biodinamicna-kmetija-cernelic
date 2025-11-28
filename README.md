# 🌱 Biodinamična kmetija Černelič

Spletna stran za biodinamično kmetijo Černelič - ekološko in biodinamično kmetovanje v Sloveniji.

## 🚀 Hitri začetek

**Predpogoji:** Node.js 18+

### Lokalni razvoj
1. Namesti odvisnosti:
   ```bash
   npm install
   ```

2. Zaženi razvojni strežnik:
   ```bash
   npm run dev
   ```

3. Odpri [http://localhost:5173](http://localhost:5173) v brskalniku

### Produkcijska gradnja
```bash
npm run build
```

## 🚀 Avtomatski deploy na Netlify

### Nastavitev GitHub Actions
1. Pojdite na vaš GitHub repozitorij
2. Kliknite **Settings** → **Secrets and variables** → **Actions**
3. Dodajte naslednje skrivnosti:
   - `NETLIFY_AUTH_TOKEN`: Vaš Netlify Personal Access Token
   - `NETLIFY_SITE_ID`: ID vaše Netlify strani

### Kako dobiti Netlify podatke:
1. **NETLIFY_AUTH_TOKEN:**
   - Pojdite na: https://app.netlify.com/user/applications#personal-access-tokens
   - Ustvarite nov Personal Access Token
   - Kopirajte token

2. **NETLIFY_SITE_ID:**
   - Pojdite na vašo Netlify stran
   - Kliknite **Site settings** → **General** → **Site details**
   - Kopirajte **Site ID**

### Kako deluje avtomatski deploy:
- Vsak push na `main` branch sproži avtomatski deploy
- GitHub Actions gradi projekt in deploya na Netlify
- Pull requesti prav tako sprožijo deploy (preview)

## 📦 Ročni deploy
Če želite deployati ročno:
```bash
bash deploy-netlify.sh
```

Ali pa:
1. Pojdite na https://app.netlify.com/drop
2. Povlecite `netlify-deploy.zip` datoteko

## 🛠️ Tehnologije
- **React 19** - Frontend framework
- **TypeScript** - Tipiziran JavaScript
- **Vite** - Build orodje
- **Sanity CMS** - Content management
- **Netlify** - Hosting in deployment
- **Tailwind CSS** - Styling (če uporabljate)

## 📄 Struktura projekta
```
├── components/          # React komponente
├── pages/              # Strani aplikacije
├── public/             # Statične datoteke
├── netlify/            # Netlify funkcije
├── utils/              # Pomožne funkcije
├── .github/            # GitHub Actions
└── dist/               # Produkcijska gradnja
```

## 📧 Kontakt
Za vprašanja glede projekta kontaktirajte vzdrževalca.
