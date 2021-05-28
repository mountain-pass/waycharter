
Feature: Collection

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
        And we invoke the 'item' operation for the 1st item
        Then that item summary will be returned

    Scenario: Collection with many items
        Given a waycharter resource instance that's a collection with 16 items
        When we load the collection
        Then an collection with 16 items will be returned

    Scenario: Collection with many items - fetch nth item
        Given a waycharter resource instance that's a collection with 16 item
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th item summary will be returned

    Scenario: Collection with many many many many many items - fetch nth item
        Given a waycharter resource instance that's a collection with 524288 item
        When we load the collection
        And we invoke the 'item' operation for the 1986th item
        Then the 1986th item summary will be returned

    Scenario: Collection with many many items
        Given a waycharter resource instance that's a collection with 1000 items and a page size of 16
        When we load the collection
        Then the first 16 item summaries of the collection will be returned
        And it will have a 'next' operation
        And it will have a 'first' operation
        But it won't have a 'prev' operation


    Scenario: Collection with many many items - page 2
        Given a waycharter resource instance that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        Then the next 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        And it will have a 'prev' operation

    Scenario: Collection with many many items - page 2 item 6
        Given a waycharter resource instance that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'item' operation for the 4th item
        Then the 20th item summary will be returned

    Scenario: Collection with many many items - page 3
        Given a waycharter resource instance that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'next' operation
        Then the next next 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        And it will have a 'prev' operation

    Scenario: Collection with many many items - last page
        Given a waycharter resource instance that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation until we reach the last page
        Then the last 8 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'prev' operation
        But it won't have a 'next' operation


    Scenario: Collection with many many items - next page then first page
        Given a waycharter resource instance that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'first' operation
        Then the first 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation

    Scenario: Collection with many many items - next page then prev page
        Given a waycharter resource instance that's a collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'prev' operation
        Then the first 16 item summaries of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation

    Scenario: Collection with many items - fetch nth item and get unabridged
        Given a waycharter resource instance that's a collection with 16 item
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        And we invoke the 'canonical' operation
        Then the 6th unabridged item will be returned

    Scenario: Collection with many items - items in root
        Given a waycharter resource instance that's a collection with 16 items without any wrapper
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th item summary will be returned

    Scenario: Collection with many items - paginate items in root
        Given a waycharter resource instance that's a collection with 30 items without any wrapper and a page size of 16
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th item summary will be returned

    Scenario: Collection with many items - items not independently retrievable
        Given a waycharter resource instance that's a collection with 16 items that aren't independently retrievable
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th unabridged item will be returned

    Scenario: Static Collection - Empty
        Given a waycharter resource instance that's an empty static collection
        When we load the collection
        Then an empty collection will be returned

    Scenario: Static Collection with one item
        Given a waycharter resource instance that's a static collection with 1 item
        When we load the collection
        Then an collection with 1 item will be returned

    Scenario: Static  Collection with one item - fetch item
        Given a waycharter resource instance that's a static collection with 1 item
        When we load the collection
        And we invoke the 'item' operation for the 1st item
        Then that unabridged item will be returned
        And it won't have a 'canonical' operation

    Scenario: Static  Collection with many items
        Given a waycharter resource instance that's a static collection with 16 items
        When we load the collection
        Then an collection with 16 items will be returned

    Scenario: Static Collection with many items - fetch nth item
        Given a waycharter resource instance that's a static collection with 16 item
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th unabridged item will be returned
        And it won't have a 'canonical' operation

    Scenario: Static Collection with many many items
        Given a waycharter resource instance that's a static collection with 1000 items and a page size of 16
        When we load the collection
        Then the first 16 unabridged items of the collection will be returned
        And it will have a 'next' operation
        And it will have a 'first' operation
        But it won't have a 'prev' operation


    Scenario: Static Collection with many many items - page 2
        Given a waycharter resource instance that's a static collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        Then the next 16 unabridged items of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        And it will have a 'prev' operation

    Scenario: Static Collection with many many items - page 2 item 6
        Given a waycharter resource instance that's a static collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'item' operation for the 4th item
        Then the 20th unabridged item will be returned
        And it won't have a 'canonical' operation

    Scenario: Static Collection with many many items - page 3
        Given a waycharter resource instance that's a static collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'next' operation
        Then the next next 16 unabridged items of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        And it will have a 'prev' operation

    Scenario: Static Collection with many many items - last page
        Given a waycharter resource instance that's a static collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation until we reach the last page
        Then the last 8 unabridged items of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'prev' operation
        But it won't have a 'next' operation


    Scenario: Static Collection with many many items - next page then first page
        Given a waycharter resource instance that's a static collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'first' operation
        Then the first 16 unabridged items of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation

    Scenario: Static Collection with many many items - next page then prev page
        Given a waycharter resource instance that's a static collection with 1000 items and a page size of 16
        When we load the collection
        And we invoke the 'next' operation
        And we invoke the 'prev' operation
        Then the first 16 unabridged items of the collection will be returned
        And it will have a 'first' operation
        And it will have a 'next' operation
        But it won't have a 'prev' operation


    Scenario: Static Collection with many items - items in root
        Given a waycharter resource instance that's a static collection with 16 items with a wrapper
        When we load the collection
        And we invoke the 'item' operation for the 6th item
        Then the 6th unabridged item will be returned
        And it won't have a 'canonical' operation
