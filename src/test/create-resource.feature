
Feature: Create Resource

    So that I can start to create a HATEOAS API
    As a developer
    I want to be able to expose linked resources

    Scenario: Create Singleton
        Given a resource instance that's a singleton waycharter resource type
        When we load that resource instance
        Then it will have a 'self' operation
        And the 'self' operation will return the same resource instance

    Scenario: Link Singletons
        Given a resource instance that's a singleton waycharter resource type
        And another singleton that has a 'related' link that previous singleton
        When we load the latter singleton
        Then it will have a 'related' operation
        And the 'related' operation will return the previous singleton

    Scenario: Create Non-Singleton
        Given a resource instance that's a singleton waycharter resource type
        And a waycharter resource type accessed by 'id'
        And an instance of that type with the 'id' 'alpha'
        And the singleton has a 'related' link to that instance
        When we load the singleton
        Then it will have a 'related' operation
        And the 'related' operation will return the instance with the 'id' 'alpha'

    Scenario: Create Non-Singleton - self
        Given a resource instance that's a singleton waycharter resource type
        And a waycharter resource type accessed by 'id'
        And an instance of that type with the 'id' 'alpha'
        And the singleton has a 'related' link to that instance
        When we load the singleton
        And we invoke the 'related' operation
        Then it will have a 'self' operation
        And the 'self' operation will return the same resource instance

    Scenario: Empty Collection
        Given a waycharter resource instance that's an empty collection
        When we load the collection
        Then an empty collection will be returned

    Scenario: Collection with one item
        Given a waycharter resource instance that's a collection with 1 item
        When we load the collection
        Then an collection with 1 item will be returned

    Scenario: Collection with one item - fetch item
        Given a waycharter resource instance that's a collection with 1 item
        When we load the collection
        And we invoke the 'item' operation
        Then that item will be returned

    @wip
    Scenario: Collection with many items
        Given a waycharter resource instance that's a collection with 16 items
        When we load the collection
        Then an collection with 16 items will be returned