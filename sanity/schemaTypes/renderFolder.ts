import {defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'

/**
 * A section of the 3D gallery on the works page. Add one here and it becomes
 * both a folder in the Studio sidebar and a section on the site - no code
 * change - so the folder list is yours to grow.
 *
 * The slug is the key the site groups by; `frontpage` is the one reserved
 * name, it fills the homepage tunnel instead of the works page.
 */
export const renderFolder = defineType({
  name: 'renderFolder',
  title: 'Folder',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Folder name',
      type: 'string',
      description: 'The heading above this section on the works page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      description: 'Generated from the name. Leave it alone unless you know why.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Low numbers first, top to bottom on the works page.',
      initialValue: 100,
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [{title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', order: 'order'},
    prepare: ({title, order}) => ({title, subtitle: `#${order ?? '—'}`}),
  },
})
