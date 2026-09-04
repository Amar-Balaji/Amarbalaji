import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

/**
 * One column of the skills list on the about page. Every item also becomes
 * a word in the rotating tag sphere.
 */
export const skillGroup = defineType({
  name: 'skillGroup',
  title: 'Skill group',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Skills',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', items: 'items'},
    prepare: ({title, items}) => ({
      title,
      subtitle: `${items?.length ?? 0} skills`,
    }),
  },
})
