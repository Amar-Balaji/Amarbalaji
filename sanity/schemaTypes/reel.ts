import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'

/**
 * The showreel block. Every field is optional on purpose - with no video URL
 * the section is skipped entirely rather than rendering an empty player.
 * A singleton.
 */
export const reel = defineType({
  name: 'reel',
  title: 'Showreel',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Section heading',
      type: 'string',
      description: 'e.g. "Selected Work".',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Reel video URL',
      type: 'url',
      description: 'Leave empty to hide the whole section.',
    }),
    defineField({
      name: 'poster',
      title: 'Poster image',
      type: 'image',
      options: {hotspot: true},
      description: 'Shown before the video plays.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'duration',
      type: 'string',
      description: 'e.g. "1:24".',
    }),
  ],
  preview: {
    select: {subtitle: 'heading', media: 'poster'},
    prepare: ({subtitle, media}) => ({title: 'Showreel', subtitle, media}),
  },
})
