import {defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'

/**
 * Name, portrait, roles and bio for the about page. A singleton.
 */
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Set large at the top of the about page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'portrait',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describes the image for screen readers and search engines.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'roles',
      title: 'Role tags',
      type: 'array',
      of: [{type: 'string'}],
      description: 'The line under your name, joined with " - ".',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'bio',
      title: 'Short bio',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'name', media: 'portrait'},
    prepare: ({title, media}) => ({title: title || 'Hero', subtitle: 'Hero', media}),
  },
})
