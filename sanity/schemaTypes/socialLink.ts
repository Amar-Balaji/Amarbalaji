import {defineField, defineType} from 'sanity'

/**
 * A platform and a link. Shared by the about page, the contact page and the
 * footer so the same profile is described one way everywhere.
 */
export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          'Behance',
          'ArtStation',
          'LinkedIn',
          'GitHub',
          'Dribbble',
          'Instagram',
          'Twitter/X',
          'YouTube',
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})
