import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'iow9ex5z', dataset: 'production'},
  // Hosted at <studioHost>.sanity.studio, so the Studio is reachable from
  // any machine without running it locally.
  studioHost: 'amarbalajiportfolio',
  // Pinned so a redeploy never prompts for, or picks, a different app.
  deployment: {appId: 'zfxzz6ea65kver3higq1ix9r'},
  // The app folder sits next to this one. Its name has a space in it, which
  // is fine in a glob string but would need quoting on a command line.
  typegen: {
    enabled: true,
    // Narrowed to the source folders: the bare `**` glob walked
    // node_modules too, which took 26s and produced 346 parse errors.
    path: '../portfolio website/{app,components,lib,hooks}/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../portfolio website/sanity.types.ts',
    overloadClientMethods: true,
  },
})
