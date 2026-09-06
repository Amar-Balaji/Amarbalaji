import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

/**
 * The about page: who you are, in the order the page reads. The portrait is
 * desktop-only on the site, but it is still the OG face of the page, so it
 * stays required. A singleton.
 */
export const hero = defineType({
  name: 'hero',
  title: 'About',
  type: 'document',
  icon: UserIcon,
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
      options: {layout: 'tags'},
      description: 'The line under your name, joined with " - ".',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'bio',
      title: 'Short bio',
      type: 'text',
      rows: 12,
      description:
        'Blank lines become paragraph breaks. Runs down the column beside the portrait, so around 150 words fills it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
      description: 'e.g. "Bengaluru, India".',
    }),
    defineField({
      name: 'yearsExperience',
      title: 'Years of experience',
      type: 'number',
      validation: (rule) => rule.min(0).max(60),
    }),
    defineField({
      name: 'currently',
      title: 'Currently working on',
      type: 'string',
    }),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
  ],
  preview: {
    select: {title: 'name', media: 'portrait'},
    prepare: ({title, media}) => ({title: title || 'About', subtitle: 'About', media}),
  },
})
