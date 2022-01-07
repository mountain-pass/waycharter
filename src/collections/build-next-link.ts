import { Query } from 'express-serve-static-core'

/**
 * @param hasMore
 * @param page
 * @param collectionPath
 * @param otherParameters
 */
export function buildNextLink(
  hasMore: boolean,
  page: number,
  collectionPath: string,
  otherParameters: Query
) {
  return hasMore
    ? [
      {
        rel: 'next',
        uri: `${collectionPath}?${new URLSearchParams({
          page: (page + 1).toFixed(),
          ...otherParameters
        }).toString()}`
      }
    ]
    : []
}
