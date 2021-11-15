/**
 * @param hasMore
 * @param pageInt
 * @param collectionPath
 * @param otherParameters
 */
export function buildNextLink (
  hasMore,
  pageInt,
  collectionPath,
  otherParameters
) {
  return hasMore
    ? [
        {
          rel: 'next',
          uri: `${collectionPath}?${new URLSearchParams({
            page: pageInt + 1,
            ...otherParameters
          }).toString()}`
        }
      ]
    : []
}
