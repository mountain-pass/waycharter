import { ActionMap, ItemActionMap } from './method'
import { BaseLink } from './link'
import { ActionHandler } from './handler'


export type Action<ActionResponseBody> = Omit<BaseLink, 'uri' | 'method'> & {
  handler: ActionHandler<ActionResponseBody>
} & Record<string, any>

// export type ActionsGetterParameters<ResponseBody> = Omit<
//   HandlerParameters<ResponseBody>,
//   'response' | 'next'
// >

export type Actions<ActionResponseBody> = ActionMap<Array<Action<ActionResponseBody>>>

export type ItemActions<CanonicalItemActionResponseBody> = ItemActionMap<Array<Action<CanonicalItemActionResponseBody>>>
