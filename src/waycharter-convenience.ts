import express from 'express'
import { EndPoint, HandlerResponse } from './waycharter'
import { Link } from './link'

type V1LoaderResult<T> = HandlerResponse<T>

type V1CollectionLoaderResult<T> = HandlerResponse<T> & {
  hasMore: boolean
}

type RegisterResourceTypeConfig<T> = {
  path: string
  loader: (parameters: Record<string, unknown>) => Promise<V1LoaderResult<T>>
}

type RegisterCollectionConfig<ItemBody, CollectionBody> = {
  itemPath?: string
  itemLoader?: (parameters: Record<string, unknown>) => Promise<V1LoaderResult<ItemBody>>
  collectionPath: string
  collectionLoader: (parameters: Record<string, unknown>) => Promise<V1CollectionLoaderResult<CollectionBody>>
  filters?: Array<{ rel: string; parameters: string[] }>
}

type RegisterStaticResourceConfig<T> = {
  path: string
  body: T
  links?: Link[]
  headers?: Record<string, string>
}

type RegistrationResult = {
  pathTemplate: string
  path: (parameters?: Record<string, unknown>) => string
}

type CollectionRegistrationResult = RegistrationResult & {
  additionalPaths: Link[]
}

export class WayCharter {
  router: express.Router

  constructor() {
    this.router = express.Router()
  }

  registerResourceType<T>({ path, loader }: RegisterResourceTypeConfig<T>): RegistrationResult {
    const endpoint = EndPoint.create<T>({
      router: this.router,
      path,
      handler: async ({ pathParameters, queryParameters, response }) => {
        const result = await loader({ ...pathParameters, ...queryParameters })
        response.chart(result)
      }
    })
    return {
      pathTemplate: endpoint.pathTemplate,
      path: (parameters) => endpoint.path(parameters)
    }
  }

  registerCollection<ItemBody, CollectionBody>({
    itemPath,
    itemLoader,
    collectionPath,
    collectionLoader,
    filters = []
  }: RegisterCollectionConfig<ItemBody, CollectionBody>): CollectionRegistrationResult {
    // Register item endpoint if provided
    let itemPathTemplate: string | undefined
    if (itemPath !== undefined && itemLoader !== undefined) {
      const itemEndpoint = EndPoint.create<ItemBody>({
        router: this.router,
        path: `${collectionPath}${itemPath}`,
        handler: async ({ pathParameters, response }) => {
          const result = await itemLoader(pathParameters)
          response.chart(result)
        }
      })
      itemPathTemplate = itemEndpoint.pathTemplate
    }

    const additionalPaths: Link[] = filters.map(f => ({
      rel: f.rel,
      uri: `${collectionPath}{?${f.parameters.join(',')}}`
    }))

    // Use EndPoint.create (not createCollection) so we can generate
    // per-item links like v1 did, instead of v2's template links
    const collectionEndpoint = EndPoint.create<CollectionBody>({
      router: this.router,
      path: collectionPath,
      handler: async ({ queryParameters, response }) => {
        const page = typeof queryParameters.page === 'string' ? queryParameters.page : undefined
        const pageInt = Number.parseInt(page || '0')
        // Filter query params to only those in filters (exclude 'page')
        const filteredQuery: Record<string, string> = {}
        const allowedParameters = new Set(filters.flatMap(f => f.parameters))
        for (const [key, value] of Object.entries(queryParameters)) {
          if (allowedParameters.has(key) && typeof value === 'string') {
            filteredQuery[key] = value
          }
        }
        const result = await collectionLoader({ page: pageInt, ...filteredQuery })
        const { hasMore, links: loaderLinks, ...rest } = result
        const body = rest.body

        // Build per-item links (v1 style: #/0, #/1, etc.)
        const itemLinks: Link[] = []
        const canonicalLinks: Link[] = []
        if (Array.isArray(body)) {
          for (let index = 0; index < body.length; index++) {
            itemLinks.push({ rel: 'item', uri: `#/${index}` })
            if (itemPathTemplate) {
              canonicalLinks.push({
                rel: 'canonical',
                uri: itemPathTemplate,
                anchor: `#/${index}`
              })
            }
          }
        }

        // Build pagination links
        const queryString = new URLSearchParams(filteredQuery).toString()
        const paginationLinks: Link[] = [ {
          rel: 'first',
          uri: queryString ? `${collectionPath}?${queryString}` : collectionPath
        }]
        if (hasMore) {
          const nextParameters = new URLSearchParams({ page: String(pageInt + 1), ...filteredQuery }).toString()
          paginationLinks.push({ rel: 'next', uri: `${collectionPath}?${nextParameters}` })
        }
        if (pageInt === 1) {
          paginationLinks.push({
            rel: 'prev',
            uri: queryString ? `${collectionPath}?${queryString}` : collectionPath
          })
        } else if (pageInt > 1) {
          const previousParameters = new URLSearchParams({ page: String(pageInt - 1), ...filteredQuery }).toString()
          paginationLinks.push({ rel: 'prev', uri: `${collectionPath}?${previousParameters}` })
        }

        response.chart({
          ...rest,
          links: [
            ...itemLinks,
            ...canonicalLinks,
            ...paginationLinks,
            ...(loaderLinks || []),
          ],
        })
      }
    })

    return {
      additionalPaths,
      pathTemplate: collectionEndpoint.pathTemplate,
      path: (parameters) => collectionEndpoint.path(parameters)
    }
  }

  registerStaticResource<T>({ path, body, links, headers }: RegisterStaticResourceConfig<T>): RegistrationResult {
    const endpoint = EndPoint.createStatic<T>({
      router: this.router,
      path,
      body,
      links,
      headers
    })
    return {
      pathTemplate: endpoint.pathTemplate,
      path: (parameters) => endpoint.path(parameters)
    }
  }
}
