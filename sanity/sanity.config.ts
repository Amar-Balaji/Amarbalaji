import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {SINGLETONS, schemaTypes} from './schemaTypes'

/** Sidebar order is page order: what a visitor meets first sits highest. */
const SINGLETON_TITLES: Record<string, string> = {
  hero: 'About',
  contact: 'Contact',
  siteSettings: 'Site settings',
}

/**
 * The galleries, as folders under Projects. Same values as the `discipline`
 * field — one list, so a folder can never drift from the option it filters on.
 */
const GALLERIES = [
  {value: '3d', title: '3D Visualisation'},
  {value: 'bim', title: 'BIM'},
  {value: 'uiux', title: 'UI/UX'},
  {value: 'frontend', title: 'Front End'},
] as const

/** The Studio and the render lists agree on one API version. */
const API_VERSION = '2026-08-27'

export default defineConfig({
  name: 'default',
  title: 'AmarbalajiPortfolio',

  projectId: 'iow9ex5z',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            // Singletons open straight into the one document, so there is no
            // list to accidentally add a second hero to.
            ...SINGLETONS.map((name) =>
              S.listItem()
                .title(SINGLETON_TITLES[name])
                .id(name)
                .child(S.document().schemaType(name).documentId(name)),
            ),
            S.divider(),
            S.listItem()
              .title('Projects')
              .id('projects')
              .child(
                S.list()
                  .title('Projects')
                  .items(
                    GALLERIES.map(({value, title}) =>
                      S.listItem()
                        .title(title)
                        .id(value)
                        .child(
                          // 3D is the only gallery with folders, so it opens
                          // into a list of them rather than straight into
                          // every render it holds. The folders are documents,
                          // so this list is read fresh each time it opens —
                          // add one under "Folders" and it shows up here (and
                          // on the works page) with no code change.
                          value === '3d'
                            ? async () => {
                                const docs = await context
                                  .getClient({apiVersion: API_VERSION})
                                  .fetch<{_id: string; title: string; order?: number}[]>(
                                    '*[_type == "renderFolder"]{_id, title, order}',
                                  )
                                // A folder with unpublished edits comes back
                                // twice - as itself and as its draft - and the
                                // draft's id matches no project's category
                                // reference, so it opened an empty folder.
                                // Collapse onto the published id, keeping the
                                // draft's title and order so a rename shows
                                // here before it is published.
                                const folders = [
                                  ...docs
                                    .reduce((map, doc) => {
                                      const _id = doc._id.replace(/^drafts\./, '')
                                      if (doc._id !== _id || !map.has(_id)) map.set(_id, {...doc, _id})
                                      return map
                                    }, new Map<string, {_id: string; title: string; order?: number}>())
                                    .values(),
                                ].sort((x, y) => (x.order ?? 0) - (y.order ?? 0))
                                return S.list()
                                  .title(title)
                                  .items([
                                    ...folders.map((folder) =>
                                      S.listItem()
                                        .title(folder.title)
                                        .id(folder._id)
                                        .child(
                                          S.documentList()
                                            .title(folder.title)
                                            .apiVersion(API_VERSION)
                                            .filter(
                                              '_type == "project" && discipline == "3d" && category._ref == $folder',
                                            )
                                            .params({folder: folder._id})
                                            // Renders sort by image filename on
                                            // the site; the asset name is not
                                            // orderable here, so the title —
                                            // which is named to match — stands
                                            // in for it.
                                            .defaultOrdering([
                                              {field: 'title', direction: 'asc'},
                                            ])
                                            .initialValueTemplates([
                                              S.initialValueTemplateItem('project-by-gallery', {
                                                discipline: '3d',
                                                category: folder._id,
                                              }),
                                            ]),
                                        ),
                                    ),
                                    // Creating and renaming folders sits below
                                    // the folders themselves, so the list reads
                                    // as content first and tooling last.
                                    S.divider(),
                                    S.documentTypeListItem('renderFolder')
                                      .title('Manage folders')
                                      .id('folders'),
                                  ])
                              }
                            : S.documentList()
                                .title(title)
                                .apiVersion(API_VERSION)
                                .filter('_type == "project" && discipline == $discipline')
                                .params({discipline: value})
                                // The order the galleries render in, so the
                                // list reads top to bottom the way the page
                                // does.
                                .defaultOrdering([{field: 'order', direction: 'asc'}])
                                // "+" inside a folder creates a project
                                // already in that gallery, rather than one
                                // that lands in 3D and has to be moved.
                                .initialValueTemplates([
                                  S.initialValueTemplateItem('project-by-gallery', {
                                    discipline: value,
                                  }),
                                ]),
                        ),
                    ),
                  ),
              ),
            S.documentTypeListItem('skillGroup').title('Skill groups'),
            S.documentTypeListItem('experienceEntry').title('Experience & education'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      // Singletons are created by Structure, never from the "new document"
      // menu — one of each is the whole point.
      ...templates.filter(({schemaType}) => !SINGLETONS.includes(schemaType as never)),
      {
        id: 'project-by-gallery',
        title: 'Project in gallery',
        schemaType: 'project',
        parameters: [
          {name: 'discipline', type: 'string'},
          // The id of a renderFolder. Only the 3D folders pass this; the
          // other galleries have none.
          {name: 'category', type: 'string'},
        ],
        value: ({discipline, category}: {discipline: string; category?: string}) =>
          category
            ? {discipline, category: {_type: 'reference', _ref: category}}
            : {discipline},
      },
    ],
  },

  document: {
    actions: (actions, {schemaType}) =>
      SINGLETONS.includes(schemaType as never)
        ? actions.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : actions,
  },
})
