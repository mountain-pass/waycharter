import { Router } from 'express'
import LinkHeader from 'http-link-header'
import { URI } from 'uri-template-lite'
import { routerToRfc6570 } from 'router-uri-convert'
import pointer from 'jsonpointer'

export class WayCharter {
  constructor () {
    this.router = Router()
  }

  registerResourceType ({ path, loader }) {
    const uriTemplate = routerToRfc6570(path)
    this.router.get(path, async function (request, response, next) {
      const links = new LinkHeader()
      console.log('setting links')
      links.set({
        rel: 'self',
        uri: request.url
      })
      console.log('loading...')
      const resource = await loader({ ...request.params, ...request.query })
      console.log('setting more links', resource.links)
      for (const link of resource.links || []) {
        links.set(link)
      }
      response.header('link', links.toString())
      console.log('sending', resource.body)
      response.json(resource.body)
    })
    return {
      pathTemplate: uriTemplate,
      path: parameters => URI.expand(uriTemplate, parameters)
    }
  }

  registerStaticResource ({ path, body, links }) {
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
    const itemType = this.registerResourceType({
      path: `${collectionPath}${itemPath}`,
      loader: itemLoader
    })
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
