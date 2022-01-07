export type ItemActionMap<V> = {
  POST?: V
  PUT?: V
  PATCH?: V
  CONNECT?: V
}
const itemActionMapDictionary: Required<ItemActionMap<any>> = {
  POST: '',
  PUT: '',
  PATCH: '',
  CONNECT: ''
}

export type ItemActionMethod = keyof ItemActionMap<any>
/**
 * @param maybeItemActionMethod
 */

/**
 * @param maybeItemActionMethod
 */
export function isItemActionMethod (
  maybeItemActionMethod: unknown
): maybeItemActionMethod is ItemActionMethod {
  return (
    typeof maybeItemActionMethod === 'string' &&
    Object.prototype.hasOwnProperty.call(
      itemActionMapDictionary,
      maybeItemActionMethod
    )
  )
}

export type ActionMap<V> = ItemActionMap<V> & {
  DELETE?: V
  OPTIONS?: V
  TRACE?: V
}
const actionMapDictionary: Required<ActionMap<any>> = {
  POST: '',
  PUT: '',
  DELETE: '',
  PATCH: '',
  OPTIONS: '',
  CONNECT: '',
  TRACE: ''
}

export type ActionMethod = keyof ActionMap<any>
/**
 * @param maybeActionMethod
 */

/**
 * @param maybeActionMethod
 */
export function isActionMethod (
  maybeActionMethod: unknown
): maybeActionMethod is ActionMethod {
  return (
    typeof maybeActionMethod === 'string' &&
    Object.prototype.hasOwnProperty.call(actionMapDictionary, maybeActionMethod)
  )
}

export type Method = ActionMethod | 'GET' | 'HEAD'
