/**
 * @param method
 */
export function methodCanHaveBody (method = 'GET') {
  return !['GET', 'DELETE', 'TRACE', 'OPTIONS', 'HEAD'].includes(method)
}
