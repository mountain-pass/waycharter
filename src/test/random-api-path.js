import { randomPathSegment } from './random-path-segment'

export let pathCount = 0

export function randomApiPath () {
  return `/api/${pathCount++}-${randomPathSegment()}`
}
