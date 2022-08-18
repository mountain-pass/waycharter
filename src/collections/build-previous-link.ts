import { Query } from 'express-serve-static-core'

/**
 * @param previousPage
 * @param collectionPath
 * @param otherParameters
 */
export function buildPreviousLink(
  previousPage: string | undefined,
  collectionPath: string,
  otherParameters: Query
) {
  return previousPage !== undefined ? [
    {
      rel: 'prev',
      uri: `${collectionPath}?${new URLSearchParams({
        page: previousPage,
        ...otherParameters
      }).toString()}`
    }
  ] : [];
}
