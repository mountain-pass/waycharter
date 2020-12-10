
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
        ]
      }
    }
  }
}
    ```

@wip
  Scenario: Convert single top level API with different methods (check METHOD ordering is alphabetical)
    Given API metadata
    ```
    [
      {
        method: 'post',
        path: '/hello'
      },
      {
        method: 'get',
        path: '/hello'
      },
      {
        method: 'use',
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
      "connect": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "delete": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "get": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "head": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "options": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "patch": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "post": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "put": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "trace": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      }
    }
  }
}
    ```
    Then converted to OpenAPI JSON Text should be
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
      "connect": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "delete": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "get": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "head": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "options": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "patch": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "post": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "put": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      },
      "trace": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
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
        ]
      },
      "post": {
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        },
        "tags": [
          "all"
        ]
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
        ]
      }
    }
  }
}
    ```

  Scenario: Convert multiple nested APIs with Array Path (check PATH ordering is alphabetical)
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
                path: ['/list2', '/list1']
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
        ]
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
        ]
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
        ]
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
        ]
      }
    }
  }
}
    ```
    Then converted to OpenAPI JSON Text should be
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
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      }
    },
    "/hello1/languages/list2": {
      "get": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      }
    },
    "/hello2/languages/list1": {
      "get": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
      }
    },
    "/hello2/languages/list2": {
      "get": {
        "tags": [
          "all"
        ],
        "responses": {
          "200": {
            "description": "The action was successful."
          }
        }
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
    | info | { "description": "No description", "title": "No title", "version": "No version" } |
    | contact | { name: "Nick", email: "nick@foo.com" } |
    | externalDocs | { description: "Company website", url: "https://www.mountain-pass.com.au" } |
    Then the OpenAPI JSON should be
    ```
{
  "openapi": "3.0.0",
  "info": {
    "description": "No description",
    "title": "No title",
    "version": "No version"
  },
  "contact": {
    "email": "nick@foo.com",
    "name": "Nick"
  },
  "externalDocs": {
    "description": "Company website",
    "url": "https://www.mountain-pass.com.au"
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
