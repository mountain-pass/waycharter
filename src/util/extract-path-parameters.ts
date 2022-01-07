import { URI } from 'uri-template-lite'

/**
 * @param uriTemplate
 */
export function extractPathParameters (
  uriTemplate: string
): {
  [key: string]: string
} {
  const template = new URI.Template(uriTemplate)
  return template.match(uriTemplate)
}
