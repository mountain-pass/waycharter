
@UseExpress
Feature: Common Functions

  As the author of this library
  I want to make sure my core utils work as expected
  So that I can fry bigger fish with confidence

  Scenario: Flatten - complex structure
    Given API metadata
    ```
    [
      {
        method: 'get',
        path: '/hello1'
      },
      {
        method: 'use',
        path: ['/hello2', '/hello3'],
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
          },
          {
            method: 'patch',
            path: '/update'
          }
        ]
      }
    ]
    ```
    Then the flattened JSON should be
    ```
    [
      {
        method: 'get',
        path: '/hello1'
      },
      {
        method: 'get',
        path: '/hello2/languages/list1'
      },
      {
        method: 'get',
        path: '/hello2/languages/list2'
      },
      {
        method: 'patch',
        path: '/hello2/update'
      },
      {
        method: 'get',
        path: '/hello3/languages/list1'
      },
      {
        method: 'get',
        path: '/hello3/languages/list2'
      },
      {
        method: 'patch',
        path: '/hello3/update'
      }
    ]
    ```

  Scenario: Flatten - complex structure with inherited properties
    Given API metadata
    ```
    [
      {
        method: 'get',
        path: '/hello1'
      },
      {
        method: 'use',
        path: ['/hello2', '/hello3'],
        tags: ['welcome'],
        children: [
          {
            method: 'use',
            path: '/languages',
            children: [
              {
                method: 'get',
                path: ['/list1', '/list2'],
                tags: ['lang']
              }
            ]
          },
          {
            method: 'patch',
            path: '/update',
            summary: 'This will update the object'
          }
        ]
      }
    ]
    ```
    Then the flattened JSON should be
    ```
    [
      {
        method: 'get',
        path: '/hello1'
      },
      {
        method: 'get',
        path: '/hello2/languages/list1',
        tags: ['lang']
      },
      {
        method: 'get',
        path: '/hello2/languages/list2',
        tags: ['lang']
      },
      {
        method: 'patch',
        path: '/hello2/update',
        summary: 'This will update the object',
        tags: ['welcome'],
      },
      {
        method: 'get',
        path: '/hello3/languages/list1',
        tags: ['lang']
      },
      {
        method: 'get',
        path: '/hello3/languages/list2',
        tags: ['lang']
      },
      {
        method: 'patch',
        path: '/hello3/update',
        summary: 'This will update the object',
        tags: ['welcome'],
      }
    ]
    ```