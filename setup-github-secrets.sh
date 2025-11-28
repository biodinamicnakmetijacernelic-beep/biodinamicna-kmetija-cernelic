#!/bin/bash

echo "🚀 Nastavitev GitHub Secrets za avtomatski Netlify deploy"
echo "======================================================"
echo ""

echo "Ta skript vam pomaga nastaviti GitHub Actions za avtomatski deploy."
echo "Potrebovali boste:"
echo "- Netlify Personal Access Token"
echo "- Netlify Site ID"
echo ""

echo "📋 Koraki:"
echo "1. Pojdite na vaš GitHub repozitorij"
echo "2. Kliknite Settings → Secrets and variables → Actions"
echo "3. Dodajte naslednje skrivnosti:"
echo ""

echo "🔑 NETLIFY_AUTH_TOKEN:"
echo "   - Pojdite na: https://app.netlify.com/user/applications#personal-access-tokens"
echo "   - Ustvarite nov Personal Access Token"
echo "   - Kopirajte token in ga dodajte kot NETLIFY_AUTH_TOKEN"
echo ""

echo "🏠 NETLIFY_SITE_ID:"
echo "   - Pojdite na vašo Netlify stran"
echo "   - Kliknite Site settings → General → Site details"
echo "   - Kopirajte Site ID in ga dodajte kot NETLIFY_SITE_ID"
echo ""

echo "✅ Ko dodate obe skrivnosti:"
echo "   - Vsak push na 'main' branch bo avtomatsko deployal na Netlify"
echo "   - Pull requesti bodo ustvarili preview deployment"
echo ""

echo "🔍 Preverjanje nastavitev:"
echo "   - Pojdite na Actions tab v vašem GitHub repozitoriju"
echo "   - Videli bi morali '🚀 Deploy to Netlify' workflow"
echo ""

echo "📝 Opombe:"
echo "   - Skrivnosti so varno shranjene v GitHub"
echo "   - Dostopne so samo znotraj GitHub Actions"
echo "   - Lahko jih kadar koli posodobite ali izbrišete"
echo ""

read -p "Ali ste že nastavili skrivnosti? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Odlično! Sedaj pushnite spremembe na main branch in deploy se bo začel avtomatsko."
    echo ""
    echo "Za test: git push origin main"
else
    echo "Najprej nastavite skrivnosti, potem pa pushnite spremembe."
fi
