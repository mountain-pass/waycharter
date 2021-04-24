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
      console.log('setting links')
      links.set({
        rel: 'self',
        uri: request.url
      })
      console.log('loading...')
      console.log({ headers: request.headers })
      const filteredHeaders = Object.keys(request.headers).reduce(
        (filtered, key) =>
          lowerCaseLoaderVaries.has(key)
            ? { ...filtered, [key]: request.headers[key] }
            : filtered,
        {}
      )
      const resource = await loader(
        { ...request.params, ...request.query },
        filteredHeaders
      )
      console.log('setting more links', resource.links)
      for (const link of resource.links || []) {
        links.set(link)
      }
      response.header('link', links.toString())
      if (loaderVaries) {
        response.header('vary', [...lowerCaseLoaderVaries])
      }
      console.log('sending', resource.body)
      response.json(resource.body)
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
    collectionLoader
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
      loader: async ({ page = '0' }) => {
        // TODO:  ${collectionPath}?page=0 should redirect to ${collectionPath}

        const pageInt = Number.parseInt(page)
        const { body, arrayPointer, hasMore } = await collectionLoader({
          page: pageInt
        })
        const array = arrayPointer ? pointer.get(body, arrayPointer) : body
        const itemLinks = array.map((item, index) => ({
          rel: 'item',
          uri: `#${arrayPointer || ''}/${index}`
        }))
        const canonicalLinks = itemType
          ? array.map((item, index) => ({
              rel: 'canonical',
              uri: itemType.path(item),
              anchor: `#${arrayPointer || ''}/${index}`
            }))
          : []

        return {
          body,
          links: [
            ...itemLinks,
            ...canonicalLinks,
            ...(hasMore ? [{ rel: 'next', uri: `?page=${pageInt + 1}` }] : []),
            ...(pageInt > 0
              ? [
                  {
                    rel: 'prev',
                    uri: pageInt === 1 ? collectionPath : `?page=${pageInt - 1}`
                  }
                ]
              : []),
            { rel: 'first', uri: collectionPath }
          ]
        }
      }
    })
  }
}
