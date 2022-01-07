
Feature: Errors

    So that a correct error response is sent to clients
    As a developer
    I want loader exceptions to be caught and a 500 response sent

    Scenario: Internal Server Error
        Given a waycharter endpoint that throws exceptions
        When we try to load that resource instance
        Then a 500 response will be received

    Scenario: Instance not found
        Given a waycharter endpoint type accessed by 'id'
        And an instance of that type with the 'id' 'alpha'
        When we try to load the resource with the 'id' 'bravo'
        Then a 404 response will be received

