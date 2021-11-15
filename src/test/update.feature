Feature: Update

    Scenario: Updatable Resource
        And a resource collection with an "update" item operation that updates an item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        Then it will have a 'update' operation

    Scenario: Updatable Resource
        And a resource collection with an "update" item operation that updates an item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated

    @wip
    Scenario: Updatable Resource
        And a resource collection with an "update" item operation with an object parameter list that updates an item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated

    Scenario: Updatable Resource
        And a resource collection with an "update" "GET" item operation with a "bar" header param that updates an item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation with the header "bar" "ram"
        Then the operation will receive the header "bar" "ram"

    Scenario: Updatable Resource
        And a resource collection of 1 with an "update" item operation that updates an item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated

    Scenario: Updatable Resource
        And a unwrapped resource collection with an "update" item operation that updates an item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated

    Scenario: Updatable Resource
        And a unwrapped resource collection of 1 with an "update" item operation that updates an item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated

    Scenario: Updatable Resource
        And a resource collection with an "update" item operation that updates an item and returns it as a body
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated
        And the update response will be the updated body

    Scenario: Updatable Resource
        And a resource collection with an "update" item operation that updates an item and returns a header
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated
        And the update response have the response header

    Scenario: Updatable Resource
        And a resource collection with an "update" item operation that updates an item and returns a link
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated
        And the update response have the link

    Scenario: Updatable Resource
        And a resource collection with an "update" item operation that updates an item and returns a link template
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then the first item will be updated
        And the update response have the link template

    Scenario: Updatable Resource
        And a resource collection with an "update" item operation that throws an error
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        And we invoke the 'update' operation
        Then a 500 response will be received
