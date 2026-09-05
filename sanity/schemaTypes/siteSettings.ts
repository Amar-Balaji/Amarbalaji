import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/**
 * Everything that describes the site to something other than a reader: search
 * engines, social cards, analytics. Plus the CV, which is site-wide rather
 * than part of any one page. A singleton.
 */
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
      description: 'Shown in the browser tab and as the search result heading.',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Page description',
      type: 'text',
      rows: 3,
      description: 'The grey text under the title in search results.',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: 'The preview when a link is pasted into a chat. 1200x630 works everywhere.',
    }),
    defineField({
      name: 'siteUrl',
      title: 'Canonical site URL',
      type: 'url',
      description: 'Used to build absolute links for search engines and social cards.',
    }),
    defineField({
      name: 'gtmId',
      title: 'Google Tag Manager ID',
      type: 'string',
      description: 'Optional. Leave empty to load no tag manager at all.',
    }),
    defineField({
      name: 'resume',
      title: 'Resume (PDF)',
      type: 'file',
      description: 'Powers the CV button on the about page.',
      options: {accept: 'application/pdf'},
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
