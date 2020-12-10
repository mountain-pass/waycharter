const flattenApis = require('../common/utils/flatten-apis')

const DEFAULT_RESPONSES = {
  200: {
    description: 'The action was successful.'
  }
}

/**
 * Generates OpenAPI Json from an API metadata object.
 *
 * @param {*} openApiConfig
 * @param {*} apisMetadata
 */
module.exports = (openApiRootConfig, apisMetadata) => {
  let apis = {}

  // convert to openapi format...
  const flatApis = flattenApis(apisMetadata)
  flatApis.forEach((api) => {
    /* istanbul ignore next */
    const { method = '-', path = '-', tags = [], summary } = api
    const apidoc = {
      tags: tags.length > 0 ? tags : ['all'],
      responses: DEFAULT_RESPONSES
    }
    if (summary) apidoc.summary = summary

    // add paths
    if (typeof apis[path] === 'undefined') {
      // (new)
      apis[path] = {
        [method]: apidoc
      }
    } else {
      // (existing)
      apis[path][method] = apidoc
    }
  })

  Object.keys(apis).forEach((k) => {
    // sort by method
    apis[k] = Object.fromEntries(Object.entries(apis[k]).sort())
  })
  // sort by path
  apis = Object.fromEntries(Object.entries(apis).sort())

  const openapi = {
    openapi: '3.0.0',
    info: {
      title: 'No title',
      version: 'No version',
      description: 'No description'
    },
    paths: apis,
    ...openApiRootConfig
  }

  return openapi
}
