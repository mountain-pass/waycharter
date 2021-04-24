
Feature: Errors

    So that a correct error response is sent to clients
    As a developer
    I want loader exceptions to be caught and a 500 response sent

    Scenario: Vary By Headers
        Given a waycharter resource instance that throws exceptions
        When we try to load that resource instance
        Then a 500 response will be received
