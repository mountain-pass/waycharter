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
      console.log('setting links')
      links.set({
        rel: 'self',
        uri: request.url
      })
      console.log('loading...')
      const resource = await loader({ ...request.params, ...request.query })
      console.log('setting more links', resource.links)
      for (const link of resource.links || []) {
        links.set(link)
      }
      response.header('link', links.toString())
      console.log('sending', resource.body)
      response.json(resource.body)
    })
    return {
      pathTemplate: uriTemplate,
      path: parameters => {
        const expanded = pathExpander(parameters)
        return expanded
      }
    }
  }
}
