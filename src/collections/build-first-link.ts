import { Query } from 'express-serve-static-core'

/**
 * @param hasMore
 * @param pageInt
 * @param page
 * @param firstPage
 * @param collectionPath
 * @param otherParameters
 */
export function buildFirstLink(
  collectionPath: string,
  otherParameters: Query
) {
  return Object.keys(otherParameters).length > 0
    ? [
      {
        rel: 'first',
        uri: `${collectionPath}?${new URLSearchParams({
          ...otherParameters as Record<string, string>
        }).toString()}`
      }
    ]
    : [
      {
        rel: 'first',
        uri: collectionPath
      }
    ]
}

