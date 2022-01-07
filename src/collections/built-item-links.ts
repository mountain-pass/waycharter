import { URI } from 'uri-template-lite'
import { toLinks } from '../to-links'
import { ItemActions } from '../action'
import { EndPoint } from '../waycharter'
import { Link } from '../link'

/**
 * @param array
 * @param arrayPointer
 * @param itemEndPoint
 * @param collectionPath
 * @param selfUri
 * @param itemActions
 */
export function builtItemLinks<ItemResponseBody, CanonicalItemActionResponseBody>(
  array: Array<any>,
  arrayPointer: string,
  itemEndPoint: EndPoint<ItemResponseBody, CanonicalItemActionResponseBody>,
  selfUri: string,
  itemActions: ItemActions<CanonicalItemActionResponseBody>
): {
  itemLinks: Link[], canonicalLinks: Link[]
} {
  const itemLinks = []
  const canonicalLinks = []
  if (array.length === 1) {
    itemLinks.push({
      rel: 'item',
      uri: `#${arrayPointer || ''}/0`
    })
    if (itemEndPoint) {
      canonicalLinks.push({
        rel: 'canonical',
        uri: itemEndPoint.path(array[0]),
        anchor: `#${arrayPointer || ''}/0`
      })
    }
    if (itemActions) {
      itemLinks.push(
        ...toLinks(itemActions, selfUri, action => {
          const { anchor, accept, ...other } = action
          return {
            ...other,
            anchor: `#${arrayPointer || ''}/0`,
            accept: accept || [
              'application/json',
              'application/x-www-form-urlencoded',
              'multipart/form-data'
            ]
          }
        })
      )
    }
  } else if (array.length > 0) {
    itemLinks.push({
      rel: 'item',
      uri: `#${arrayPointer || ''}/{[0..${array.length - 1}]}`
    })
    if (itemEndPoint) {
      let pathTemplate = itemEndPoint.pathTemplate + ''
      const template = new URI.Template(itemEndPoint.pathTemplate)
      const parameters = template.match(itemEndPoint.pathTemplate)
      Object.keys(parameters).forEach(key => {
        pathTemplate = pathTemplate.replace(parameters[key], `{this.${key}}`)
      })
      canonicalLinks.push({
        rel: 'canonical',
        uri: pathTemplate,
        anchor: `#${arrayPointer || ''}/{[0..${array.length - 1}]}`
      })
    }
    if (itemActions) {
      itemLinks.push(
        ...toLinks(itemActions, selfUri, action => {
          const { anchor, accept, ...other } = action
          return {
            ...other,
            anchor: `#${arrayPointer || ''}/{[0..${array.length - 1}]}`,
            accept: accept || [
              'application/json',
              'application/x-www-form-urlencoded',
              'multipart/form-data'
            ]
          }
        })
      )
    }
  }
  return { itemLinks, canonicalLinks }
}
