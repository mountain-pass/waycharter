const flattenApis = require('../utils/flatten-apis')

const DEFAULT_RESPONSES = {
  200: {
    description: 'The action was successful.'
  }
}

/**
 * Generates Swagger Json from an API metadata object.
 *
 * @param {*} swaggerConfig
 * @param {*} apisMetadata
 */
module.exports = (swaggerConfig, apisMetadata) => {
  const {
    title = 'No title',
    version = 'No version',
    description = 'No description',
    contact: { name: contactName, email: contactEmail } = {},
    externalDocs: { description: linkDescription, url: linkUrl } = {}
  } = swaggerConfig

  const apis = {}

  const flatApis = flattenApis(apisMetadata)
  flatApis.forEach((api) => {
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
      title,
      version,
      description
    },
    paths: apis
  }

  if (contactName && contactEmail) openapi.info.contact = { name: contactName, email: contactEmail }
  if (linkDescription && linkUrl) openapi.externalDocs = { description: linkDescription, url: linkUrl }

  return openapi
}
