import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'swdrisve',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_TOKEN || ''
});

async function updateEggUnit() {
    try {
        console.log('🔍 Searching for "Jajca" product...');

        // Find Jajca product
        const products = await client.fetch(`*[_type == "product" && name == "Jajca"]`);

        console.log(`Found ${products.length} product(s)`);

        if (products.length === 0) {
            console.log('❌ No "Jajca" product found');
            return;
        }

        const product = products[0];
        console.log(`\nCurrent: ${product.name} - ${product.price}€ / ${product.unit}`);

        // Update unit from "10 kos" to "6 kos"
        console.log(`\n📝 Updating unit from "${product.unit}" to "6 kos"...`);

        await client
            .patch(product._id)
            .set({ unit: '6 kos' })
            .commit();

        console.log(`✅ Updated "${product.name}" successfully!`);
        console.log(`New: ${product.name} - ${product.price}€ / 6 kos`);

    } catch (error) {
        console.error('❌ Error updating product:', error);
    }
}

updateEggUnit();
