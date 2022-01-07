import { Method } from './method'

export type BaseLink = {
  rel: string
  uri: string
  anchor?: string
  hreflang?: string
  media?: string
  title?: string
  'title*'?: string
  type?: string
  parameters?:
    | Array<string>
    | {
        [key: string]: {}
      }
  accept?: Array<string>
  method?: Method
}

export type Link = BaseLink & Record<string, any>
