import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'award',
    title: 'Priznanje',
    type: 'document',
    fields: [
        defineField({
            name: 'year',
            title: 'Leto',
            type: 'number',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'title',
            title: 'Naslov',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'issuer',
            title: 'Podelitelj',
            type: 'string',
        }),
        defineField({
            name: 'description',
            title: 'Opis',
            type: 'text',
        }),
        defineField({
            name: 'highlight',
            title: 'Poudarjeno',
            type: 'boolean',
            initialValue: false,
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
            title: 'title',
            subtitle: 'year',
            media: 'image',
        },
    },
})
