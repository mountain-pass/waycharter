import { Query } from 'express-serve-static-core'

/**
 * @param pageInt
 * @param page
 * @param collectionPath
 * @param otherParameters
 */
export function buildPreviousLink(
  page: number,
  collectionPath: string,
  otherParameters: Query
) {
  if (page === 1) {
    return Object.keys(otherParameters).length > 0
      ? [
        {
          rel: 'prev',
          uri: `${collectionPath}?${new URLSearchParams({
            ...otherParameters as Record<string, string>
          }).toString()}`
        }
      ]
      : [
        {
          rel: 'prev',
          uri: collectionPath
        }
      ]
  } else if (page > 1) {
    return [
      {
        rel: 'prev',
        uri: `${collectionPath}?${new URLSearchParams({
          page: (page - 1).toFixed(),
          ...otherParameters
        }).toString()}`
      }
    ]
  } else {
    return []
  }
}
