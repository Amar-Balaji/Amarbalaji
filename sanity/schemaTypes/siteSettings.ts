import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/** Page title, description and the image link previews use. A singleton. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Page title',
      type: 'string',
      description: 'Shown in the browser tab and in search results.',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Page description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'resume',
      title: 'Resume (PDF)',
      type: 'file',
      options: {accept: 'application/pdf'},
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
