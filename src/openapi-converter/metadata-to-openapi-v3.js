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
  const apis = {}

  // convert to openapi format...
  const flatApis = flattenApis(apisMetadata)
  flatApis.forEach((api) => {
    /* istanbul ignore next */
    const { method = '-', path = '-', tags = [], summary = 'No summary' } = api
    const apidoc = {
      tags: tags.length > 0 ? tags : ['all'],
      summary,
      responses: DEFAULT_RESPONSES
    }
    if (typeof apis[path] === 'undefined') {
      apis[path] = {
        [method]: apidoc
      }
    } else {
      apis[path][method] = apidoc
    }
  })

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
