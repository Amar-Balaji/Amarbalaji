import {defineField, defineType} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'

/**
 * One column of the skills list on the about page - the group title is the
 * category. Every item also becomes a word in the rotating tag sphere, so
 * items stay plain strings: the sphere renders the text itself.
 */
export const skillGroup = defineType({
  name: 'skillGroup',
  title: 'Skill group',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Category',
      type: 'string',
      description: 'e.g. "3D & Motion", "Development", "Design", "Tools".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Skills',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [{title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'title', items: 'items'},
    prepare: ({title, items}) => ({
      title,
      subtitle: `${items?.length ?? 0} skills`,
    }),
  },
})
