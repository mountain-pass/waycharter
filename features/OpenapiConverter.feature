
Feature: API OpenAPI Transformer

  As an API consumer
  I want API metadata in OpenAPI JSON format
  So I can have use OpenAPI UI for documentation

  Scenario: Convert single top level API
    Given API metadata
    ```
    [
      {
        method: 'get',
        path: '/hello'
      }
    ]
    ```
    Then converted to OpenAPI JSON should be
    ```
{
  "openapi": "3.0.0",
  "info": {
    "title": "No title",
    "version": "No version",
    "description": "No description"
  },
  "paths": {
    "/hello": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    }
  }
}
    ```

  Scenario: Convert single top level API with different methods
    Given API metadata
    ```
    [
      {
        method: 'get',
        path: '/hello'
      },
      {
        method: 'post',
        path: '/hello'
      }
    ]
    ```
    Then converted to OpenAPI JSON should be
    ```
{
  "openapi": "3.0.0",
  "info": {
    "title": "No title",
    "version": "No version",
    "description": "No description"
  },
  "paths": {
    "/hello": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      },
      "post": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    }
  }
}
    ```

  Scenario: Convert multiple nested APIs
    Given API metadata
    ```
    [
      {
        method: 'use',
        path: '/hello',
        children: [
          {
            method: 'post',
            path: '/world'
          },
          {
            method: 'use',
            path: '/languages',
            children: [
              {
                method: 'get',
                path: '/list'
              },
              {
                method: 'post',
                path: '/list'
              }
            ]
          }
        ]
      }
    ]
    ```
    Then converted to OpenAPI JSON should be
    ```
{
  "openapi": "3.0.0",
  "info": {
    "title": "No title",
    "version": "No version",
    "description": "No description"
  },
  "paths": {
    "/hello/languages/list": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      },
      "post": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    },
    "/hello/world": {
      "post": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    }
  }
}
    ```

  Scenario: Convert multiple nested APIs with Array Path
    Given API metadata
    ```
    [
      {
        method: 'use',
        path: ['/hello1', '/hello2'],
        children: [
          {
            method: 'use',
            path: '/languages',
            children: [
              {
                method: 'get',
                path: ['/list1', '/list2']
              }
            ]
          }
        ]
      }
    ]
    ```
    Then converted to OpenAPI JSON should be
    ```
{
  "openapi": "3.0.0",
  "info": {
    "title": "No title",
    "version": "No version",
    "description": "No description"
  },
  "paths": {
    "/hello1/languages/list1": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    },
    "/hello1/languages/list2": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    },
    "/hello2/languages/list1": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    },
    "/hello2/languages/list2": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ],
        "summary": "No summary"
      }
    }
  }
}
    ```

  Scenario: Full OpenAPI Metadata
    Given API metadata
    ```
    [
      {
        method: 'get',
        path: '/hello',
        summary: 'Say hello to the world',
        tags: ['greetings']
      }
    ]
    ```
    When converted to OpenAPI JSON with configuration
    | title | Greetings API |
    | version | 1.0.0 |
    | description | Generates *greeting* messages. |
    | contact | { name: "Nick", email: "nick@foo.com" } |
    | externalDocs | { description: "Company website", url: "https://www.mountain-pass.com.au" } |
    Then the OpenAPI JSON should be
    ```
{
  "openapi": "3.0.0",
  "info": {
    "title": "Greetings API",
    "version": "1.0.0",
    "description": "Generates *greeting* messages.",
    "contact": {
      "name": "Nick",
      "email": "nick@foo.com",
    }
  },
  "externalDocs": {
    "description": "Company website",
    "url": "https://www.mountain-pass.com.au",
  },
  "paths": {
    "/hello": {
      "get": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "greetings"
        ],
        "summary": "Say hello to the world"
      }
    }
  }
}
    ```
