import {defineArrayMember, defineField, defineType} from 'sanity'
import {MenuIcon} from '@sanity/icons/Menu'

/**
 * The floating pill nav, and the hamburger it collapses into below 1100px.
 * Order here is the order on screen. A singleton.
 */
export const navbar = defineType({
  name: 'navbar',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'logoText',
      title: 'Logo text',
      type: 'string',
      description: 'The monogram in the top left of the about page.',
      initialValue: 'AB',
    }),
    defineField({
      name: 'logoImage',
      title: 'Logo image',
      type: 'image',
      description: 'Optional. Replaces the text mark when set.',
    }),
    defineField({
      name: 'links',
      title: 'Nav links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({
              name: 'href',
              title: 'Path',
              type: 'string',
              description: 'A route such as /works, or #section for an anchor.',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'href'}},
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      description: 'Optional button at the end of the nav, e.g. "Let\u2019s talk".',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'CTA URL',
      type: 'string',
      hidden: ({parent}) => !parent?.ctaLabel,
    }),
  ],
  preview: {prepare: () => ({title: 'Navigation'})},
})
