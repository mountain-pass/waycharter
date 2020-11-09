const { wrapExpressV4, Metadata } = require('@mountainpass/waycharter')
const express = wrapExpressV4(require('express'))
const swaggerUi = require('swagger-ui-express')

const app = express()

// simple route
const statusMeta = new Metadata({
  summary: 'Provides an indication of the current system status.',
  tags: ['operations']
})
app.get('/api/status', (req, res) => res.json({ status: 'up' }), statusMeta)

// multi-path route
app.get(['/one', '/two', '/three'], (req, res) => res.json({ status: 'up' }))

// sub-routes
const resourceMetadata = new Metadata({ tags: ['someResource'] })
const resourceRouter = express.Router()
resourceRouter.get(resourceMetadata, '/list', (req, res) => res.json({ data: [{ foo: 'bar' }] }))
resourceRouter.get(resourceMetadata, '/:id', (req, res) => res.json({ foo: 'bar' }))
resourceRouter.post(resourceMetadata, '/', (req, res) => res.json({ foo: 'bar' }))
resourceRouter.put(resourceMetadata, '/:id', (req, res) => res.json({ foo: 'bar' }))
resourceRouter.delete(resourceMetadata, '/:id', (req, res) => res.json({ foo: 'bar' }))
app.use('/some/resource', resourceRouter)

// generate openapi
const openApiDoc = app._waycharter.toOpenApiV3({
  title: 'Example Project API',
  version: '1.0.0',
  description: 'An example of using **waycharter** with an express application.',
  contact: {
    name: 'Nick',
    email: 'info@mountain-pass.com.au'
  }
})

// serve it using swagger
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(openApiDoc))

// run the application
app.listen(3000, () => console.log('App listening on: http://localhost:3000'))
