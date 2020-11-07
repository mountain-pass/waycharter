
@UseExpress
Feature: Simple Route Metadata
  As an API maintainer
  I want to automatically generate processable metadata from my API endpoints
  So that API consumers can discover APIs in their preferred format

  Scenario: Simple route
    Given the route "get" "/hello/world"
    Then the metadata routes should be
    | method | path         | name | description | contentType | urlParams | queryParams | body | returns |
    | get    | /hello/world |      |             |             |           |             |      |         |

 