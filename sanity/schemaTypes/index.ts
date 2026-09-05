import {contact} from './contact'
import {experienceEntry} from './experienceEntry'
import {hero} from './hero'
import {project} from './project'
import {siteSettings} from './siteSettings'
import {skillGroup} from './skillGroup'
import {socialLink} from './socialLink'

export const schemaTypes = [
  // sections, in the order the site reads
  hero,
  project,
  skillGroup,
  experienceEntry,
  contact,
  siteSettings,
  // shared object, never a document of its own
  socialLink,
]

/**
 * One document each, addressed by a fixed `_id` so the frontend can fetch
 * them without a filter and the Studio can open them directly rather than
 * showing a list you could add a second one to.
 */
export const SINGLETONS = ['hero', 'contact', 'siteSettings'] as const
