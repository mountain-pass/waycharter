import { Router } from 'express'
import { URI } from 'uri-template-lite'
import pointer from 'jsonpointer'
import { methodCanHaveBody } from './method-can-have-body'
import { covertResourceLinks } from './convert-resource-links'
import { buildFirstLink } from './collections/build-first-link'
import { buildPreviousLink } from './collections/build-previous-link'
import { buildNextLink } from './collections/build-next-link'
import { builtItemLinks } from './collections/built-item-links'
import { methodIsCacheable } from './method-is-cacheable'

/**
 * @param url
 */
function routerToRfc6570 (url) {
  return url.replace(/:(\w*)/g, '{+$1}')
}
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
          filteredHeaders,
          request.url
        )

        if (loaderVaries) {
          response.header('vary', [...lowerCaseLoaderVaries])
        }
        sendResponse(resource, response, request.url, [
          {
            rel: 'self',
            uri: request.url
          }
        ])
      } catch (error) {
        // next(error)
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

  registerOperation ({
    method,
    path,
    operation,
    bodyParameters,
    headerParameters
  }) {
    const upperCaseMethod = method.toUpperCase()
    const lowerCaseMethod = method.toLowerCase()
    const lowerCaseHeaderParameters =
      headerParameters &&
      new Set(headerParameters.map(header => header.toLowerCase()))
    this.router[lowerCaseMethod](path, async (request, response, next) => {
      try {
        let filteredHeaders = request.headers
        if (methodIsCacheable(upperCaseMethod) && headerParameters) {
          response.header('vary', [...lowerCaseHeaderParameters])
          filteredHeaders = {}
          for (const headerName in request.headers) {
            if (lowerCaseHeaderParameters.has(headerName)) {
              filteredHeaders[headerName] = request.headers[headerName]
            }
          }
        }

        const resource = await operation({
          parameters: {
            ...request.params,
            ...request.query,
            ...(methodCanHaveBody(upperCaseMethod) && request.body)
          },
          requestHeaders: filteredHeaders,
          requestUrl: request.url,
          request,
          response
        })
        sendResponse(resource, response, request.url)
      } catch (error) {
        // next(error)
        console.error(error)
        response.status(500)
        response.json({})
      }
    })
    const uriTemplate = routerToRfc6570(path)
    const template = new URI.Template(uriTemplate)
    const pathParameters = template.match(uriTemplate)
    return {
      method: upperCaseMethod,
      ...(methodCanHaveBody(upperCaseMethod) && { bodyParameters }),
      pathParameters,
      ...(methodIsCacheable(upperCaseMethod) && {
        headerParameters: lowerCaseHeaderParameters
      }),
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

    const linkTemplates = []
    for (const filter of filters) {
      linkTemplates.push({
        rel: filter.rel,
        uri: `${collectionPath}{?${filter.parameters.join(',')}}`
      })
    }
    const type = this.registerResourceType({
      path: collectionPath,
      loader: async (
        { page, ...otherParameters },
        filteredHeaders,
        selfUri
      ) => {
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

        const {
          body,
          arrayPointer,
          hasMore,
          headers,
          itemOperations
        } = await collectionLoader({
          page: pageInt,
          ...filteredParameters
        })
        const array = arrayPointer ? pointer.get(body, arrayPointer) : body
        const { itemLinks, canonicalLinks } = builtItemLinks(
          array,
          arrayPointer,
          itemType,
          selfUri,
          itemOperations
        )
        return {
          body,
          links: [
            ...itemLinks,
            ...canonicalLinks,
            ...buildNextLink(hasMore, pageInt, collectionPath, otherParameters),
            ...buildPreviousLink(pageInt, collectionPath, otherParameters),
            ...buildFirstLink(hasMore, pageInt, collectionPath, otherParameters)
          ],
          linkTemplates,
          headers
        }
      }
    })
    return { ...type, additionalPaths: linkTemplates }
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
 * @param resource
 * @param response
 * @param requestUrl
 * @param additionalLinks
 */
function sendResponse (resource, response, requestUrl, additionalLinks = []) {
  if (resource.links || additionalLinks.length > 0) {
    const links = covertResourceLinks([
      ...additionalLinks,
      ...(resource.links || [])
    ])
    response.header('link', links.toString())
  }
  if (resource.linkTemplates) {
    const linkTemplates = covertResourceLinks(resource.linkTemplates)
    response.header('link-template', linkTemplates.toString())
  }
  if (resource.status) {
    response.status(resource.status)
  }
  if (resource.headers) {
    for (const header in resource.headers) {
      response.header(header, resource.headers[header])
    }
  }
  if (resource.body) {
    response.json(resource.body)
  } else {
    response.end()
  }
}
