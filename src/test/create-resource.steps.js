import { expect } from 'chai'
import { Given, When, Then } from '@cucumber/cucumber'
import { randomApiPath } from './random-api-path'

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
  this.instances = {}
  const path = this.currentPath
  this.currentTemplatePath = `${this.currentPath}/:${indexParameter}`
  this.currentType = this.waycharter.registerResourceType({
    path: `${this.currentPath}/:${indexParameter}`,
    loader: async parameters => {
      console.log({ parameters })
      console.log({ instances: this.instances })
      console.log({
        found: parameters[indexParameter] in this.instances
      })
      return parameters[indexParameter] in this.instances
        ? this.instances[parameters[indexParameter]]
        : {
            status: 404,
            body: {
              error: 'Not Found',
              path: `${path}/${parameters[indexParameter]}`
            }
          }
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
    createCollection.bind(this)(0)
  }
)

Given(
  "a waycharter resource instance that's an empty static collection",
  async function () {
    createStaticCollection.bind(this)(0)
  }
)

Given(
  "a waycharter resource instance that's a collection with {int} item(s)",
  async function (length) {
    createCollection.bind(this)(length)
  }
)

Given(
  "a waycharter resource instance that's a static collection with {int} item(s)",
  async function (length) {
    createStaticCollection.bind(this)(length)
  }
)

Given(
  "a waycharter resource instance that's a static collection with {int} items with a wrapper",
  async function (length) {
    createStaticCollection.bind(this)(length, undefined, { wrapper: true })
  }
)

function summariseItem (item) {
  const { id, title } = item
  return { id, title }
}

function createStaticCollection (length, pageSize, { wrapper = false } = {}) {
  this.instances = createArrayOfItems(length)

  this.currentPath = randomApiPath()
  const items = this.instances.map(item => item.body)
  this.waycharter.registerStaticCollection({
    collectionPath: this.currentPath,
    collection: wrapper ? { items: items } : items,
    arrayPointer: wrapper ? '/items' : undefined,
    pageSize
  })
}

function createCollection (
  length,
  pageSize,
  { noWrapper = false, independentlyRetrievable = true } = {}
) {
  this.instances = createArrayOfItems(length)

  this.currentPath = randomApiPath()

  this.waycharter.registerCollection({
    ...(independentlyRetrievable && {
      itemPath: '/:id',
      itemLoader: async parameters => {
        return this.instances[parameters.id]
      }
    }),
    collectionPath: this.currentPath,
    collectionLoader: async ({ page }) => {
      const pageInstances = pageSize
        ? this.instances.slice(page * pageSize, (page + 1) * pageSize)
        : this.instances
      const items = pageInstances
        .map(item => item.body)
        .map(item => (independentlyRetrievable ? summariseItem(item) : item))

      return noWrapper
        ? {
            body: items,
            hasMore: pageSize && page < this.instances.length / pageSize - 1
          }
        : {
            body: {
              items,
              count: items.length
            },
            arrayPointer: '/items',
            hasMore: pageSize && page < this.instances.length / pageSize - 1
          }
    }
  })
}

Given(
  "a waycharter resource instance that's a collection with {int} items and a page size of {int}",
  createCollection
)

Given(
  "a waycharter resource instance that's a collection with {int} item(s) without any wrapper",
  async function (count) {
    createCollection.bind(this)(count, undefined, { noWrapper: true })
  }
)

Given(
  "a waycharter resource instance that's a collection with {int} items without any wrapper and a page size of {int}",
  async function (count, pageSize) {
    createCollection.bind(this)(count, pageSize, { noWrapper: true })
  }
)

Given(
  "a waycharter resource instance that's a collection with {int} items that aren't independently retrievable",
  async function (count) {
    createCollection.bind(this)(count, undefined, {
      independentlyRetrievable: false
    })
  }
)

Given(
  "a waycharter resource instance that's a static collection with {int} items and a page size of {int}",
  async function (count, pageSize) {
    createStaticCollection.bind(this)(count, pageSize)
  }
)

Given('the singleton has a {string} link to that instance', async function (
  relationship
) {
  this.singleton.links.push({ rel: relationship, uri: this.currentPath })
})

function createArrayOfItems (length) {
  return [...Array.from({ length }).keys()].map(index => ({
    body: { id: index, title: 'foo', other: 'bar' }
  }))
}

async function loadCurrent () {
  this.result = await load.bind(this)(this.currentPath, this.baseUrl)
}

When('we load that resource instance', loadCurrent)

When('we load the latter singleton', loadCurrent)

When('we load the collection', loadCurrent)

When('we load page {int} of the collection', async function (int) {
  await loadCurrent.bind(this)()
  console.log(this.result)
  console.log(this.result.ops.find('next').uri)
  console.log(this.result.ops.find('next').baseUrl)
  this.result = await load.bind(this)(
    this.result.ops.find('next').uri.replace('=1', '=0'),
    this.result.ops.find('next').baseUrl
  )
  console.log(this.result)
})

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
    this.result = await this.result.invoke(relationship)
    while (
      // eslint-disable-next-line unicorn/no-array-callback-reference
      this.result.ops.find(relationship) // eslint-disable-line unicorn/prefer-array-some
    ) {
      this.result = await this.result.invoke(relationship)
    }
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
  console.log({ related: this.result.ops.find(relationship) })
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
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const operation = this.result.ops.find(relationship)
    console.log({ operation })
    const related = await this.result.invoke(relationship)
    // const bodyAsTest = await related.response.text()
    expect(related.response.url).to.equal(
      new URL(this.currentPath, this.baseUrl).toString()
    )
    console.log({ response: related.response })
    console.log({ body: await related.body() })
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
  const items = await Promise.all(
    this.result.ops.filter('item').map(op => op.invoke())
  )
  expect(items.length).to.equal(length)
})

Then(
  'the first {int} item summaries of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(0, count)
  }
)

Then(
  'the first {int} unabridged items of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(0, count, { summarise: false })
  }
)

Then(
  'the next {int} item summaries of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(count, count)
  }
)

Then(
  'the next {int} unabridged items of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(count, count, { summarise: false })
  }
)

Then(
  'the next next {int} item summaries of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(count * 2, count)
  }
)

Then(
  'the next next {int} unabridged items of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(count * 2, count, {
      summarise: false
    })
  }
)

Then(
  'the last {int} item summaries of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(-count, count)
  }
)

Then(
  'the last {int} unabridged items of the collection will be returned',
  async function (count) {
    await checkItemsInCollection.bind(this)(-count, count, { summarise: false })
  }
)

Then('that item summary will be returned', async function () {
  expect(await this.result.body()).to.deep.equal(
    summariseItem(this.instances[0].body)
  )
})

Then('that unabridged item will be returned', async function () {
  expect(await this.result.body()).to.deep.equal(this.instances[0].body)
})

Then('the {int}(th) item summary will be returned', async function (nth) {
  expect(await this.result.body()).to.deep.equal(
    summariseItem(this.instances[nth - 1].body)
  )
})

Then('the {int}(th) unabridged item will be returned', async function (nth) {
  expect(await this.result.body()).to.deep.equal(this.instances[nth - 1].body)
})

async function getItems () {
  const resources = await Promise.all(
    this.result.ops.filter('item').map(op => op.invoke())
  )
  const items = await Promise.all(resources.map(resource => resource.body()))
  return items
}

async function checkItemsInCollection (
  start,
  count,
  { summarise = true } = {}
) {
  const items = await getItems.bind(this)()
  expect(items.length).to.equal(count)
  expect(items).to.deep.equal(
    this.instances
      .slice(start, start < 0 ? undefined : start + count)
      .map(item => item.body)
      .map(item => (summarise ? summariseItem(item) : item))
  )
}

Then(
  'we will be redirected to the collection without a page number',
  async function () {
    expect(this.result.ops.find('self').uri).to.equal(this.currentPath)
  }
)
