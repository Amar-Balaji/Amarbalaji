import {defineArrayMember, defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons/Envelope'

/** The contact page: how to reach you, and whether you are free. A singleton. */
export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      description: 'The large word at the top of the page.',
      initialValue: 'CONTACT',
    }),
    defineField({
      name: 'subtext',
      type: 'text',
      rows: 2,
      description: 'Optional line under the heading.',
    }),
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
      name: 'available',
      title: 'Currently available',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'availability',
      title: 'Availability line',
      type: 'string',
      description: 'e.g. "Open for freelance opportunities".',
      hidden: ({parent}) => !parent?.available,
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright name',
      type: 'string',
      description: 'Printed after the copyright symbol. The year is added automatically.',
      initialValue: 'Amar Balaji',
    }),
    defineField({
      name: 'credit',
      title: 'Credit line',
      type: 'string',
      description: 'The small line under the copyright.',
      initialValue: 'Designed and developed by Amar Balaji',
    }),
  ],
  preview: {prepare: () => ({title: 'Contact'})},
})
