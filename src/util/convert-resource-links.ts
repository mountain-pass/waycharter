import LinkHeader from 'http-link-header'
import { Link } from '../link'

/**
 * @param resourceLinks
 * @param requestUrl
 */
export function covertResourceLinks (resourceLinks: Array<Link>): LinkHeader {
  const links = new LinkHeader()
  for (const link of resourceLinks) {
    const { parameters: linkParameters, accept, uri, handler, ...other } = link
    const hasParameters =
      linkParameters &&
      ((Array.isArray(linkParameters) && linkParameters.length > 0) ||
        (typeof linkParameters === 'object' &&
          Object.keys(linkParameters).length > 0))

    links.set({
      ...other,
      uri,
      ...(hasParameters && {
        'params*': { value: JSON.stringify(linkParameters) }
      }),
      ...(accept && {
        'accept*': { value: accept }
      })
    })
  }
  return links
}
