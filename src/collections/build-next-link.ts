import { Query } from 'express-serve-static-core'

/**
 * @param nextPage
 * @param collectionPath
 * @param otherParameters
 */
export function buildNextLink(
  nextPage: string | undefined,
  collectionPath: string,
  otherParameters: Query
) {
  return nextPage !== undefined
    ? [
      {
        rel: 'next',
        uri: `${collectionPath}?${new URLSearchParams({
          page: nextPage,
          ...otherParameters
        }).toString()}`
      }
    ]
    : []
}
