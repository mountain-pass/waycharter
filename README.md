# waycharter

Server library for level 3 RESTful APIs

# Support

| Framework | Versions   |
| --------- | ---------- |
| NodeJS    | 10.x, 12.x |
| Express   | 4.x        |
| OpenAPI   | 3.0.0      |

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

# Usage -> Express (Proposed)

```javascript
const { wrap, Metadata } = require('@mountainpass/waycharter')

// simply wrap express, then use it as you would normally
const express = wrap(require('express'))
const app = express()
app.get('/api/hello', (req, res) => res.json({ message: 'Hello world' }))

// or perhaps with metadata...
app.get(
  '/api/hellov2',
  new Metadata({ name: 'Hello World', version: '2', author: 'Nick <nick@foo.bar>' }),
  (req, res) => res.json({ message: 'Hello world' })
)

// finally, the api metadata will be available on the app
console.log(app._waycharter.apis)
```

Example Output

```json
[
  {
    "method": "use",
    "path": "/api",
    "children": [
      {
        "method": "use",
        "path": "/location",
        "children": [
          {
            "method": "get",
            "path": "/lastCheckIn"
          },
          {
            "method": "get",
            "path": "/:id/count"
          },
          ... etc ...
        ]
      }
    ]
  }
]
```

# TODO

## Scaffolding

- [x] setup project
- [x] setup automated build
- [x] setup test framework
- [ ] publish to npm repo

## Functional

### Sources -> Express

- [x] setup express wrapper (using proxies)
- [x] support sub-routes
- [x] support adding metadata via a "Metadata" object(/class) passed in the route parameters

### Transformers -> OpenAPI v3

_N.B. compatible with Swagger_

- [x] convert API metadata to OpenAPI v3 json

## Questions

- [ ] consider what serverless usage would look like
- [ ] consider how operations on resources would look like
- [ ] npm -> should we minify
