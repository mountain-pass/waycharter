
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

    Scenario: Create Non-Singleton
        Given a resource instance that's a singleton waycharter resource type
        And a waycharter resource type accessed by 'id'
        And an instance of that type with the 'id' 'alpha'
        And the singleton has a 'related' link to that instance
        When we load the singleton
        And we invoke the 'related' operation
        Then it will have a 'self' operation
        And the 'self' operation will return the same resource instance
