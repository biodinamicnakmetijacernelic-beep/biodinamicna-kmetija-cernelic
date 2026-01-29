import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'galleryImage',
    title: 'Slika galerije',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Naslov',
            type: 'string',
        }),
        defineField({
            name: 'image',
            title: 'Slika',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Kategorija',
            type: 'string',
        }),
        defineField({
            name: 'date',
            title: 'Datum',
            type: 'date',
        }),
        defineField({
            name: 'description',
            title: 'Opis',
            type: 'text',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'image',
            date: 'date',
        },
        prepare(selection) {
            const { title, media, date } = selection
            return {
                title: title || 'Utrinek',
                subtitle: date || '',
                media: media,
            }
        },
    },
})
