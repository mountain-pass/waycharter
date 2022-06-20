import express from 'express'
import { URI } from 'uri-template-lite'
import { covertResourceLinks } from './util/convert-resource-links'
import { Link } from './link'
import { buildFirstLink } from './collections/build-first-link'
import { buildPreviousLink } from './collections/build-previous-link'
import { buildNextLink } from './collections/build-next-link'
import { builtItemLinks } from './collections/built-item-links'
import { routerToRfc6570 } from './util/router-to-rfc6570'
import { toLinks } from './to-links'
import { Handler, CollectionHandler } from './handler'
import { Actions, ItemActions, Action } from './action'
import { filterHeaders } from './util/filter-headers'
import { checkPage } from './util/check-page'
import { extractPathParameters } from './util/extract-path-parameters'
import { arrayToLowerCase } from './util/array-to-lower-case'
import {
  filterBodyParameters,
  filterParameters
} from './util/filter-parameters'
import { unique } from './util/unique'
import { Query } from 'express-serve-static-core'
import { ProblemDocument } from '@mountainpass/problem-document'

export type EmptyHandlerResponse = {
  links?: Array<Link>
  headers?: {
    [key: string]: string
  }
  status?: number
}

export type HandlerResponse<ResponseBody> = EmptyHandlerResponse & {
  body: ResponseBody
}

export type CollectionHandlerResponse<ResponseBody> = HandlerResponse<ResponseBody> & {
  collectionPointer: string
  hasMore?: boolean
}

/**
 * @param resource
 * @param response
 * @param requestUrl
 * @param additionalLinks
 */
function sendHandlerResponse<ResponseBody>(
  resource: HandlerResponse<ResponseBody> | EmptyHandlerResponse,
  response: express.Response<ResponseBody>,
  additionalLinks?: Array<Link>
): void {
  if (resource.links || additionalLinks) {
    const links = covertResourceLinks([
      ...(additionalLinks || []),
      ...(resource.links || [])
    ])
    response.header('link', links.toString())
  }
  if (resource.status) {
    response.status(resource.status)
  }
  if (resource.headers) {
    for (const header in resource.headers) {
      response.header(header, resource.headers[header])
    }
  }
  if ('body' in resource) {
    response.json(resource.body)
  } else {
    response.end()
  }
}

type ChartItem<ResponseBody> = (arguments_: HandlerResponse<ResponseBody>) => void;
type ChartError = (arguments_: HandlerResponse<ProblemDocument>) => void;
type ChartCollection<ResponseBody> = (arguments_: CollectionHandlerResponse<ResponseBody>) => void
type ChartRedirect = (arguments_: EmptyHandlerResponse) => void

declare module 'express' {
  // eslint-disable-next-line unicorn/prevent-abbreviations 
  export interface Response<ResBody = any> {
    chart: ChartItem<ResBody>
    chartCollection: ChartCollection<ResBody>
    chartError: ChartError
    chartRedirect: ChartRedirect
  }
}

export type EndPointParameters<ResponseBody, ActionResponseBody> = {
  router: express.Router
  path: string
  headerParameters?: Array<string>
  handler: Handler<ResponseBody>
  actions?: Actions<ActionResponseBody>,
  links?: Link[]
}

type CollectionEndPointParameters<ResponseBody, ActionResponseBody, CanonicalItemResponseBody, CanonicalItemActionResponseBody> = Omit<EndPointParameters<ResponseBody, ActionResponseBody>, 'handler'> & {
  handler: CollectionHandler<ResponseBody>
  filters?: Array<{
    rel: string
    parameters: Array<string>
  }>
  itemActions?: ItemActions<CanonicalItemActionResponseBody>
  // eslint-disable-next-line no-use-before-define
  itemEndpoint?: EndPoint<CanonicalItemResponseBody, CanonicalItemActionResponseBody>
}

export class EndPoint<ResponseBody, ActionResponseBody> {
  router: express.Router
  handler: Handler<ResponseBody>
  pathParameters: { [key: string]: string }
  headerParameters: Array<string>
  pathTemplate: string
  links: Array<Link>

  static createStatic<ResponseBody, ActionResponseBody = void>({
    router,
    path,
    headerParameters,
    actions,
    ...handlerResponse
  }: Omit<EndPointParameters<ResponseBody, ActionResponseBody> & HandlerResponse<ResponseBody>, 'handler'>): EndPoint<ResponseBody, ActionResponseBody> {
    return EndPoint.create({
      router,
      path,
      headerParameters,
      handler: async ({ response }) => {
        response.chart(handlerResponse)
      },
      actions,
    })
  }

  static createCollection<ResponseBody, CanonicalItemResponseBody = void, ActionResponseBody = void, CanonicalItemActionResponseBody = void>({
    router,
    path,
    headerParameters,
    filters,
    handler,
    actions,
    links,
    itemActions,
    itemEndpoint
  }: CollectionEndPointParameters<ResponseBody, ActionResponseBody, CanonicalItemResponseBody, CanonicalItemActionResponseBody>): EndPoint<ResponseBody, ActionResponseBody> {
    const filterLinks = []
    for (const filter of filters || []) {
      filterLinks.push({
        rel: filter.rel,
        uri: `${path}{?${filter.parameters.join(',')}}`
      })
    }
    const endpoint = new EndPoint<ResponseBody, ActionResponseBody>({
      router,
      path,
      headerParameters,
      actions,
      links: [
        ...links || [],
        ...filterLinks
      ],
      handler: async ({
        pathParameters,
        queryParameters,
        requestHeaders,
        request,
        response,
        next
      }) => {
        const expandedPath = endpoint.path({ ...pathParameters || {}, ...queryParameters || {} })
        const { page } = queryParameters

        const pageCheckResult = checkPage(page, expandedPath)
        if ('redirect' in pageCheckResult) {
          response.chartRedirect(pageCheckResult.redirect)
        }
        else if ('pageValidationError' in pageCheckResult) {
          response.chartError(pageCheckResult.pageValidationError)
        }
        else {
          // we only want to include query params that are part of the filter,
          // but we can include all path params
          const filteredQueryParameters = filterParameters(filters, request.query)
          response.chartCollection = async resource => {
            sendCollectionHandlerResponse(
              resource,
              request.url,
              response,
              pageCheckResult.pageInt,
              expandedPath,
              filteredQueryParameters,
              itemActions,
              itemEndpoint,
            )
          }

          handler({
            page: pageCheckResult.pageInt,
            pathParameters: request.params,
            queryParameters: filteredQueryParameters,
            requestHeaders,
            request,
            response,
            next
          })
        }
      }
    })

    for (const method in itemActions) {
      const methodActions: Array<Action<CanonicalItemActionResponseBody>> = itemActions[method]
      for (const action of methodActions) {
        router[method.toLowerCase()](
          path,
          async (
            request: express.Request,
            response: express.Response<CanonicalItemActionResponseBody | ProblemDocument | void>,
            next: express.NextFunction
          ) => {
            response.chart = async (resource: HandlerResponse<CanonicalItemActionResponseBody>) => {
              endpoint.sendResponse(
                resource,
                request,
                response,
                actions,
                itemActions
              )
            }
            response.chartError = async (resource: HandlerResponse<ProblemDocument>) => {
              endpoint.sendResponse(
                resource,
                request,
                response,
                actions,
                itemActions
              )
            }

            try {
              const { parameters, handler } = action

              const filteredBodyParameters = filterBodyParameters(
                request,
                parameters
              )
              handler({
                pathParameters: request.params,
                queryParameters: filterParameters(filters, request.query),
                bodyParameters: filteredBodyParameters,
                request,
                response,
                next
              })
            } catch (error) {
              next(error)
            }
          }
        )
      }
    }
    endpoint.addDefaultHandler(path, actions, itemActions)
    return endpoint
  }

  static createStaticCollection<ResponseBody, CanonicalItemResponseBody = void, ActionResponseBody = void, CanonicalItemActionResponseBody = void>({
    router,
    path,
    headerParameters,
    filters,
    actions,
    itemActions,
    itemEndpoint,
    ...collectionHandlerResponse
  }: Omit<CollectionEndPointParameters<ResponseBody, ActionResponseBody, CanonicalItemResponseBody, CanonicalItemActionResponseBody>, 'handler'> &
    Omit<CollectionHandlerResponse<ResponseBody>, 'hasMore'>): EndPoint<ResponseBody, ActionResponseBody> {
    return EndPoint.createCollection({
      router,
      path,
      headerParameters,
      filters,
      handler: async ({ response }) => {
        response.chartCollection(collectionHandlerResponse)
      },
      actions,
      itemActions,
      itemEndpoint
    })
  }

  static create<ResponseBody, ActionResponseBody = void>({
    router,
    path,
    headerParameters,
    handler,
    actions,
    links
  }: EndPointParameters<ResponseBody, ActionResponseBody>) {
    const endpoint = new EndPoint<ResponseBody, ActionResponseBody>({
      router,
      path,
      headerParameters,
      handler,
      actions,
      links
    })
    endpoint.addDefaultHandler(path, actions)
    return endpoint
  }

  private constructor({
    router,
    path,
    headerParameters,
    handler,
    actions,
    links
  }: EndPointParameters<ResponseBody, ActionResponseBody>) {
    this.router = router
    this.handler = handler
    this.headerParameters = unique(arrayToLowerCase(headerParameters))
    this.pathTemplate = routerToRfc6570(path)
    this.pathParameters = extractPathParameters(this.pathTemplate)
    this.links = links || []
    router.get(
      path,
      async (
        request: express.Request,
        response: express.Response<ResponseBody | ProblemDocument | void>,
        next: express.NextFunction
      ) => {
        try {
          const filteredHeaders = filterHeaders(
            request,
            response,
            this.headerParameters
          )
          response.chart = async (resource: HandlerResponse<ResponseBody>) => {
            this.sendResponse(resource, request, response, actions)
          }
          response.chartError = async (resource) => {
            this.sendResponse(resource, request, response, actions)
          }
          response.chartRedirect = async (resource) => {
            this.sendResponse(resource, request, response, actions)
          }

          await this.handler({
            pathParameters: request.params,
            queryParameters: request.query,
            requestHeaders: filteredHeaders,
            request,
            response,
            next
          })
        } catch (error) {
          next(error)
        }
      }
    )

    for (const method in actions) {
      const methodActions: Array<Action<ActionResponseBody>> = actions[method]
      for (const action of methodActions) {
        router[method.toLowerCase()](
          path,
          async (
            request: express.Request,
            response: express.Response,
            next: express.NextFunction
          ) => {
            response.chart = async (resource: HandlerResponse<ActionResponseBody>) => {
              this.sendResponse(resource, request, response, actions)
            }

            try {
              const { parameters, handler } = action

              const filteredBodyParameters = filterBodyParameters(
                request,
                parameters
              )
              handler({
                pathParameters: request.params,
                queryParameters: request.query,
                bodyParameters: filteredBodyParameters,
                request,
                response,
                next
              })
            } catch (error) {
              next(error)
            }
          }
        )
      }
    }
  }

  private addDefaultHandler<CanonicalItemActionResponseBody>(
    path: string,
    actions?: Actions<ActionResponseBody>,
    itemActions?: ItemActions<CanonicalItemActionResponseBody>
  ) {
    // default options handler
    this.router.options(
      path,
      async (
        request: express.Request,
        response: express.Response<undefined>,
        next: express.NextFunction
      ) => {
        this.sendResponse<undefined>(
          {
            status: 204,
            headers: {
              allow: unique([
                'GET',
                'HEAD',
                'OPTIONS',
                ...(actions ? Object.keys(actions) : []),
                ...(itemActions ? Object.keys(itemActions) : [])
              ]).join(', ')
            }
          },
          request,
          response,
          actions,
          itemActions
        )
      }
    )

    this.router.all(
      path,
      async (
        request: express.Request,
        response: express.Response<undefined>,
        next: express.NextFunction
      ) => {
        this.sendResponse(
          {
            status: 406
          },
          request,
          response,
          actions,
          itemActions
        )
      }
    )
  }

  private sendResponse<X>(
    resource: HandlerResponse<X> | EmptyHandlerResponse,
    request: express.Request,
    response: express.Response<X>,
    actions?: Actions<ActionResponseBody>,
    itemActions?: Actions<unknown>
  ) {
    const actionLinks = [
      ...(actions ? toLinks(actions, request.url) : []),
      ...(itemActions ? toLinks(itemActions, request.url) : [])
    ]
    if (this.headerParameters.length > 0) {
      response.header('vary', this.headerParameters)
    }
    sendHandlerResponse(resource, response, [
      {
        rel: 'self',
        uri: request.url
      },
      ...this.links,
      ...actionLinks
    ])
  }

  private sendCollectionResponse<X>(
    resource: HandlerResponse<X>,
    request: express.Request,
    response: express.Response<X>,
    actions?: Actions<ActionResponseBody>,
    itemActions?: Actions<unknown>
  ) {
    const actionLinks = [
      ...(actions ? toLinks(actions, request.url) : []),
      ...(itemActions ? toLinks(itemActions, request.url) : [])
    ]
    if (this.headerParameters.length > 0) {
      response.header('vary', this.headerParameters)
    }
    sendHandlerResponse(resource, response, [
      {
        rel: 'self',
        uri: request.url
      },
      ...this.links,
      ...actionLinks
    ])
  }

  path(parameters?: { [key: string]: unknown }): string {
    return parameters
      ? URI.expand(this.pathTemplate, parameters)
      : this.pathTemplate
  }

  linkTo(link: Link): EndPoint<ResponseBody, ActionResponseBody> {
    this.links.push(link)
    return this
  }
}


/**
 * @param resource
 * @param requestUrl
 * @param response
 * @param pageInt
 * @param expandedPath
 * @param filteredParameters
 * @param itemActions
 * @param itemEndpoint
 * @param staticLinks
 */
function sendCollectionHandlerResponse<ResponseBody, CanonicalItemResponseBody, CanonicalItemActionResponseBody>(
  resource: CollectionHandlerResponse<ResponseBody>,
  requestUrl: string,
  response: express.Response<ResponseBody>,
  pageInt: number,
  expandedPath: string,
  filteredParameters: Query,
  itemActions: ItemActions<CanonicalItemActionResponseBody>,
  itemEndpoint: EndPoint<CanonicalItemResponseBody, CanonicalItemActionResponseBody>,
) {
  const { body, collectionPointer, hasMore, links, ...other } = resource
  const { itemLinks, canonicalLinks } = builtItemLinks(
    collectionPointer,
    itemEndpoint,
    requestUrl,
    itemActions
  )
  response.chart({
    body,
    links: [
      ...itemLinks,
      ...canonicalLinks,
      ...buildNextLink(hasMore, pageInt, expandedPath, filteredParameters),
      ...buildPreviousLink(pageInt, expandedPath, filteredParameters),
      ...buildFirstLink(hasMore, pageInt, expandedPath, filteredParameters),
      ...links || [],
    ],
    ...other
  })
}
