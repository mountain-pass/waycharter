/**
 * @param pageInt
 * @param collectionPath
 * @param otherParameters
 */
export function buildPreviousLink (pageInt, collectionPath, otherParameters) {
  if (pageInt === 1) {
    return Object.keys(otherParameters).length > 0
      ? [
          {
            rel: 'prev',
            uri: `${collectionPath}?${new URLSearchParams({
              ...otherParameters
            }).toString()}`
          }
        ]
      : [
          {
            rel: 'prev',
            uri: collectionPath
          }
        ]
  } else if (pageInt > 1) {
    return [
      {
        rel: 'prev',
        uri: `${collectionPath}?${new URLSearchParams({
          page: pageInt - 1,
          ...otherParameters
        }).toString()}`
      }
    ]
  } else {
    return []
  }
}
