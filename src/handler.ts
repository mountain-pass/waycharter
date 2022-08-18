import express from 'express'
import { Query, ParamsDictionary } from 'express-serve-static-core'
import { IncomingHttpHeaders } from 'http'

export type HandlerParameters<ResponseBody> = {
  pathParameters: ParamsDictionary
  queryParameters: Query,
  requestHeaders: IncomingHttpHeaders
  request: express.Request
  response: express.Response<ResponseBody>
  next: express.NextFunction
}

export type Handler<ResponseBody> = (parameters: HandlerParameters<ResponseBody>) => Promise<void> | void

export type CollectionHandlerParameters<ResponseBody> = HandlerParameters<ResponseBody> & {
  page?: string
}

export type CollectionHandler<ResponseBody> = (
  parameters: CollectionHandlerParameters<ResponseBody>
) => Promise<void> | void

export type ActionHandlerParameters<ResponseBody> = Omit<HandlerParameters<ResponseBody>, 'requestHeaders'> & {
  bodyParameters: Record<string, unknown>
}

export type ActionHandler<ResponseBody> = (
  parameters: ActionHandlerParameters<ResponseBody>
) => Promise<void> | void
