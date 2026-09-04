import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

/**
 * One card in a gallery. The three disciplines publish differently — 3D work
 * is a render, UI/UX is a Behance embed, front end is a screenshot linking to
 * the live site — so the discipline decides which fields apply, and the rest
 * stay hidden.
 *
 * Where a card sits on the page is not here on purpose: the plate coordinates
 * are a Figma layout, not content, and belong in code.
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'discipline',
      title: 'Gallery',
      type: 'string',
      options: {
        list: [
          {title: '3D Visualisation', value: '3d'},
          {title: 'BIM', value: 'bim'},
          {title: 'Front End', value: 'frontend'},
          {title: 'UI/UX', value: 'uiux'},
        ],
        layout: 'radio',
      },
      initialValue: '3d',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Folder',
      type: 'string',
      description:
        'Front Page renders fill the homepage; the rest are the folder tiles on the All Projects page.',
      options: {
        list: [
          {title: 'Front Page', value: 'frontpage'},
          {title: 'Workspace Renders', value: 'workspace'},
          {title: 'Residential Renders', value: 'residential'},
          {title: 'Commercial Space Renders', value: 'commercial'},
          {title: 'Other Renders', value: 'other'},
        ],
        layout: 'radio',
      },
      // Untagged renders land in Other rather than vanishing from every folder.
      initialValue: 'other',
      hidden: ({parent}) => parent?.discipline !== '3d',
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      options: {hotspot: true},
      description: 'The render, or a screenshot of the live site.',
      hidden: ({parent}) => parent?.discipline === 'uiux',
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
      name: 'behanceId',
      title: 'Behance project id',
      type: 'string',
      description: 'The number in the behance.net/gallery/<id>/... URL.',
      hidden: ({parent}) => parent?.discipline !== 'uiux',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live site URL',
      type: 'url',
      hidden: ({parent}) => parent?.discipline !== 'frontend',
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Low numbers first, within the gallery.',
      // 3D renders sort by image filename instead, so the upload order is the
      // gallery order and there is no number to keep in sync.
      hidden: ({parent}) => parent?.discipline === '3d',
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as {discipline?: string} | undefined)?.discipline === '3d' ||
          typeof value === 'number'
            ? true
            : 'Required',
        ),
    }),
  ],
  orderings: [
    {title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', discipline: 'discipline', media: 'image'},
    prepare: ({title, discipline, media}) => ({
      title,
      subtitle: {'3d': '3D Visualisation', uiux: 'UI/UX', frontend: 'Front End'}[
        discipline as string
      ],
      media,
    }),
  },
})
