import { URI } from 'uri-template-lite'
import { toLinks } from '../to-links'
import { ItemActions } from '../action'
import { EndPoint } from '../waycharter'
import { Link } from '../link'

/**
 * @param array
 * @param arrayPointer
 * @param collectionPointer
 * @param itemEndPoint
 * @param collectionPath
 * @param selfUri
 * @param itemActions
 */
export function builtItemLinks<ItemResponseBody, CanonicalItemActionResponseBody>(
  collectionPointer: string,
  itemEndPoint: EndPoint<ItemResponseBody, CanonicalItemActionResponseBody>,
  selfUri: string,
  itemActions: ItemActions<CanonicalItemActionResponseBody>
): {
  itemLinks: Link[], canonicalLinks: Link[]
} {
  console.log({ collectionPointer, itemEndPoint, selfUri, itemActions })
  const itemLinks = []
  const canonicalLinks = []
  itemLinks.push({
    rel: 'item',
    uri: `#${collectionPointer}`
  })
  if (itemEndPoint) {
    console.log({
      linkTo: {
        rel: 'canonical',
        uri: itemEndPoint.pathTemplate,
        anchor: `#${collectionPointer}`
      }
    })
    canonicalLinks.push({
      rel: 'canonical',
      uri: itemEndPoint.pathTemplate,
      anchor: `#${collectionPointer}`
    })
  }
  if (itemActions) {
    itemLinks.push(
      ...toLinks(itemActions, selfUri, action => {
        const { anchor, accept, ...other } = action
        return {
          ...other,
          anchor: `#${collectionPointer}`,
          accept: accept || [
            'application/json',
            'application/x-www-form-urlencoded',
            'multipart/form-data'
          ] // TODO: allow caller to specify accept
        }
      })
    )
  }
  return { itemLinks, canonicalLinks }
}
