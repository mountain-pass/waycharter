import express from 'express'
import { IncomingHttpHeaders } from 'http'

/**
 * @param request
 * @param response
 * @param headerParameters
 */
export function filterHeaders (
  request: express.Request,
  response: express.Response,
  headerParameters: string[]
): IncomingHttpHeaders {
  if (headerParameters.length > 0) {
    const filteredHeaders = {}
    for (const headerName in request.headers) {
      if (headerParameters.includes(headerName)) {
        filteredHeaders[headerName] = request.headers[headerName]
      }
    }
    return filteredHeaders
  }
  return {}
}
