/**
 * @param method
 */
export function methodIsCacheable (method) {
  return ['GET', 'HEAD'].includes(method)
}
