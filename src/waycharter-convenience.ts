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
    let itemEndpoint: EndPoint<ItemBody, void> | undefined
    if (itemPath !== undefined && itemLoader !== undefined) {
      itemEndpoint = EndPoint.create<ItemBody>({
        router: this.router,
        path: `${collectionPath}${itemPath}`,
        handler: async ({ pathParameters, response }) => {
          const result = await itemLoader(pathParameters)
          response.chart(result)
        }
      })
    }

    const additionalPaths: Link[] = filters.map(f => ({
      rel: f.rel,
      uri: `${collectionPath}{?${f.parameters.join(',')}}`
    }))

    const collectionEndpoint = EndPoint.createCollection<CollectionBody, ItemBody>({
      router: this.router,
      path: collectionPath,
      filters,
      itemEndpoint,
      handler: async ({ page, queryParameters, response }) => {
        const pageInt = Number.parseInt(page || '0')
        const result = await collectionLoader({ page: pageInt, ...queryParameters })
        const { hasMore, links: loaderLinks, ...rest } = result
        const previousLinks: Link[] = []
        if (pageInt === 1) {
          const queryString = new URLSearchParams(queryParameters as Record<string, string>).toString()
          previousLinks.push({
            rel: 'prev',
            uri: queryString ? `${collectionPath}?${queryString}` : collectionPath
          })
        }
        response.chartCollection({
          ...rest,
          links: [...(loaderLinks || []), ...previousLinks],
          collectionPointer: '/{index}',
          nextPage: hasMore ? String(pageInt + 1) : undefined,
          prevPage: pageInt > 1 ? String(pageInt - 1) : undefined,
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
