import { expect } from 'chai'
import { Given, When, Then } from '@cucumber/cucumber'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals
} from 'unique-names-generator'
import pointer from 'jsonpointer'
import { URI } from 'uri-template-lite'

let pathCount = 0

function randomPathSegment () {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals]
  })
}

const randomApiPath = () => {
  return `/api/${pathCount++}-${randomPathSegment()}`
}

function createSingleton ({ path, links, body }) {
  this.singleton = {
    body: body || { foo: 'bar' },
    links: links || []
  }
  this.waycharter.registerStaticResource({
    path,
    body: this.singleton.body,
    links: this.singleton.links
  })
  return path
}

async function load (path, base) {
  const result = await this.waychaser.load(new URL(path, base))
  expect(result.response.ok).to.be.true()
  return result
}

Given(
  "a resource instance that's a singleton waycharter resource type",
  async function () {
    this.currentPath = createSingleton.bind(this)({ path: randomApiPath() })
  }
)

Given(
  'another singleton that has a {string} link that previous singleton',
  async function (string) {
    this.previousPath = this.currentPath
    this.currentPath = createSingleton.bind(this)({
      path: randomApiPath(),
      links: [{ rel: 'related', uri: this.previousPath }]
    })
  }
)

Given('a waycharter resource type accessed by {string}', async function (
  indexParameter
) {
  this.previousPath = this.currentPath
  this.currentPath = randomApiPath()
  this.instances = []
  this.currentType = this.waycharter.registerResourceType({
    path: `${this.currentPath}/:${indexParameter}`,
    loader: async parameters => {
      return this.instances[parameters[indexParameter]]
    }
  })
})

Given('an instance of that type with the {string} {string}', async function (
  indexParameter,
  indexParameterValue
) {
  this.instances[indexParameterValue] = {
    body: {
      [indexParameter]: indexParameterValue
    }
  }
  this.currentPath = this.currentType.path({
    [indexParameter]: indexParameterValue
  })
})

Given(
  "a waycharter resource instance that's an empty collection",
  async function () {
    this.currentPath = createSingleton.bind(this)({ path: randomApiPath() })
  }
)

Given(
  "a waycharter resource instance that's a collection with {int} item(s)",
  async function (length) {
    createCollection.bind(this)(length)
  }
)

function summariseItem (item) {
  const { id, title } = item
  return { id, title }
}

function createCollection (length, pageSize) {
  this.instances = [...Array.from({ length }).keys()].map(index => ({
    body: { id: index, title: 'foo', other: 'bar' }
  }))

  // this code is to expose each item
  this.currentPath = randomApiPath()
  this.currentType = this.waycharter.registerResourceType({
    path: `${this.currentPath}/:id`,
    loader: async parameters => {
      return this.instances[parameters.id]
    }
  })

  // this code is to expose the collection
  this.currentPath = randomApiPath()
  const collectionLoader = async ({ page = 0 }) => {
    const pageInt = page
    const pageInstances = pageSize
      ? this.instances.slice(pageInt * pageSize, (pageInt + 1) * pageSize)
      : this.instances
    const body = pageInstances
      .map(item => item.body)
      .map(item => summariseItem(item))
    const itemLinks = pageInstances.map((item, index) => ({
      rel: 'item',
      uri: `#/${index}`
    }))
    const canonicalLinks = pageInstances.map((item, index) => ({
      rel: 'canonical',
      uri: this.currentType.path({
        id: index
      }),
      anchor: `#/${index}`
    }))
    return {
      body,
      links: [...itemLinks, ...canonicalLinks]
    }
  }

  this.waycharter.registerResourceType({
    path: this.currentPath,
    loader: async ({ page = '0' }) => {
      const pageInt = Number.parseInt(page)
      const { body, links } = await collectionLoader({ page: pageInt })

      return {
        body,
        links: [
          ...links,
          ...(pageSize && pageInt < this.instances.length / pageSize - 1
            ? [{ rel: 'next', uri: `?page=${pageInt + 1}` }]
            : []),
          ...(pageInt > 0
            ? [{ rel: 'prev', uri: `?page=${pageInt - 1}` }]
            : []),
          { rel: 'first', uri: '?page=0' }
        ]
      }
    }
  })
}

Given(
  "a waycharter resource instance that's a collection with {int} items and a page size of {int}",
  createCollection
)

Given('the singleton has a {string} link to that instance', async function (
  relationship
) {
  this.singleton.links.push({ rel: relationship, uri: this.currentPath })
})

async function loadCurrent () {
  this.result = await load.bind(this)(this.currentPath, this.baseUrl)
}

When('we load that resource instance', loadCurrent)

When('we load the latter singleton', loadCurrent)

When('we load the collection', loadCurrent)

When('we load the singleton', async function () {
  this.result = await load.bind(this)(this.previousPath, this.baseUrl)
})

When('we invoke the {string} operation', async function (relationship) {
  this.result = await this.result.invoke(relationship)
  console.log(this.result)
})

When(
  'we invoke the {string} operation until we reach the last page',
  async function (relationship) {
    for (
      this.result = await this.result.invoke(relationship);
      // eslint-disable-next-line unicorn/no-array-callback-reference
      this.result.ops.find(relationship); // eslint-disable-line unicorn/prefer-array-some
      this.result = await this.result.invoke(relationship)
    ) {}
  }
)

async function getNthItem (relationship, nth) {
  // in waychaser, we should provide a convenience function
  // so we can get "nested" resources as follows
  // this.result.nested(relationship)[nth - 1].invoke()
  // which would return all the resources with the given relationship
  // the invoke needs to be customised for items, so that it passes the item
  // as context to expand the uri
  // OR....
  // the item link points to a fragment, which is retrievable
  // and waychaser is smart enough to provide the relevant links for that fragment
  // based on the anchors
  // so to get the items, you'd do something like
  /* 
  const items = await Promise.all(resource.ops.filter('item').map(itemOp => itemOp.invoke()))
  const item = await items[nth-1].invoke('unabridged')
  */
  // eslint-disable-next-line unicorn/no-array-callback-reference
  const items = this.result.ops.filter(relationship)
  this.result = await items[nth - 1].invoke()
  /*
    how do we iterated through the collection?
    WHat if we gave the index a range and that range was automatically expanded by waychaser
  */
}

When(
  'we invoke the {string} operation for the {int}(st)(nd)(rd)(th) item',
  getNthItem
)

Then('it will have a {string} operation', async function (relationship) {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  expect(this.result.ops.find(relationship)).to.not.be.undefined()
})

Then("it won't have a {string} operation", async function (relationship) {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  expect(this.result.ops.find(relationship)).to.be.undefined()
})

Then(
  'the {string} operation will return the same resource instance',
  async function (relationship) {
    const self = await this.result.invoke(relationship)
    expect(self.response.url).to.equal(this.result.response.url)
  }
)

Then(
  'the {string} operation will return the previous singleton',
  async function (relationship) {
    const related = await this.result.invoke(relationship)
    expect(related.response.ok).to.be.true()
    expect(related.response.url).to.equal(
      new URL(this.previousPath, this.baseUrl).toString()
    )
  }
)

Then(
  'the {string} operation will return the instance with the {string} {string}',
  async function (relationship, indexParameter, indexParameterValue) {
    const related = await this.result.invoke(relationship)
    // const bodyAsTest = await related.response.text()
    expect(related.response.url).to.equal(
      new URL(this.currentPath, this.baseUrl).toString()
    )
    expect(related.response.ok).to.be.true()
    expect(await related.body()).to.deep.equal({
      [indexParameter]: indexParameterValue
    })
  }
)

Then('an empty collection will be returned', async function () {
  expect(this.result.ops.find('item')).to.be.undefined()
})

Then('an collection with {int} item(s) will be returned', async function (
  length
) {
  const body = await this.result.body()
  expect(body.length).to.equal(length)
})

Then(
  'the first {int} item summaries of the collection will be returned',
  async function (count) {
    const body = await this.result.body()
    expect(body.length).to.equal(count)
    expect(body).to.deep.equal(
      this.instances
        .slice(0, count)
        .map(item => item.body)
        .map(item => summariseItem(item))
    )
  }
)

Then(
  'the next {int} item summaries of the collection will be returned',
  async function (count) {
    const body = await this.result.body()
    expect(body.length).to.equal(count)
    expect(body).to.deep.equal(
      this.instances
        .slice(count, count * 2)
        .map(item => item.body)
        .map(item => summariseItem(item))
    )
  }
)

Then(
  'the next next {int} item summaries of the collection will be returned',
  async function (count) {
    const body = await this.result.body()
    expect(body.length).to.equal(count)
    expect(body).to.deep.equal(
      this.instances
        .slice(count * 2, count * 3)
        .map(item => item.body)
        .map(item => summariseItem(item))
    )
  }
)

Then(
  'the last {int} item summaries of the collection will be returned',
  async function (count) {
    const body = await this.result.body()
    expect(body.length).to.equal(count)
    expect(body).to.deep.equal(
      this.instances
        .slice(-count)
        .map(item => item.body)
        .map(item => summariseItem(item))
    )
  }
)

Then('that item summary will be returned', async function () {
  expect(await this.result.body()).to.deep.equal(
    summariseItem(this.instances[0].body)
  )
})

Then('the {int}(th) item summary will be returned', async function (nth) {
  expect(await this.result.body()).to.deep.equal(
    summariseItem(this.instances[nth - 1].body)
  )
})

Then('the {int}(th) unabridged item will be returned', async function (nth) {
  expect(await this.result.body()).to.deep.equal(this.instances[nth - 1].body)
})
