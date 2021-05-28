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
      try {
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
      loader: async ({ page }) => {
        // TODO:  ${collectionPath}?page=0 should redirect to ${collectionPath}
        if (page === '0') {
          return {
            status: 308,
            headers: {
              location: collectionPath
            }
          }
        }
        const pageInt = Number.parseInt(page || '0')
        const { body, arrayPointer, hasMore } = await collectionLoader({
          page: pageInt
        })
        const array = arrayPointer ? pointer.get(body, arrayPointer) : body
        console.log({ arrayPointer, body, array })
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
              pathTemplate = pathTemplate.replace(
                parameters[key],
                `{this.${key}}`
              )
            })
            canonicalLinks.push({
              rel: 'canonical',
              uri: pathTemplate,
              anchor: `#${arrayPointer || ''}/{[0..${array.length - 1}]}`
            })
          }
        }

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

  registerStaticCollection ({
    collectionPath,
    collection,
    pageSize,
    arrayPointer
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
          arrayPointer
        }
      }
    })
  }
}
