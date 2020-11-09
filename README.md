# waycharter

Server library for level 3 RESTful APIs

# Support

| Framework | Versions         |
| --------- | ---------------- |
| NodeJS    | 10.x, 12.x, 14.x |
| Express   | 4.x              |
| OpenAPI   | 3.0.0            |

# Strategy / Goals

> As an API maintainer,
> I want to automatically generate processable metadata from my API endpoints,
> So that API consumers can explore APIs in their preferred format

- Automatic - should have "living" metadata, with minimal human maintenance
- Non-Invasive - should work with existing code bases
- Consumable - should support humans and machines

# Rationale

Given API metadata we could:

- generate documentation (e.g. openapi / swagger)
- expose metadata via custom API endpoints (e.g. waychaser)
- generate API client code (e.g. postman, axios, curl)

# Example Usage

## Example Projects

- [examples/express-and-swagger](examples/express-and-swagger)

## TLDR

```javascript
const { wrapExpressV4, Metadata } = require('@mountainpass/waycharter')

// simply wrap express, then use it as you would normally
const express = wrapExpressV4(require('express'))

// your existing apis...
const app = express()
app.get('/api/hello1', (req, res) => res.json({ message: 'Hello world' }))

// or perhaps with metadata...
app.get(
  new Metadata({ summary: 'Hello World', version: '2', author: 'Nick <nick@foo.bar>', tags: ['awesome'] }),
  '/api/hello2',
  (req, res) => res.json({ message: 'Hello world' })
)

// finally, the api metadata will be available on the app
console.log(app._waycharter.apis)

// or available as OpenApi v3
console.log(app._waycharter.toOpenApiV3())
```

# TODO

## Scaffolding

- [x] setup project
- [x] setup automated build
- [x] setup test framework
- [x] setup example project
- [ ] publish to npm repo

## Functional

### ~~Sources -> Express~~ :white_check_mark:

- [x] setup express wrapper (using proxies)
- [x] support sub-routes
- [x] support adding metadata via a "Metadata" object(/class) passed in the route parameters

### ~~Transformers -> OpenAPI v3~~ :white_check_mark:

_N.B. compatible with Swagger_

- [x] convert API metadata to OpenAPI v3 json

## Questions

- [ ] consider what serverless usage would look like
- [ ] consider how operations on resources would look like
- [x] npm -> should we minify? -> No, not really required for server side
