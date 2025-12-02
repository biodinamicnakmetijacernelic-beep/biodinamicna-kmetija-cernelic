import { createClient } from '@sanity/client';

const client = createClient({
    projectId: 'wd2r7u3w',
    dataset: 'production',
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.VITE_SANITY_TOKEN || ''
});

async function updateEggUnit() {
    try {
        // Find product with unit "10 KOS"
        const products = await client.fetch(`*[_type == "product" && unit == "10 KOS"]`);

        console.log('Found products:', products);

        if (products.length === 0) {
            console.log('No products found with unit "10 KOS"');
            return;
        }

        // Update each product
        for (const product of products) {
            console.log(`Updating ${product.name} from "10 KOS" to "6 KOS"`);

            await client
                .patch(product._id)
                .set({ unit: '6 KOS' })
                .commit();

            console.log(`✅ Updated ${product.name}`);
        }

        console.log('All products updated successfully!');
    } catch (error) {
        console.error('Error updating products:', error);
    }
}

updateEggUnit();
