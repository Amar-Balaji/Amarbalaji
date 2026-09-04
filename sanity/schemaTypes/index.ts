import {contact} from './contact'
import {experienceEntry} from './experienceEntry'
import {hero} from './hero'
import {project} from './project'
import {siteSettings} from './siteSettings'
import {skillGroup} from './skillGroup'

export const schemaTypes = [
  hero,
  project,
  experienceEntry,
  skillGroup,
  contact,
  siteSettings,
]

/**
 * One document each, addressed by a fixed `_id` so the frontend can fetch
 * them without a filter and the Studio can open them directly rather than
 * showing a list you could add a second one to.
 */
export const SINGLETONS = ['hero', 'contact', 'siteSettings'] as const
