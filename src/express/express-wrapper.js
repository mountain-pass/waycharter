const mock = require('mock-require')
const { wrapFunction } = require('./function-wrapper')

const ROUTER_FUNCTIONS = ['use', 'options', 'patch', 'head', 'put', 'delete', 'get', 'post']

const ENDPOINT_METADATA_TEMPLATE = {
  name: '',
  description: '',
  contentType: '',
  urlParams: '',
  queryParams: '',
  body: '',
  returns: '',
  method: '',
  path: ''
}

// lets proxy some routers!

const proxyRouterConfig = {
  get: function (target, prop, receiver) {
    const result = Reflect.get(...arguments)

    // if function on app/router invoked, wrap it and capture arguments (i.e. path)
    if (~ROUTER_FUNCTIONS.indexOf(prop) && typeof result === 'function') {
      return wrapFunction(result, {
        doBefore: (args) => {
          // if first parameter is a "http path"...
          if ((typeof args[0] === 'string' && args[0] !== 'query parser fn') || Array.isArray(args[0])) {
            const meta = {
              ...ENDPOINT_METADATA_TEMPLATE,
              method: prop,
              path: args[0]
            }
            if (Array.isArray(args)) {
              const router = args.find((arg) => arg._waycharter)
              if (router) meta.children = router._waycharter.apis
              // todo check if any args is a "Metadata" object... -> apply metdata
            }
            receiver._waycharter.apis.push(meta)
          }
          return args
        }
      })
    }
    return result
  }
}

// intercept a 'Router()' function, and return our own proxied 'router' instance...
const interceptNewRouter = {
  doAfter: (router) => {
    const proxy = new Proxy(router, proxyRouterConfig)
    proxy._waycharter = { apis: [] }
    return proxy
  }
}

// lets proxy express!

const proxyExpressConfig = {
  get: function (target, prop, receiver) {
    const result = Reflect.get(...arguments)
    if (prop === 'Router' && typeof result === 'function') {
      // intercept the Router function, and return our own proxied 'router' instance...
      return wrapFunction(result, interceptNewRouter)
    }
    return result
  }
}

/**
 * Intercepts all methods for initialising services.
 *
 * @param {*} express
 */
const wrap = (express) => {
  // intercept the default function, and return our own proxied 'app' instance
  const expressWrapper = wrapFunction(express, interceptNewRouter)

  // intercept property calls, and return our own proxied 'router' instances
  const expressProxy = new Proxy(expressWrapper, proxyExpressConfig)

  // replace `require('express')` imports with our proxy...
  mock('express', expressProxy)

  return expressProxy
}

module.exports = { wrap }
