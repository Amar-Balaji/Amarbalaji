import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

/**
 * One card in a gallery, and the case study behind it. The four disciplines
 * publish differently - 3D work is a render, UI/UX is a Behance project, front
 * end is a screenshot linking to the live site, BIM is a coordination job - so
 * the discipline decides which fields apply and the rest stay hidden.
 *
 * Everything on the Case study tab is optional: a render needs a title and an
 * image, and nothing else, to appear on the site.
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImageIcon,
  groups: [
    {name: 'card', title: 'Card', default: true},
    {name: 'study', title: 'Case study'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'card',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'card',
      options: {source: 'title', maxLength: 96},
      description: 'Only needed for projects with a case study page.',
    }),
    defineField({
      name: 'discipline',
      title: 'Gallery',
      type: 'string',
      group: 'card',
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
      type: 'reference',
      group: 'card',
      to: [{type: 'renderFolder'}],
      description:
        'Which section of the works page this render sits in. Add folders under Projects → 3D Visualisation.',
      hidden: ({parent}) => parent?.discipline !== '3d',
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      group: 'card',
      options: {hotspot: true},
      description:
        'The render, or a screenshot of the live site. UI/UX projects fall back to the Behance cover when this is empty.',
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
      name: 'gallery',
      title: 'Album',
      type: 'array',
      group: 'card',
      description:
        'Drop in as many images as you like in one go - they all upload, and dragging a thumbnail reorders them. They appear in the gallery straight after the cover.',
      hidden: ({parent}) => parent?.discipline !== '3d',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            // optional on purpose - a twenty image drop should not be twenty
            // forms. Blank falls back to the cover's alt, then the title.
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'tools',
      title: 'Software used',
      type: 'array',
      group: 'card',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description:
        'Blender, V-Ray, Photoshop... These show as pills along the bottom of the image when someone hovers it. Type a name and press enter.',
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      group: 'card',
      rows: 3,
    }),
    defineField({
      name: 'tags',
      type: 'array',
      group: 'card',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'behanceId',
      title: 'Behance project id',
      type: 'string',
      group: 'card',
      description:
        'The number in the behance.net/gallery/<id>/... URL. The site reads the project name and cover from that page.',
      hidden: ({parent}) => parent?.discipline !== 'uiux',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live site URL',
      type: 'url',
      group: 'card',
      hidden: ({parent}) => parent?.discipline === '3d',
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      group: 'card',
      hidden: ({parent}) => parent?.discipline !== 'frontend',
    }),
    defineField({
      name: 'pdf',
      title: 'PDF',
      type: 'file',
      group: 'card',
      options: {accept: 'application/pdf'},
      description: 'Opens in a lightbox on the works page instead of following a link.',
      hidden: ({parent}) => parent?.discipline !== 'bim',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'card',
      description: 'Pull this one to the front of its gallery.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      group: 'card',
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

    /* ---------------------------------------------------------- case study */
    defineField({name: 'client', type: 'string', group: 'study'}),
    defineField({name: 'year', type: 'string', group: 'study'}),
    defineField({
      name: 'role',
      type: 'string',
      group: 'study',
      description: 'e.g. "3D Visualiser".',
    }),
    defineField({
      name: 'duration',
      type: 'string',
      group: 'study',
      description: 'e.g. "3 weeks".',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Demo / turntable video URL',
      type: 'url',
      group: 'study',
    }),
    defineField({
      name: 'body',
      title: 'Full description',
      type: 'array',
      group: 'study',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({name: 'challenge', type: 'text', group: 'study', rows: 4}),
    defineField({name: 'solution', type: 'text', group: 'study', rows: 4}),
    defineField({name: 'outcome', type: 'text', group: 'study', rows: 4}),
    defineField({
      name: 'nextProject',
      title: 'Next project',
      type: 'reference',
      group: 'study',
      to: [{type: 'project'}],
      description: 'Closes the case study page.',
    }),
  ],
  orderings: [{title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', discipline: 'discipline', media: 'image'},
    prepare: ({title, discipline, media}) => ({
      title,
      subtitle: {
        '3d': '3D Visualisation',
        bim: 'BIM',
        uiux: 'UI/UX',
        frontend: 'Front End',
      }[discipline as string],
      media,
    }),
  },
})
