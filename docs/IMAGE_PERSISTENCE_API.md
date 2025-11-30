# Kako uporabiti shranjevanje slik v Custom React komponentah

## Dostopne funkcije

Ko vstavite React kodo v blog post, imate dostop do dveh dodatnih spremenljivk:

### 1. `uploadImage(key: string, file: File): Promise<string>`
Funkcija za nalaganje slik v Sanity.

**Parametri:**
- `key`: Unikaten ključ za sliko (npr. "leftLogo", "image1")
- `file`: File objekt slike

**Vrne:** Promise z URL-jem naložene slike

### 2. `savedImages: Record<string, string>`
Objekt s shranjeni slikami iz prejšnjih nalaganj.

**Struktura:** `{ "leftLogo": "https://...", "image1": "https://..." }`

## Primer uporabe

```typescript
// Namesto FileReader API:
const reader = new FileReader();
reader.onload = (e) => {
  setLogo(e.target.result as string);
};
reader.readAsDataURL(file);

// Uporabite uploadImage:
const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, key: string) => {
  const file = e.target.files?.[0];
  if (file) {
    try {
      const url = await uploadImage(key, file);
      setLogo(url); // Shrani URL v state
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
};

// Uporabite savedImages za inicializacijo:
const [logos, setLogos] = useState({
  left: savedImages.leftLogo || "https://placehold.co/200x80",
  right: savedImages.rightLogo || "https://placehold.co/200x80"
});
```

## Pomembno

- Slike se avtomatsko shranijo v Sanity
- Ko osvežite stran, se slike ponovno naložijo iz `savedImages`
- Vsaka slika potrebuje unikaten `key`
