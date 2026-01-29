import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'videoGalleryItem',
    title: 'Video',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Naslov',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'videoId',
            title: 'YouTube Video ID',
            type: 'string',
            description: 'ID videa iz YouTube (npr. dQw4w9WgXcQ)',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Kategorija',
            type: 'string',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'videoId',
        },
    },
})
