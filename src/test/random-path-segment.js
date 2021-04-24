import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} from 'unique-names-generator'

export function randomPathSegment () {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals]
  })
}
