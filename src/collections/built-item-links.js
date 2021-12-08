import { URI } from 'uri-template-lite'
import { methodCanHaveBody } from '../method-can-have-body'

/**
 * @param array
 * @param arrayPointer
 * @param itemType
 * @param collectionPath
 * @param selfUri
 * @param itemOperations
 */
export function builtItemLinks (
  array,
  arrayPointer,
  itemType,
  selfUri,
  itemOperations
) {
  const itemLinks = []
  const canonicalLinks = []
  if (array.length === 1) {
    itemLinks.push({
      rel: 'item',
      uri: `${selfUri}#${arrayPointer || ''}/0`
    })
    if (itemType) {
      canonicalLinks.push({
        rel: 'canonical',
        uri: itemType.path(array[0]),
        anchor: `#${arrayPointer || ''}/0`
      })
    }
    if (itemOperations) {
      for (const relationship in itemOperations) {
        const endpoint = itemOperations[relationship]
        itemLinks.push(
          buildLink({
            rel: relationship,
            uri: endpoint.path(array[0]),
            anchor: `#${arrayPointer || ''}/0`,
            endpoint,
            array,
            arrayPointer
          })
        )
      }
    }
  } else if (array.length > 0) {
    itemLinks.push({
      rel: 'item',
      uri: `${selfUri}#${arrayPointer || ''}/{[0..${array.length - 1}]}`
    })
    if (itemType) {
      let pathTemplate = itemType.pathTemplate + ''
      const template = new URI.Template(itemType.pathTemplate)
      const parameters = template.match(itemType.pathTemplate)
      Object.keys(parameters).forEach(key => {
        pathTemplate = pathTemplate.replace(parameters[key], `{this.${key}}`)
      })
      canonicalLinks.push({
        rel: 'canonical',
        uri: pathTemplate,
        anchor: `#${arrayPointer || ''}/{[0..${array.length - 1}]}`
      })
    }
    if (itemOperations) {
      for (const relationship in itemOperations) {
        const endpoint = itemOperations[relationship]
        let pathTemplate = endpoint.pathTemplate + ''
        const template = new URI.Template(endpoint.pathTemplate)
        const parameters = template.match(endpoint.pathTemplate)
        Object.keys(parameters).forEach(key => {
          pathTemplate = pathTemplate.replace(parameters[key], `{this.${key}}`)
        })
        itemLinks.push(
          buildLink({
            rel: relationship,
            uri: pathTemplate,
            anchor: `#${arrayPointer || ''}/{[0..${array.length - 1}]}`,
            endpoint,
            array,
            arrayPointer
          })
        )
      }
    }
  }
  return { itemLinks, canonicalLinks }
}
/**
 * @param root0
 * @param root0.rel
 * @param root0.uri
 * @param root0.anchor
 * @param root0.endpoint
 * @param root0.array
 * @param root0.arrayPointer
 */
function buildLink ({ rel, uri, anchor, endpoint, array, arrayPointer }) {
  return {
    rel,
    uri,
    anchor,
    ...(endpoint.method && { method: endpoint.method }),
    ...((endpoint.parameters || endpoint.bodyParameters) && {
      parameters: endpoint.parameters || endpoint.bodyParameters
    }),
    ...(methodCanHaveBody(endpoint.method) && {
      accept: [
        'application/x-www-form-urlencoded',
        'application/json',
        'multipart/form-data'
      ]
    })
  }
}
