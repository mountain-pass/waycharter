/**
 * @param hasMore
 * @param pageInt
 * @param collectionPath
 * @param otherParameters
 */
export function buildFirstLink (
  hasMore,
  pageInt,
  collectionPath,
  otherParameters
) {
  if (pageInt > 0 || hasMore) {
    return Object.keys(otherParameters).length > 0
      ? [
          {
            rel: 'first',
            uri: `${collectionPath}?${new URLSearchParams({
              ...otherParameters
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
