import { Router } from 'express'
import LinkHeader from 'http-link-header'
import { URI } from 'uri-template-lite'
import { routerToRfc6570 } from 'router-uri-convert'
import pointer from 'jsonpointer'

export class WayCharter {
  constructor () {
    this.router = Router()
  }

  registerResourceType ({ path, loader, loaderVaries }) {
    // TODO: error handling for path not set
    // TODO: error handling for loader not set
    const lowerCaseLoaderVaries = new Set(
      loaderVaries ? loaderVaries.map(header => header.toLowerCase()) : []
    )
    const uriTemplate = routerToRfc6570(path)
    this.router.get(path, async function (request, response, next) {
      const links = new LinkHeader()
      const linkTemplates = new LinkHeader()
      links.set({
        rel: 'self',
        uri: request.url
      })
      const filteredHeaders = Object.keys(request.headers).reduce(
        (filtered, key) =>
          lowerCaseLoaderVaries.has(key)
            ? { ...filtered, [key]: request.headers[key] }
            : filtered,
        {}
      )
      try {
        const resource = await loader(
          { ...request.params, ...request.query },
          filteredHeaders
        )
        for (const link of resource.links || []) {
          links.set(link)
        }
        response.header('link', links.toString())

        if (resource.linkTemplates) {
          for (const linkTemplate of resource.linkTemplates) {
            linkTemplates.set(Object.assign({ uri: request.url }, linkTemplate))
          }
          response.header('link-template', linkTemplates.toString())
        }

        if (loaderVaries) {
          response.header('vary', [...lowerCaseLoaderVaries])
        }
        if (resource.status) {
          response.status(resource.status)
        }
        if (resource.headers) {
          for (const header in resource.headers) {
            response.header(header, resource.headers[header])
          }
        }
        response.json(resource.body)
      } catch (error) {
        console.error(error)
        response.status(500)
        response.json({})
      }
    })
    return {
      pathTemplate: uriTemplate,
      path: parameters => URI.expand(uriTemplate, parameters)
    }
  }

  registerStaticResource ({ path, body, links }) {
    // TODO: error handling for path not set
    // TODO: error handling for body not set

    return this.registerResourceType({
      path,
      loader: async () => {
        return {
          body,
          links
        }
      }
    })
  }

  registerCollection ({
    itemPath,
    itemLoader,
    collectionPath,
    collectionLoader,
    filters = []
  }) {
    // TODO: error handling for itemPath set, but itemLoader isn't and visa-versa
    // TODO: error handling for collectionPath not set
    // TODO: error handling for collectionLoader not set
    const itemType =
      itemPath !== undefined && itemLoader !== undefined
        ? this.registerResourceType({
            path: `${collectionPath}${itemPath}`,
            loader: itemLoader
          })
        : undefined
    return this.registerResourceType({
      path: collectionPath,
      loader: async ({ page, ...otherParameters }) => {
        // ${collectionPath}?page=0 should redirect to ${collectionPath}
        if (page === '0') {
          return {
            status: 308,
            headers: {
              location: collectionPath
            }
          }
        }
        // TODO: page is not a number

        // page should be >= 0
        const pageInt = Number.parseInt(page || '0')
        if (page < 0) {
          return {
            status: 400
          }
        }
        const filteredParameters = {}
        for (const filter of filters) {
          for (const parameter of filter.parameters) {
            if (otherParameters[parameter] !== undefined) {
              filteredParameters[parameter] = otherParameters[parameter]
            }
          }
        }

        const { body, arrayPointer, hasMore, headers } = await collectionLoader(
          {
            page: pageInt,
            ...filteredParameters
          }
        )
        const array = arrayPointer ? pointer.get(body, arrayPointer) : body
        const { itemLinks, canonicalLinks } = builtItemLinks(
          array,
          arrayPointer,
          itemType
        )

        const linkTemplates = []
        for (const filter of filters) {
          linkTemplates.push({
            rel: filter.rel,
            uri: `{?${filter.parameters.join(',')}}`
          })
        }

        return {
          body,
          links: [
            ...itemLinks,
            ...canonicalLinks,
            ...buildNextLink(hasMore, pageInt, otherParameters),
            ...buildPreviousLink(pageInt, collectionPath, otherParameters),
            ...buildFirstLink(hasMore, pageInt, collectionPath, otherParameters)
          ],
          linkTemplates: linkTemplates,
          headers
        }
      }
    })
  }

  registerStaticCollection ({
    collectionPath,
    collection,
    pageSize,
    arrayPointer,
    headers
  }) {
    return this.registerCollection({
      collectionPath,
      collectionLoader: async ({ page }) => {
        const items = pageSize
          ? collection.slice(page * pageSize, (page + 1) * pageSize)
          : collection
        return {
          body: items,
          hasMore: pageSize && page < collection.length / pageSize - 1,
          arrayPointer,
          headers
        }
      }
    })
  }
}
/**
 * @param hasMore
 * @param pageInt
 * @param collectionPath
 * @param otherParameters
 */
function buildFirstLink (hasMore, pageInt, collectionPath, otherParameters) {
  if (pageInt > 0 || hasMore) {
    return Object.keys(otherParameters).length > 0
      ? [
          {
            rel: 'first',
            uri: `?${new URLSearchParams({
              ...otherParameters
            }).toString()}`
          }
        ]
      : [
          {
            rel: 'first',
            uri: collectionPath
          }
        ]
  } else {
    return []
  }
}

/**
 * @param pageInt
 * @param collectionPath
 * @param otherParameters
 */
function buildPreviousLink (pageInt, collectionPath, otherParameters) {
  if (pageInt === 1) {
    return Object.keys(otherParameters).length > 0
      ? [
          {
            rel: 'prev',
            uri: `?${new URLSearchParams({
              ...otherParameters
            }).toString()}`
          }
        ]
      : [
          {
            rel: 'prev',
            uri: collectionPath
          }
        ]
  } else if (pageInt > 1) {
    return [
      {
        rel: 'prev',
        uri: `?${new URLSearchParams({
          page: pageInt - 1,
          ...otherParameters
        }).toString()}`
      }
    ]
  } else {
    return []
  }
}

/**
 * @param hasMore
 * @param pageInt
 * @param otherParameters
 */
function buildNextLink (hasMore, pageInt, otherParameters) {
  return hasMore
    ? [
        {
          rel: 'next',
          uri: `?${new URLSearchParams({
            page: pageInt + 1,
            ...otherParameters
          }).toString()}`
        }
      ]
    : []
}

/**
 * @param array
 * @param arrayPointer
 * @param itemType
 */
function builtItemLinks (array, arrayPointer, itemType) {
  const itemLinks = []
  const canonicalLinks = []
  if (array.length === 1) {
    itemLinks.push({
      rel: 'item',
      uri: `#${arrayPointer || ''}/0`
    })
    if (itemType) {
      canonicalLinks.push({
        rel: 'canonical',
        uri: itemType.path(array[0]),
        anchor: `#${arrayPointer || ''}/0`
      })
    }
  } else if (array.length > 0) {
    itemLinks.push({
      rel: 'item',
      uri: `#${arrayPointer || ''}/{[0..${array.length - 1}]}`
    })
    if (itemType) {
      let pathTemplate = itemType.pathTemplate
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
  }
  return { itemLinks, canonicalLinks }
}
