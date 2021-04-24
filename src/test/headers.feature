
Feature: Vary By Headers

    So that I can vary my response based on the incoming headers
    As a developer
    I want to be able to access and use the header in the resource loader

    Scenario: Vary By Headers
        Given a waycharter resource that varies its response on headers as follows:
            | Header        | Value | Response |
            | Authorization | 123   | 456      |
            | Authorization | abc   | efg      |
        When we load the resource with the following headers:
            | Authorization | 123 |
        And we load the resource with the following headers:
            | Authorization | abc |
        Then the first response will be "456"
        And it's "vary" header will contain
            | Authorization |
        But the second response will be "efg"
        And it's "vary" header will contain
            | Authorization |
