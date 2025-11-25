#!/bin/bash

echo "🚀 Vercel Deploy Script za Biodinamična kmetija Černelič"
echo "======================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI ni nameščen"
    echo "Namestite ga z: npm install -g vercel"
    echo "Ali kot admin/sudo: sudo npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI je nameščen"

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Niste prijavljeni v Vercel"
    echo "Za prijavo zaženite: vercel login"
    echo "Sledite navodilom v brskalniku"
    exit 1
fi

echo "✅ Prijavljeni ste v Vercel"

# Check if this is a Vercel project
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json ni najden"
    exit 1
fi

echo "✅ Vercel konfiguracija najdena"

# Deploy to production
echo "🚀 Začenjam deploy na Vercel..."
echo "To bo trajalo nekaj minut..."

vercel --prod

echo ""
echo "🎉 Deploy dokončan!"
echo ""
echo "📋 NE POZABITE nastaviti environment spremenljivk v Vercel dashboard:"
echo "1. Pojdite na: https://vercel.com/dashboard"
echo "2. Izberite svoj projekt"
echo "3. Settings → Environment Variables"
echo "4. Dodajte:"
echo "   SANITY_ADMIN_TOKEN=skfLb49oZf7DkswLGeSd8OgU4lrwWApK141Xcd0AOoeeM8gROXL045ZlHcWB0tgfQc4foFr0M72H95j7NwPdBqbb2w8ut4cXqVfhrPGExcUyatX6WNdk31jx1R4g3SBAeGIlUhRNFJfCvBQw5hIgHQx6negfr5annw1QeQTgH6CbZBAaQFqw"
echo "   SENDFOX_API_KEY=your-sendfox-api-key"
echo ""
echo "✅ Potem testirajte: https://your-domain.vercel.app"
