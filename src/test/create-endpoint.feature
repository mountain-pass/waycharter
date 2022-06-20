Feature: Create Endpoint

    So that I can create a HATEOAS API
    As a developer
    I want to be able to expose linked resources

    Scenario: Create Simple Endpoint
        When we create a simple WayCharter endpoint
        And we send a request to that endpoint
        Then we will get a successful response
        And the response will have a 'self' operation
        And the 'self' operation will return the same response


    Scenario: Create Endpoint with body
        When we create a WayCharter endpoint returning the body
            """
            {
                "hello": "world"
            }
            """
        And we send a request to that endpoint
        Then we will get a successful response
        And the response will contain the body
            """
            {
                "hello": "world"
            }
            """

    Scenario: Create Static Endpoint with body
        When we create a static WayCharter endpoint returning the body
            """
            {
                "hello": "world"
            }
            """
        And we send a request to that endpoint
        Then we will get a successful response
        And the response will contain the body
            """
            {
                "hello": "world"
            }
            """
