import { isActionMethod, ActionMethod } from './method'
import { Link } from './link'
import { Action, Actions } from './action'

export type ActionTransformer<ActionResponseBody> = (action: Readonly<Action<ActionResponseBody>>) => Action<ActionResponseBody>

/**
 * @param actions
 * @param uri
 * @param transform
 */
export function toLinks<ActionResponseBody>(
  actions: Actions<ActionResponseBody>,
  uri: string,
  transform?: ActionTransformer<ActionResponseBody>
): Link[] {
  const links = []
  for (const method in actions) {
    if (isActionMethod(method)) {
      const methodActions = actions[method]
      for (const action of methodActions) {
        links.push(toLink(action, uri, method, transform))
      }
    }
  }
  return links
}

/**
 * @param action
 * @param uri
 * @param method
 * @param transform
 */
function toLink<ActionResponseBody>(
  action: Action<ActionResponseBody>,
  uri: string,
  method: ActionMethod,
  transform?: ActionTransformer<ActionResponseBody>
) {
  const { handler, ...other } = transform ? transform(action) : action
  return {
    ...other,
    uri,
    method
  }
}
