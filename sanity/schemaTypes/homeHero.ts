import {defineField, defineType} from 'sanity'
import {RocketIcon} from '@sanity/icons/Rocket'

/**
 * The landing screen. The tunnel itself is built from the Front Page renders,
 * so what lives here is the copy laid over it. A singleton.
 */
export const homeHero = defineType({
  name: 'homeHero',
  title: 'Home hero',
  type: 'document',
  icon: RocketIcon,
  fields: [
    defineField({
      name: 'availabilityShow',
      title: 'Show availability badge',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'availabilityText',
      title: 'Availability badge text',
      type: 'string',
      hidden: ({parent}) => !parent?.availabilityShow,
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The large display line.',
    }),
    defineField({
      name: 'headlineItalic',
      title: 'Headline, italic line',
      type: 'string',
      description: 'The editorial second line, set in italic.',
    }),
    defineField({
      name: 'subheadline',
      type: 'string',
      description: 'One line under the headline.',
    }),
    defineField({
      name: 'dragHint',
      title: 'Drag hint',
      type: 'string',
      description: 'The vertical label beside the tunnel.',
      initialValue: 'Drag to explore',
    }),
    defineField({
      name: 'disciplineTags',
      title: 'Discipline tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'Primary CTA label',
      type: 'string',
    }),
    defineField({
      name: 'primaryCtaUrl',
      title: 'Primary CTA URL',
      type: 'string',
      hidden: ({parent}) => !parent?.primaryCtaLabel,
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Secondary CTA label',
      type: 'string',
    }),
    defineField({
      name: 'secondaryCtaUrl',
      title: 'Secondary CTA URL',
      type: 'string',
      hidden: ({parent}) => !parent?.secondaryCtaLabel,
    }),
  ],
  preview: {prepare: () => ({title: 'Home hero'})},
})
