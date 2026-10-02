import { defineField, defineType } from 'sanity'

export const releaseCandidate = defineType({
  name: 'releaseCandidate',
  title: 'Release Candidate',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Candidate Identifier / Tag',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Release Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'targetNodeVersion',
      title: 'Target Node Version Requirement',
      type: 'string',
      description: 'Semver range, e.g. "^20.0.0" or ">=18 <21"',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'dependencies',
      title: 'Declared Dependencies',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Package Name',
              type: 'string',
              validation: (Rule) => Rule.required().min(2),
            }),
            defineField({
              name: 'version',
              title: 'Declared Version',
              type: 'string',
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'deprecated',
              title: 'Is Deprecated?',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'status',
      title: 'Release Policy Status',
      type: 'string',
      options: {
        list: [
          { title: 'Clean / Ready to Ship', value: 'CLEAN' },
          { title: 'Broken / Blocked', value: 'BROKEN' },
          { title: 'Configuration Drift', value: 'DRIFT' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
})
