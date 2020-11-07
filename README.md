# waycharter

Server library for level 3 RESTful APIs

# Strategy

> As an API maintainer,
> I want to automatically generate processable metadata from my API endpoints,
> So that API consumers can explore APIs in their preferred format

- Automatically - because we should have "living" metadata, with minimal human maintenance
- Processable - readable by a machine
- Consumers - could be human or machines

# Rationale

Given an APIs metadata we could:

- generate documentation (e.g. swagger)
- expose metadata via custom API endpoints (e.g. waychaser)
- generate API client code (ooh... really?)

# Usage -> Express (Proposed)

```javascript
const { wrap } = require('@mountainpass/waycharter')

// simply wrap express, then use it as you would normally
const express = wrap(require('express'))
const app = express()
app.get('/api/hello', (req, res) => res.json((message: 'Hello world')))

// the api metadata will be available on the app
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

## Functional -> Express

- [x] setup express wrapper (using proxies)
- [x] support sub-routes
- [ ] support adding metadata via a "Metddata" object passed in the route parameters
