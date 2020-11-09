module.exports = (app) => {
  app.toOpenApiV3 = (openApiConfig = null) => {
    if (openApiConfig === null) throw new Error('Please provide OpenAPI configuration parameter.')
    // N.B. lazy load when required...
    return require('../openapi-converter/metadata-to-openapi-v3')(openApiConfig, app.apis)
  }
}
