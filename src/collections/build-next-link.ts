import { Query } from 'express-serve-static-core'

/**
 * @param hasMore
 * @param page
 * @param nextPage
 * @param collectionPath
 * @param otherParameters
 */
export function buildNextLink(
  hasMore: boolean,
  page: number | string,
  nextPage: string | undefined,
  collectionPath: string,
  otherParameters: Query
) {
  const nextPageNumber = nextPage ?? typeof page === 'number' ? ((page as number) + 1).toFixed() : undefined
  return hasMore || nextPage !== undefined
    ? [
      {
        rel: 'next',
        uri: `${collectionPath}?${new URLSearchParams({
          page: nextPageNumber,
          ...otherParameters
        }).toString()}`
      }
    ]
    : []
}
