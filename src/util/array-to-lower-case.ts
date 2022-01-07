/**
 * @param array
 */
export function arrayToLowerCase (array: readonly string[]): string[] {
  return array ? array.map(value => value.toLowerCase()) : undefined
}
