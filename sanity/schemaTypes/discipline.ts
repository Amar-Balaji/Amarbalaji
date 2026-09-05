import {defineField, defineType} from 'sanity'
import {ComponentIcon} from '@sanity/icons/Component'

/**
 * One of the practices you sell: what it is, what you build it with, and the
 * one number worth leading with. One document per discipline.
 */
export const discipline = defineType({
  name: 'discipline',
  title: 'Discipline',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Discipline name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tools',
      title: 'Tools and technologies',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'image',
      title: 'Representative image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'stat',
      title: 'Featured stat',
      type: 'string',
      description: 'e.g. "40+ Projects".',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [{title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', subtitle: 'stat', media: 'image'},
  },
})
