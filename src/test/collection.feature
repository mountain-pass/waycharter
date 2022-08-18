
Feature: Collection

    Scenario: Empty Collection
        Given a waycharter endpoint that's an empty collection
        When we load the collection
        Then an empty collection will be returned

    Scenario: Collection with one item
        Given a waycharter endpoint that's a collection with 1 item
        When we load the collection
        Then an collection with 1 item will be returned

    Scenario: Collection with one item - fetch item
        Given a waycharter endpoint that's a collection with 1 item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        Then that item summary will be returned

    Scenario: Collection with many items
        Given a waycharter endpoint that's a collection with 16 items
        When we load the collection
        Then an collection with 16 items will be returned

    Scenario: Collection with many items - fetch nth item
        Given a waycharter endpoint that's a collection with 16 item
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th item summary will be returned

    Scenario: Collection with many many many many many items - fetch nth item
        Given a waycharter endpoint that's a collection with 524288 item
        When we load the collection
        And we invoke the 'item' operation for the 1986th item
        Then the 1986th item summary will be returned

    Scenario: Collection with many many items
        Given a waycharter endpoint that's a collection with 1000 items and a page size of 16
        When we load the collection
        Then the first 16 item summaries of the collection will be returned
        And it will have a 'next' operation
        And it will have a 'first' operation
        But it won't have a 'prev' operation


    Scenario: Collection with many many items - page 2
        Given a waycharter endpoint that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        Then the next 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        And it will have a 'prev' operation

    Scenario: Collection with many many items - page 2 item 6
        Given a waycharter endpoint that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'item' operation for the 4th item
        Then the 20th item summary will be returned

    Scenario: Collection with many many items - page 3
        Given a waycharter endpoint that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'next' operation
        Then the next next 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        And it will have a 'prev' operation

    Scenario: Collection with many many items - last page
        Given a waycharter endpoint that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation until we reach the last page
        Then the last 8 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'prev' operation
        But it won't have a 'next' operation


    Scenario: Collection with many many items - next page then first page
        Given a waycharter endpoint that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'first' operation
        Then the first 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation

    Scenario: Templated collection with many many items - next page then first page
        Given a waycharter endpoint that's a collection templated with the parameter "collectionName" with 100 items and a page size of 16
        When we load the collection with "collectionName" of "test"
        And we invoke the 'next' operation
        And we invoke the 'first' operation
        Then the first 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation


    Scenario: Collection with many many items - next page then prev page
        Given a waycharter endpoint that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'prev' operation
        Then the first 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation

    Scenario: Collection with many items - fetch nth item and get unabridged
        Given a waycharter endpoint that's a collection with 16 item
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        And we invoke the 'canonical' operation
        Then the 6th unabridged item will be returned

    Scenario: Collection with single item - items in root
        Given a waycharter endpoint that's a collection with 1 item without any wrapper
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        Then that item summary will be returned

    Scenario: Collection with many items - items in root
        Given a waycharter endpoint that's a collection with 16 items without any wrapper
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th item summary will be returned

    Scenario: Collection with many items - paginate items in root
        Given a waycharter endpoint that's a collection with 30 items without any wrapper and a page size of 16
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th item summary will be returned

    Scenario: Collection with many items - items not independently retrievable
        Given a waycharter endpoint that's a collection with 16 items that aren't independently retrievable
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th unabridged item will be returned

    Scenario: Static Collection - Empty
        Given a waycharter endpoint that's an empty static collection
        When we load the collection
        Then an empty collection will be returned

    Scenario: Static Collection with one item
        Given a waycharter endpoint that's a static collection with 1 item
        When we load the collection
        Then an collection with 1 item will be returned

    Scenario: Static  Collection with one item - fetch item
        Given a waycharter endpoint that's a static collection with 1 item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        Then that unabridged item will be returned
        And it won't have a 'canonical' operation

    Scenario: Static  Collection with many items
        Given a waycharter endpoint that's a static collection with 16 items
        When we load the collection
        Then an collection with 16 items will be returned

    Scenario: Static Collection with many items - fetch nth item
        Given a waycharter endpoint that's a static collection with 16 items
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th unabridged item will be returned
        And it won't have a 'canonical' operation

    # Scenario: Static Collection with many many items
    #     Given a waycharter endpoint that's a static collection with 1000 items and a page size of 16
    #     When we load the collection
    #     Then the first 16 unabridged items of the collection will be returned
    #     And it will have a 'next' operation
    #     And it will have a 'first' operation
    #     But it won't have a 'prev' operation



    Scenario: Static Collection with headers
        Given a waycharter endpoint that's a static collection with 16 items and the following headers
            | x-testing | foobar |
        When we load the collection
        Then the response will include the following header
            | x-testing | foobar |



    # Scenario: Static Collection with many many items - page 2
    #     Given a waycharter endpoint that's a static collection with 1000 items and a page size of 16
    #     When we load the collection
    #     And we invoke the 'next' operation
    #     Then the next 16 unabridged items of the collection will be returned
    #     And it will have a 'first' operation
    #     And it will have a 'next' operation
    #     And it will have a 'prev' operation

    # Scenario: Static Collection with many many items - page 2 item 6
    #     Given a waycharter endpoint that's a static collection with 1000 items and a page size of 16
    #     When we load the collection
    #     And we invoke the 'next' operation
    #     And we invoke the 'item' operation for the 4th item
    #     Then the 20th unabridged item will be returned
    #     And it won't have a 'canonical' operation

    # Scenario: Static Collection with many many items - page 3
    #     Given a waycharter endpoint that's a static collection with 1000 items and a page size of 16
    #     When we load the collection
    #     And we invoke the 'next' operation
    #     And we invoke the 'next' operation
    #     Then the next next 16 unabridged items of the collection will be returned
    #     And it will have a 'first' operation
    #     And it will have a 'next' operation
    #     And it will have a 'prev' operation

    # Scenario: Static Collection with many many items - last page
    #     Given a waycharter endpoint that's a static collection with 1000 items and a page size of 16
    #     When we load the collection
    #     And we invoke the 'next' operation until we reach the last page
    #     Then the last 8 unabridged items of the collection will be returned
    #     And it will have a 'first' operation
    #     And it will have a 'prev' operation
    #     But it won't have a 'next' operation


    # Scenario: Static Collection with many many items - next page then first page
    #     Given a waycharter endpoint that's a static collection with 1000 items and a page size of 16
    #     When we load the collection
    #     And we invoke the 'next' operation
    #     And we invoke the 'first' operation
    #     Then the first 16 unabridged items of the collection will be returned
    #     And it will have a 'first' operation
    #     And it will have a 'next' operation
    #     But it won't have a 'prev' operation

    # Scenario: Static Collection with many many items - next page then prev page
    #     Given a waycharter endpoint that's a static collection with 1000 items and a page size of 16
    #     When we load the collection
    #     And we invoke the 'next' operation
    #     And we invoke the 'prev' operation
    #     Then the first 16 unabridged items of the collection will be returned
    #     And it will have a 'first' operation
    #     And it will have a 'next' operation
    #     But it won't have a 'prev' operation


    Scenario: Static Collection with many items - items in root
        Given a waycharter endpoint that's a static collection with 16 items with a wrapper
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th unabridged item will be returned
        And it won't have a 'canonical' operation

    Scenario: Collection - dodgy page #
        Given a waycharter endpoint that's a collection with 100 items and a page size of 16
        When we load page "invalid" of the collection
        Then a 400 bad request will be returned



    Scenario: Collection - filter operation
        Given a collection of 10 items with a 'https://waychaser.io/rel/search' filter
        When we load the collection
        And it will have a 'https://waychaser.io/rel/search' operation

    Scenario: Collection - filterable
        Given a collection of 10 items with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value | itemsRemoved |
            | query     | alpha | 5            |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha |
        Then a collection with 5 items will be returned

    Scenario: Collection - filterable
        Given a collection of 10 items with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value | itemsRemoved |
            | query     | alpha | 5            |
            | query     | bravo | 2            |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | bravo |
        Then a collection with 8 items will be returned

    Scenario: Collection - dual filterable
        Given a collection of 10 items with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value     | itemsRemoved |
            | query     | alpha     | 5            |
            | when      | yesterday | 2            |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha     |
            | when  | yesterday |
        Then a collection with 3 items will be returned

    Scenario: Paged Collection - filterable
        Given a collection of 30 items with a page size of 16 and with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value | itemsRemoved |
            | query     | alpha | 10           |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha |
        Then a collection with 16 items will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation

    Scenario: Paged Collection - filterable and pageable
        Given a collection of 30 items with a page size of 16 and with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value | itemsRemoved |
            | query     | alpha | 10           |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha |
        And we invoke the 'next' operation
        Then a collection with 4 items will be returned
        And it will have a 'first' operation
        And it will have a 'prev' operation
        But it won't have a 'next' operation


    Scenario Outline: Paged Collection - filterable and pageable
        Given a collection of 30 items with a page size of 16 and with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value | itemsRemoved |
            | query     | alpha | 10           |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha |
        And we invoke the 'next' operation
        And we invoke the '<REL>' operation
        Then a collection with 16 items will be returned

        Examples:
            | REL   |
            | first |
            | prev  |

    Scenario: Collection - dual filterable
        Given a collection of 30 items with a page size of 16 and with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value     | itemsRemoved |
            | query     | alpha     | 6            |
            | when      | yesterday | 4            |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha     |
            | when  | yesterday |
        And we invoke the 'next' operation
        Then a collection with 4 items will be returned
        And it will have a 'first' operation
        And it will have a 'prev' operation
        But it won't have a 'next' operation


    Scenario Outline: Paged Collection - dual filterable and pageable
        Given a collection of 30 items with a page size of 16 and with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value     | itemsRemoved |
            | query     | alpha     | 6            |
            | when      | yesterday | 4            |
        When we load the collection
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha     |
            | when  | yesterday |
        And we invoke the 'next' operation
        And we invoke the '<REL>' operation
        Then a collection with 16 items will be returned

        Examples:
            | REL   |
            | first |
            | prev  |

    Scenario: Collection with headers
        Given a collection of 30 items and following headers
            | x-testing | foobar |
        When we load the collection
        Then the response will include the following header
            | x-testing | foobar |

    Scenario: Collection with item headers
        Given a collection of 30 items and following item headers
            | x-testing | foobar |
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        And we invoke the 'canonical' operation
        Then the response will include the following header
            | x-testing | foobar |

    Scenario: Link To Collection
        Given a waycharter endpoint that's a static collection with 16 items
        And a singleton that has a 'related' link to that collection
        When we load the latter singleton
        And we invoke the 'related' operation
        Then a collection with 16 items will be returned

    Scenario: Link To Collection Filter
        Given a collection of 10 items with a 'https://waychaser.io/rel/search' filter with the following parameters
            | parameter | value | itemsRemoved |
            | query     | alpha | 5            |
        And a singleton that has a link to that collection's "https://waychaser.io/rel/search" filter
        When we load the latter singleton
        And we invoke the 'https://waychaser.io/rel/search' operation with
            | query | alpha |
        Then a collection with 5 items will be returned

    Scenario: Explicit collections - array
        Given the following collection with items at "/{index}"
            """
            [
                {
                    "id": "1",
                    "name": "alpha"
                },
                {
                    "id": "2",
                    "name": "bravo"
                },
                {
                    "id": "3",
                    "name": "charlie"
                }
            ]
            """
        When we load the collection
        And we load all the "item" operations
        Then 3 items will be returned

    @wip
    Scenario: Explicit collections - array with canonical items
        Given a waycharter endpoint at "/api/item/:item" that varies its response as follows
            | item | body                           |
            | 0    | {"id": "0", "name": "alpha"}   |
            | 1    | {"id": "1", "name": "bravo"}   |
            | 2    | {"id": "2", "name": "charlie"} |
        And the following collection that canonically links to the above endpoint with items at "/{item}"
            """
            [
                "a",
                "b",
                "c"
            ]
            """
        When we load the collection
        And we load all the "item" operations
        And for each item we invoke the "canonical" operation
        Then 3 items will be returned
        And the 2nd item will be
            """
            {
                "id": "1",
                "name": "bravo"
            }
            """

    @wip
    Scenario: Explicit collections - map
        Given the following collection with items at "/{index}"
            """
            {
                "a": {
                    "id": "1",
                    "name": "alpha"
                },
                "b": {
                    "id": "2",
                    "name": "bravo"
                },
                "c": {
                    "id": "3",
                    "name": "charlie"
                }
            }
            """
        When we load the collection
        And we load all the "item" operations
        Then 3 items will be returned

    @wip
    Scenario: Explicit collections - map with canonical items
        Given a waycharter endpoint at "/api/item/:item" that varies its response as follows
            | item | body                           |
            | a    | {"id": "0", "name": "alpha"}   |
            | b    | {"id": "1", "name": "bravo"}   |
            | c    | {"id": "2", "name": "charlie"} |
        And the following collection that canonically links to the above endpoint with items at "/{item}"
            """
            {
                "a": {
                    "id": "1",
                    "name": "alpha"
                },
                "b": {
                    "id": "2",
                    "name": "bravo"
                },
                "c": {
                    "id": "3",
                    "name": "charlie"
                }
            }
            """
        When we load the collection
        And we load all the "item" operations
        And for each item we invoke the "canonical" operation
        Then 3 items will be returned
        And the 2nd item will be
            """
            {
                "id": "1",
                "name": "bravo"
            }
            """