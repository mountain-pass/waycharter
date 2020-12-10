const { wrapExpressV4, Metadata } = require('@mountainpass/waycharter')
const express = wrapExpressV4(require('express'))

const app = express()

// simple route
const statusMeta = new Metadata({
  summary: 'Provides an indication of the current system status.',
  tags: ['operations']
})
app.use('/api/status', (req, res) => res.json({ status: 'up' }), statusMeta)

// multi-path route
app.get(['/one', '/two', '/three'], (req, res) => res.json({ status: 'up' }))

// sub-routes
const resourceMetadata = new Metadata({ tags: ['someResource'] })

const routes = express.Router()
routes.get(resourceMetadata, '/list', (req, res) => res.json({ data: [{ foo: 'bar' }] }))
routes.get(resourceMetadata, '/:id', (req, res) => res.json({ foo: 'bar' }))
routes.post(resourceMetadata, '/', (req, res) => res.json({ foo: 'bar' }))
routes.put(resourceMetadata, '/:id', (req, res) => res.json({ foo: 'bar' }))
routes.delete(resourceMetadata, '/:id', (req, res) => res.json({ foo: 'bar' }))
app.use('/some/resource', routes)

// serve it using swagger
app._waycharter.serveSwaggerDocs('/api-docs', {
  info: {
    title: 'Example Project API',
    version: '1.0.0',
    description: 'An example of using **waycharter** with an express application.'
  },
  contact: {
    name: 'Nick',
    email: 'info@mountain-pass.com.au'
  }
})

app._waycharter.log()

// redirect root users to the docs
app.use('/', (req, res) => res.redirect(307, '/api-docs'))

// run the application
app.listen(3000, () => console.log('App listening on: http://localhost:3000'))
