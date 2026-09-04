import {defineArrayMember, defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'

/** The contact page. A singleton. */
export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'availability',
      title: 'Availability line',
      type: 'string',
      description: 'e.g. "Open for freelance opportunities".',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright name',
      type: 'string',
      description: 'Printed after the ©. The year is added automatically.',
      initialValue: 'Amar Balaji',
    }),
    defineField({
      name: 'credit',
      title: 'Credit line',
      type: 'string',
      description: 'The small line beside the copyright.',
      initialValue: 'Designed and developed by Amar Balaji',
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
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
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Contact'})},
})
