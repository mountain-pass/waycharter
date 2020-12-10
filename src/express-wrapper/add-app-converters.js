const toOpenApiV3 = require('../openapi-converter/metadata-to-openapi-v3')
const swaggerUi = require('swagger-ui-express')

/* istanbul ignore next */
module.exports = (app) => {
  /** returns OpenAPI v3 JSON */
  const generateOpenApiV3 = (openApiConfig = {}) => {
    const apiMetdata = app._waycharter.apis
    if (apiMetdata === null) throw new Error('No API metadata found.')
    return toOpenApiV3(openApiConfig, apiMetdata)
  }

  app._waycharter.toOpenApiV3 = generateOpenApiV3

  /** Serves the Swagger docs under the given endpoint. */
  app._waycharter.serveSwaggerDocs = (urlPath = '/api-docs', openApiConfig = {}) => {
    app.use(urlPath, swaggerUi.serve)
    app.get(urlPath, swaggerUi.setup(generateOpenApiV3(openApiConfig)))
  }

  /** Dumps Metadata to Console. */
  // eslint-disable-next-line no-console
  app._waycharter.log = () => console.log(app._waycharter.apis)

  return app
}
