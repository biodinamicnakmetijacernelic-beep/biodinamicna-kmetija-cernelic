import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'order',
    title: 'Naročilo',
    type: 'document',
    fields: [
        defineField({
            name: 'customerName',
            title: 'Ime stranke',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'customerEmail',
            title: 'Email',
            type: 'string',
        }),
        defineField({
            name: 'customerPhone',
            title: 'Telefon',
            type: 'string',
        }),
        defineField({
            name: 'items',
            title: 'Izdelki',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'productId', type: 'string', title: 'ID izdelka' },
                        { name: 'productName', type: 'string', title: 'Ime izdelka' },
                        { name: 'quantity', type: 'number', title: 'Količina' },
                        { name: 'price', type: 'number', title: 'Cena' },
                    ],
                },
            ],
        }),
        defineField({
            name: 'total',
            title: 'Skupaj',
            type: 'number',
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Novo', value: 'new' },
                    { title: 'V obdelavi', value: 'processing' },
                    { title: 'Zaključeno', value: 'completed' },
                    { title: 'Preklicano', value: 'cancelled' },
                ],
            },
            initialValue: 'new',
        }),
        defineField({
            name: 'notes',
            title: 'Opombe',
            type: 'text',
        }),
        defineField({
            name: 'createdAt',
            title: 'Ustvarjeno',
            type: 'datetime',
        }),
    ],
    preview: {
        select: {
            title: 'customerName',
            subtitle: 'status',
            date: 'createdAt',
        },
        prepare(selection) {
            const { title, subtitle, date } = selection
            return {
                title: title,
                subtitle: `${subtitle} - ${date ? new Date(date).toLocaleDateString('sl-SI') : ''}`,
            }
        },
    },
})
