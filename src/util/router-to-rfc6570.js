/**
 * @param url
 */
export function routerToRfc6570(url) {
  return url.replace(/:(\w*)/g, '{+$1}')
}
