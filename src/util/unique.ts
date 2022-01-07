/**
 * @param array
 */
export function unique<T> (array: Array<T>): Array<T> {
  return [...new Set(array)]
}
