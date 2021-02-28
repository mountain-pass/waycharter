import { Router } from 'express'
import LinkHeader from 'http-link-header'
import { URI } from 'uri-template-lite'
import { routerToRfc6570 } from 'router-uri-convert'

export class WayCharter {
  constructor () {
    this.router = Router()
  }

  createType ({ path, loader }) {
    const uriTemplate = routerToRfc6570(path)
    const pathExpander = parameters => URI.expand(uriTemplate, parameters)
    this.router.get(path, async function (request, response, next) {
      const links = new LinkHeader()
      links.set({
        rel: 'self',
        uri: pathExpander(request.params)
      })
      const resource = await loader(request.params)
      for (const link of resource.links || []) {
        links.set(link)
      }
      response.header('link', links.toString())
      response.json(resource.body)
    })
    return {
      path: parameters => {
        const expanded = pathExpander(parameters)
        return expanded
      }
    }
  }
}
