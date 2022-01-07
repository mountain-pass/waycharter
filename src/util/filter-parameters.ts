import { Request } from 'express';
import { Query } from 'express-serve-static-core'
import { methodCanHaveBody } from './method-can-have-body'

/**
 * @param filters
 * @param queryParameters
 */
export function filterParameters(
  filters: { rel: string; parameters: Array<string> }[],
  queryParameters: Query
): Query {
  const filteredParameters = {}
  for (const filter of filters || []) {
    for (const parameter of filter.parameters) {
      if (queryParameters[parameter] !== undefined) {
        filteredParameters[parameter] = queryParameters[parameter]
      }
    }
  }
  return filteredParameters
}

/**
 * @param request
 * @param parameters
 */
export function filterBodyParameters(
  request: Request,
  parameters: string[] | { [key: string]: {} } | undefined
): Record<string, unknown> {
  if (parameters) {
    const canHaveBody = methodCanHaveBody(request.method)
    if (canHaveBody) {
      return Object.keys(request.body)
        .filter(key =>
          Array.isArray(parameters) ? parameters.includes(key) : parameters[key]
        )
        .reduce((previous, current) => {
          return { ...previous, [current]: request.body[current] }
        }, {})
    }
  } else {
    return {}
  }
}
