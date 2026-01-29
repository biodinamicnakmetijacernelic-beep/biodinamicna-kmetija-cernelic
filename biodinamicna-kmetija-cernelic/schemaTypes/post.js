import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'post',
    title: 'Novica',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Naslov',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 200,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'publishedAt',
            title: 'Datum objave',
            type: 'datetime',
        }),
        defineField({
            name: 'mainImage',
            title: 'Glavna slika',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'body',
            title: 'Vsebina',
            type: 'array',
            of: [
                {
                    type: 'block',
                },
                {
                    type: 'image',
                    options: { hotspot: true },
                },
            ],
        }),
        defineField({
            name: 'link',
            title: 'Zunanja povezava',
            type: 'url',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            media: 'mainImage',
            date: 'publishedAt',
        },
        prepare(selection) {
            const { title, media, date } = selection
            return {
                title: title,
                subtitle: date ? new Date(date).toLocaleDateString('sl-SI') : '',
                media: media,
            }
        },
    },
})
