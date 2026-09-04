import {defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'

/**
 * One row of the history section. Jobs and qualifications are the same shape
 * — what it was, when and where, and what came of it — so they are one type
 * split by `kind` rather than two near-identical ones.
 */
export const experienceEntry = defineType({
  name: 'experienceEntry',
  title: 'Experience / Education',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'kind',
      title: 'Which list',
      type: 'string',
      options: {
        list: [
          {title: 'Experience', value: 'experience'},
          {title: 'Education', value: 'education'},
        ],
        layout: 'radio',
      },
      initialValue: 'experience',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Company or qualification',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Role or level',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'period',
      type: 'string',
      description: 'e.g. "Jan 2025 - Present".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'detail',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Sort order',
      type: 'number',
      description: 'Low numbers first. Most recent should be lowest.',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {title: 'Sort order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'period', kind: 'kind'},
    prepare: ({title, subtitle, kind}) => ({
      title,
      subtitle: `${kind === 'education' ? 'Education' : 'Experience'} \u00b7 ${subtitle}`,
    }),
  },
})
