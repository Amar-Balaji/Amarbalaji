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

/**
 * The folders 3D Visualisation drills into. Same values as the `category`
 * field, for the same reason as above. Front Page fills the homepage tunnel;
 * the other four are the sections on the works page.
 */
const RENDER_FOLDERS = [
  {value: 'frontpage', title: 'Front Page'},
  {value: 'workspace', title: 'Workspace Renders'},
  {value: 'residential', title: 'Residential Renders'},
  {value: 'commercial', title: 'Commercial Space Renders'},
  {value: 'other', title: 'Other Renders'},
] as const

export default defineConfig({
  name: 'default',
  title: 'AmarbalajiPortfolio',

  projectId: 'iow9ex5z',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
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
                          // every render it holds.
                          value === '3d'
                            ? S.list()
                                .title(title)
                                .items(
                                  RENDER_FOLDERS.map((folder) =>
                                    S.listItem()
                                      .title(folder.title)
                                      .id(folder.value)
                                      .child(
                                        S.documentList()
                                          .title(folder.title)
                                          .apiVersion('2026-08-27')
                                          .filter(
                                            '_type == "project" && discipline == "3d" && coalesce(category, "other") == $category',
                                          )
                                          .params({category: folder.value})
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
                                              category: folder.value,
                                            }),
                                          ]),
                                      ),
                                  ),
                                )
                            : S.documentList()
                                .title(title)
                                .apiVersion('2026-08-27')
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
          // Only the 3D folders pass this; the other galleries have none.
          {name: 'category', type: 'string'},
        ],
        value: ({discipline, category}: {discipline: string; category?: string}) =>
          category ? {discipline, category} : {discipline},
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
