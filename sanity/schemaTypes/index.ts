import {contact} from './contact'
import {discipline} from './discipline'
import {experienceEntry} from './experienceEntry'
import {footer} from './footer'
import {hero} from './hero'
import {homeHero} from './homeHero'
import {navbar} from './navbar'
import {project} from './project'
import {reel} from './reel'
import {siteSettings} from './siteSettings'
import {skillGroup} from './skillGroup'
import {socialLink} from './socialLink'

export const schemaTypes = [
  // sections, in the order the site reads
  navbar,
  homeHero,
  hero,
  discipline,
  project,
  reel,
  skillGroup,
  experienceEntry,
  contact,
  footer,
  siteSettings,
  // shared object, never a document of its own
  socialLink,
]

/**
 * One document each, addressed by a fixed `_id` so the frontend can fetch
 * them without a filter and the Studio can open them directly rather than
 * showing a list you could add a second one to.
 */
export const SINGLETONS = [
  'navbar',
  'homeHero',
  'hero',
  'reel',
  'contact',
  'footer',
  'siteSettings',
] as const
