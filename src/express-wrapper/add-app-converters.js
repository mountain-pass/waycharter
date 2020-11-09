module.exports = (app) => {
  // add openapi v3
  app._waycharter.toOpenApiV3 = (openApiConfig = {}) => {
    const apiMetdata = app._waycharter.apis
    if (apiMetdata === null) throw new Error('No API metadata found.')
    // N.B. lazy load when required...
    const toOpenApiV3 = require('../openapi-converter/metadata-to-openapi-v3')
    return toOpenApiV3(openApiConfig, apiMetdata)
  }

  return app
}
