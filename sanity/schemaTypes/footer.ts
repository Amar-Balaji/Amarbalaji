import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

/**
 * The bottom of every page. The copyright itself lives on Contact, next to the
 * credit line it sits with on screen - this is the rest of the block.
 * A singleton.
 */
export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'tagline',
      type: 'string',
      description: 'One line, set above the links.',
    }),
    defineField({
      name: 'links',
      title: 'Footer links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'href', title: 'URL or path', type: 'string', validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        }),
      ],
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
  ],
  preview: {
    select: {subtitle: 'tagline'},
    prepare: ({subtitle}) => ({title: 'Footer', subtitle}),
  },
})
