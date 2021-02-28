# Product

## ToC

- [Product](#product)
  - [ToC](#toc)
  - [Problem](#problem)
    - [Eureka moment](#eureka-moment)
  - [Customer](#customer)
  - [Solution](#solution)
  - [Assumptions](#assumptions)
    - [Unvalidated](#unvalidated)
    - [Validating](#validating)
      - [If it was just as easy or easier to create a HATEOAS API than a non-HATEOAS API, then more people would create HATEOAS APIs](#if-it-was-just-as-easy-or-easier-to-create-a-hateoas-api-than-a-non-hateoas-api-then-more-people-would-create-hateoas-apis)
    - [Validated](#validated)
    - [Invalidated](#invalidated)
      - [Developers are interested in HATEOAS clients](#developers-are-interested-in-hateoas-clients)
  
## Problem

REST APIs that use HATEOAS allow for extremely loose coupling, which is awesome, but actually creating them can be quite
hard. This library makes it easier.

### Eureka moment

Whenever I get a good base server setup working, it's awesome, but getting to that first step is quite hard and 
gets in the way of getting the functionality you are trying to build working, which is why it's often easier to 
go without

## Customer

Developers creating REST APIs that use HATEOAS

## Solution

Simple middleware that abstracted the details of creating a REST APIs that uses HATEOAS, without having to
make sure all the URLs being return match the express URLs

## Assumptions

### Unvalidated 

- it is faster to develop with a HATEOAS client than a non-HATEOAS client
- There is little interest in HATEOAS or demand for HATEOAS clients because there are so few HATEOAS APIs
- There are few HATEOAS APIs because there's little demand 
- There are few HATEOAS APIs because they are much harder to create than non-HATEOAS APIs, and it's hard to justify the
effort when lots of people just tightly couple to the API with a non-HATEOAS client.

### Validating

#### If it was just as easy or easier to create a HATEOAS API than a non-HATEOAS API, then more people would create HATEOAS APIs

Test: Create initial version of middleware and pitch it on twitter.

Success: At least 10 like, retweets or comments.

### Validated

_None_

### Invalidated

#### Developers are interested in HATEOAS clients

Test: Create initial version of library, supporting HAL and Siren and pitch it on twitter.

Info on popularity a features of different hypermedia types at https://www.fabernovel.com/en/article/tech-en/which-technologies-should-you-use-to-build-hypermedia-apis

Success: At least 10 like, retweets or comments.
Result: 
  3 likes 😢 https://twitter.com/tompahoward/status/1364548120814768128?s=20
  4 likes + 1 😢 retweet https://twitter.com/tompahoward/status/1361981160524378113?s=20