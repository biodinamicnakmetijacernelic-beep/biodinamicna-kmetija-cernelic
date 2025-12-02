import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'swdrisve',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_TOKEN || ''
});

async function findProducts() {
    try {
        console.log('🔍 Fetching all products...\n');

        const products = await client.fetch(`*[_type == "product"] | order(name asc) {_id, name, unit, price}`);

        console.log(`Found ${products.length} products:\n`);

        products.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name} - ${p.price}€ / ${p.unit}`);
        });

        console.log('\n🔍 Looking for products with "KOS" in unit...\n');
        const kosProducts = products.filter(p => p.unit && p.unit.includes('KOS'));

        if (kosProducts.length > 0) {
            console.log('Found products with "KOS":');
            kosProducts.forEach(p => {
                console.log(`  - ${p.name}: "${p.unit}"`);
            });
        } else {
            console.log('No products found with "KOS" in unit');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

findProducts();
