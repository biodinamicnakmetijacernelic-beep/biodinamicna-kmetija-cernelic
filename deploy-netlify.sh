#!/bin/bash

echo "🚀 Avtomatski deploy na Netlify za Biodinamična kmetija Černelič"
echo "============================================================"

# Build the project
echo "📦 Gradim projekt..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build ni uspel"
    exit 1
fi

echo "✅ Projekt zgrajen"

# Create a zip file of the dist directory
echo "📦 Pakiram datoteke..."
cd dist
zip -r ../netlify-deploy.zip .
cd ..

if [ $? -ne 0 ]; then
    echo "❌ Pakiranje ni uspelo"
    exit 1
fi

echo "✅ Datoteke zapakirane"

# Check if NETLIFY_AUTH_TOKEN is set
if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo ""
    echo "⚠️  NETLIFY_AUTH_TOKEN ni nastavljen"
    echo ""
    echo "Za avtomatski deploy sledite tem korakom:"
    echo "1. Pojdite na: https://app.netlify.com/user/applications#personal-access-tokens"
    echo "2. Ustvarite nov Personal Access Token"
    echo "3. Nastavite okolje spremenljivko:"
    echo "   export NETLIFY_AUTH_TOKEN=your_token_here"
    echo "4. Zaženite: bash deploy-netlify.sh"
    echo ""
    echo "Ali pa naredite ročni deploy:"
    echo "1. Pojdite na: https://app.netlify.com/drop"
    echo "2. Povlecite netlify-deploy.zip datoteko"
    exit 1
fi

# Get site ID or create new site
echo "🌐 Preverjam obstoječo spletno stran..."
SITE_RESPONSE=$(curl -s -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    https://api.netlify.com/api/v1/sites)

if [ $? -ne 0 ]; then
    echo "❌ Napaka pri povezavi z Netlify API"
    exit 1
fi

# Try to find existing site (you'll need to replace this with your actual site name)
SITE_NAME="biodinamicna-kmetija-cernelic"
SITE_ID=$(echo $SITE_RESPONSE | jq -r ".[] | select(.name == \"$SITE_NAME\") | .id")

if [ -z "$SITE_ID" ]; then
    echo "📝 Ustvarjam novo spletno stran..."
    CREATE_RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"$SITE_NAME\"}" \
        https://api.netlify.com/api/v1/sites)

    SITE_ID=$(echo $CREATE_RESPONSE | jq -r '.id')
    if [ -z "$SITE_ID" ] || [ "$SITE_ID" = "null" ]; then
        echo "❌ Napaka pri ustvarjanju spletne strani"
        echo "Odgovor: $CREATE_RESPONSE"
        exit 1
    fi
    echo "✅ Nova spletna stran ustvarjena: $SITE_ID"
else
    echo "✅ Obstojena spletna stran najdena: $SITE_ID"
fi

# Deploy the site
echo "🚀 Začenjam deploy..."
DEPLOY_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    -H "Content-Type: application/zip" \
    --data-binary @netlify-deploy.zip \
    https://api.netlify.com/api/v1/sites/$SITE_ID/deploys)

if [ $? -ne 0 ]; then
    echo "❌ Deploy ni uspel"
    exit 1
fi

DEPLOY_URL=$(echo $DEPLOY_RESPONSE | jq -r '.deploy_url')
SITE_URL=$(echo $DEPLOY_RESPONSE | jq -r '.url')

echo ""
echo "🎉 Deploy dokončan!"
echo ""
if [ "$DEPLOY_URL" != "null" ]; then
    echo "🌐 Deploy URL: $DEPLOY_URL"
fi
if [ "$SITE_URL" != "null" ]; then
    echo "🏠 Site URL: $SITE_URL"
fi
echo ""
echo "📋 Nastavitve environment spremenljivk:"
echo "Pojdite na Netlify dashboard in dodajte:"
echo "- SANITY_ADMIN_TOKEN (če uporabljate Sanity)"
echo "- SENDFOX_API_KEY (če uporabljate SendFox)"
echo ""

# Clean up
rm netlify-deploy.zip
echo "🧹 Počistil začasne datoteke"
