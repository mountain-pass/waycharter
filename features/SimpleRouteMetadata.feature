
@UseExpress
Feature: Simple Route Metadata

  As an API maintainer
  I want to automatically generate processable metadata from my API endpoints
  So that API consumers can discover APIs in their preferred format

  Scenario: Simple route
    Given the route "get" "/hello/world"
    Then the metadata routes should be
    | method | path         |
    | get    | /hello/world |

  Scenario: Two routes
    Given the route "get" "/hello/world1" 
    Given the route "post" "/hello/world2" 
    Then the metadata routes should be
    | method | path          |
    | get    | /hello/world1 |
    | post   | /hello/world2 |

  Scenario: Simple route with metadata
    Given the route "get" "/hello/world" with metadata
    | opName   | author | version |
    | sayHello | nick   | 1       |
    Then the metadata routes should be
    | method | path         | opName   | author | version |
    | get    | /hello/world | sayHello | nick   | 1       |

  Scenario: Array path route
    Given the route "get" "/hello/world,/bonjour/le/monde,/ahoj/svet"
    Then the metadata json should be
    ```
    [
      {
        method: 'get',
        path: [
          '/hello/world','/bonjour/le/monde','/ahoj/svet'
        ]
      }
    ]
    ```

  Scenario: Sub Routes
    Given the route "use" "/hello" with subroute "get" "/world"
    Then the metadata json should be
    ```
    [
      {
        method: 'use',
        path: '/hello',
        children: [
          {
            method: 'get',
            path: '/world'
          }
        ]
      }
    ]
    ```

 