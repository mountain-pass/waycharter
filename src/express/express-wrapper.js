const mock = require('mock-require')
const { wrapFunction } = require('./utils/function-wrapper')
const Metadata = require('./classes/Metadata')

const ROUTER_FUNCTIONS = ['use', 'options', 'patch', 'head', 'put', 'delete', 'get', 'post']

// lets proxy some routers!

const proxyRouterConfig = {
  get: function (target, prop, receiver) {
    const result = Reflect.get(...arguments)

    // if function on app/router invoked, wrap it and capture arguments (i.e. path)
    if (~ROUTER_FUNCTIONS.indexOf(prop) && typeof result === 'function') {
      return wrapFunction(result, {
        doBefore: (args) => {
          const newArgs = args
          const meta = {}

          // if any args are a "Metadata" object, then copy metadata, and strip from args
          const metadataIndex = args.findIndex((arg) => arg instanceof Metadata)
          if (~metadataIndex) {
            Object.assign(meta, args[metadataIndex].metadata)
            newArgs.splice(metadataIndex, 1)
          }

          // if any args have "waycharter" markup, then copy into 'children'
          const router = args.find((arg) => arg._waycharter)
          if (router) meta.children = router._waycharter.apis

          // if first parameter is a "http path" string or array...
          if ((typeof args[0] === 'string' && args[0] !== 'query parser fn') || Array.isArray(args[0])) {
            meta.method = prop
            meta.path = args[0]
          }

          // finally, store metadata (if populated)
          if (Object.keys(meta).length > 0) receiver._waycharter.apis.push(meta)

          return newArgs
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
