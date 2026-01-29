import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'product',
    title: 'Izdelek',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Ime',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Kategorija',
            type: 'string',
            options: {
                list: [
                    { title: 'Sveže', value: 'fresh' },
                    { title: 'Predelano', value: 'processed' },
                    { title: 'Sezonsko', value: 'seasonal' },
                ],
            },
        }),
        defineField({
            name: 'price',
            title: 'Cena (€)',
            type: 'number',
            validation: (Rule) => Rule.min(0),
        }),
        defineField({
            name: 'unit',
            title: 'Enota',
            type: 'string',
            options: {
                list: [
                    { title: 'kos', value: 'kos' },
                    { title: 'kg', value: 'kg' },
                    { title: 'liter', value: 'liter' },
                    { title: 'šopek', value: 'šopek' },
                ],
            },
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Na voljo', value: 'available' },
                    { title: 'Razprodano', value: 'sold-out' },
                    { title: 'Kmalu', value: 'coming-soon' },
                ],
            },
            initialValue: 'available',
        }),
        defineField({
            name: 'quantity',
            title: 'Količina',
            type: 'number',
        }),
        defineField({
            name: 'maxQuantity',
            title: 'Maksimalna količina',
            type: 'number',
        }),
        defineField({
            name: 'image',
            title: 'Slika',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'category',
            media: 'image',
        },
    },
})
