import LinkHeader from 'http-link-header'

/**
 * @param resourceLinks
 * @param requestUrl
 */
export function covertResourceLinks (resourceLinks) {
  const links = new LinkHeader()
  for (const link of resourceLinks) {
    const { parameters: linkParameters, accept, uri, ...other } = link
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
