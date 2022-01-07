import { Query } from 'express-serve-static-core'

/**
 * @param hasMore
 * @param pageInt
 * @param page
 * @param collectionPath
 * @param otherParameters
 */
export function buildFirstLink(
  hasMore: boolean,
  page: number,
  collectionPath: string,
  otherParameters: Query
) {
  if (page > 0 || hasMore) {
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
  } else {
    return []
  }
}
