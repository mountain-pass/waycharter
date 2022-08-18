/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Given, When, Then } from '@cucumber/cucumber'
import { randomApiPath } from './random-api-path'
import { URI } from 'uri-template-lite'
import { routerToRfc6570 } from '../util/router-to-rfc6570'
import { EndPoint } from '../waycharter'
import { WayChaserResponse } from '@mountainpass/waychaser'
import { ProblemDocument } from '@mountainpass/problem-document'
import assert from 'assert'


function createSingleton({ path, links, body }) {
  this.singleton = {
    body: body || { foo: 'bar' },
    links: links || []
  }
  EndPoint.createStatic({
    router: this.router,
    path,
    body: this.singleton.body,
    links: this.singleton.links
  })
  return path
}

async function load(path, base) {
  const result = await this.waychaser(new URL(path, base))
  expect(result.response.ok).to.be.true
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
  async function (relationship) {
    this.previousPath = this.currentPath
    this.currentPath = createSingleton.bind(this)({
      path: randomApiPath(),
      links: [{ rel: relationship, uri: this.previousPath }]
    })
  }
)

Given(
  'a singleton that has a {string} link to that collection',
  async function (relationship) {
    const link = { rel: relationship, uri: this.currentType.path() }
    createSingletonWithLink.bind(this)(link)
  }
)

Given(
  "a singleton that has a link to that collection's {string} filter",
  async function (relationship) {
    const link = this.currentType.links.find(
      path => path.rel === relationship
    )
    createSingletonWithLink.bind(this)(link)
  }
)

Given('a waycharter endpoint type accessed by {string}', async function (
  indexParameter
) {
  this.previousPath = this.currentPath
  this.currentPath = randomApiPath()
  this.instances = {}
  const path = this.currentPath
  this.currentTemplatePath = `${this.currentPath}/:${indexParameter}`
  this.currentType = EndPoint.create({
    router: this.router,
    path: `${this.currentPath}/:${indexParameter}`,
    handler: async ({ pathParameters, response }) => {
      if (pathParameters[indexParameter] in this.instances) {
        response.chart(this.instances[pathParameters[indexParameter]])
      }
      else {
        response.chartError({
          status: 404,
          body: new ProblemDocument({
            type: 'https://waycharter.io/not-found',
            title: 'Not Found',
            detail: `no resource found at ${path}/${pathParameters[indexParameter]}`,
            path: `${path}/${pathParameters[indexParameter]}`
          })
        })
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
  "a waycharter endpoint that's an empty collection",
  async function () {
    createCollection.bind(this)(0)
  }
)

Given(
  "a waycharter endpoint that's an empty static collection",
  async function () {
    createStaticCollection.bind(this)(0)
  }
)

Given(
  "a waycharter endpoint that's a collection with {int} item(s)",
  async function (length) {
    createCollection.bind(this)(length)
  }
)

Given(
  'a resource collection with an {string} item operation that updates an item',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation
    })
  }
)

Given(
  'a resource collection with an {string} item operation with an object parameter list that updates an item',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      bodyParameters: { foo: {} },
      links: [randomLink({ parameters: { foo: {} } })]
    })
  }
)

Given(
  'a unwrapped resource collection with an {string} item operation that updates an item',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      noWrapper: true
    })
  }
)

Given(
  'a unwrapped resource collection of {int} with an {string} item operation that updates an item',
  async function (size, operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      noWrapper: true,
      size
    })
  }
)

Given(
  'a resource collection with an {string} {string} item operation with a {string} header param that updates an item',
  async function (operationRelation, method, headerParameter) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      method,
      headerParameters: [headerParameter]
    })
  }
)

Given(
  'a resource collection of {int} with an {string} item operation that updates an item',
  async function (size, operationRelation) {
    createCollectionWithItemOperation.bind(this)({ operationRelation, size })
  }
)

Then('the first item will be updated', async function () {
  expect(this.instances[0].body.updated).to.be.true
})

Given(
  'a resource collection with an {string} item operation that updates an item and returns it as a body',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      returnBody: true
    })
  }
)

Then('the update response will be the updated body', async function () {
  const body = this.result.content
  expect(body.updated).to.be.true
})

Given(
  'a resource collection with an {string} item operation that updates an item and returns a header',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      headers: { foo: 'bar' }
    })
  }
)

Then('the update response have the response header', async function () {
  expect(this.result.response.headers.get('foo')).to.equal('bar')
})

Given(
  'a resource collection with an {string} item operation that updates an item and returns a link',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      links: [randomLink()]
    })
  }
)

Then('the update response have the link( template)', async function () {
  const link = this.result.ops.find('foo')
  expect(link).to.not.be.undefined
  expect(link.accept).to.equal('application/json')
  expect(link.parameters[0]).to.equal('some-param')
  expect(link.parameters[1]).to.equal('some-other-param')
})

Then('the operation will receive the header {string} {string}', async function (
  headerName,
  headerValue
) {
  expect(this.instances[0].body.requestHeaders).to.not.be.undefined
})

Given(
  'a resource collection with an {string} item operation that updates an item and returns a link template',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      linkTemplates: [randomLink()]
    })
  }
)

Given(
  'a resource collection with an {string} item operation that throws an error',
  async function (operationRelation) {
    createCollectionWithItemOperation.bind(this)({
      operationRelation,
      throwsError: true
    })
  }
)

Given('a collection of {int} items with a {string} filter', async function (
  length,
  filterRelationship
) {
  createCollection.bind(this)(length, undefined, {
    filters: [{ rel: filterRelationship }]
  })
})

Given('a collection of {int} items and following headers', async function (
  length,
  dataTable
) {
  createCollection.bind(this)(length, undefined, {
    headers: dataTable.rowsHash()
  })
})

Given('a collection of {int} items and following item headers', async function (
  length,
  dataTable
) {
  createCollection.bind(this)(length, undefined, {
    itemHeaders: dataTable.rowsHash()
  })
})

Given(
  'a collection of {int} items with a {string} filter with the following parameters',
  async function (length, filterRelationship, dataTable) {
    createCollection.bind(this)(length, undefined, {
      filters: [{ rel: filterRelationship, parameters: dataTable.hashes() }]
    })
  }
)

Given(
  'a collection of {int} items with a page size of {int} and with a {string} filter with the following parameters',
  async function (length, pageSize, filterRelationship, dataTable) {
    createCollection.bind(this)(length, pageSize, {
      filters: [{ rel: filterRelationship, parameters: dataTable.hashes() }]
    })
  }
)

Given(
  "a waycharter endpoint that's a static collection with {int} item(s)",
  async function (length) {
    createStaticCollection.bind(this)(length)
  }
)

Given(
  "a waycharter endpoint that's a static collection with {int} items and the following headers",
  async function (length, headers) {
    createStaticCollection.bind(this)(length, {
      headers: headers.rowsHash()
    })
  }
)

Given(
  "a waycharter endpoint that's a static collection with {int} items with a wrapper",
  async function (length) {
    createStaticCollection.bind(this)(length, { wrapper: true })
  }
)

function randomLink({ parameters = ['some-param', 'some-other-param'] }: { parameters?: string[] | Record<string, {}> } = {}) {
  return {
    rel: 'foo',
    uri: randomApiPath(),
    accept: 'application/json',
    parameters
  }
}

function createCollectionWithItemOperation({
  operationRelation,
  size = 10,
  headers,
  returnBody = false,
  links,
  linkTemplates,
  method = 'PUT',
  noWrapper = false,
  throwsError = false,
  headerParameters = ['bar'],
  bodyParameters = ['foo']
}) {
  const setProductBaselineEndpoint = this.waycharter.registerOperation({
    path: `${randomApiPath()} /: ID`,
    method,
    operation: async ({ parameters, requestHeaders, ...other }) => {
      if (throwsError) {
        throw new Error('Grrr!')
      }
      const found = this.instances.find(
        instance => instance.body.ID === Number.parseInt(parameters.ID)
      )
      found.body.updated = true
      found.body.requestHeaders = requestHeaders
      return {
        ...(!returnBody && { status: 204 }),
        ...(returnBody && { body: found.body }),
        headers,
        links,
        linkTemplates
      }
    },
    bodyParameters,
    headerParameters
  })

  createCollection.bind(this)(size, size, {
    noWrapper,
    independentlyRetrievable: false,
    itemOperations: { [operationRelation]: setProductBaselineEndpoint }
  })
}

function createSingletonWithLink(link) {
  this.previousPath = this.currentPath
  this.currentPath = createSingleton.bind(this)({
    path: randomApiPath(),
    links: [link]
  })
}

function summariseItem(item) {
  const { ID, title } = item
  return { ID, title }
}

function createStaticCollection(
  length,
  { wrapper = false, headers = {} } = {}
) {
  this.instances = createArrayOfItems(length)

  this.currentPath = randomApiPath()
  const items = this.instances.map(item => item.body)
  this.currentType = EndPoint.createStaticCollection({
    router: this.router,
    path: this.currentPath,
    body: wrapper ? { items: items } : items,
    collectionPointer: wrapper ? '/items/{index}' : '/{index}',
    headers,
  })
}


type Item = {
  ID: number, title: string, other: string
}

function createArrayOfItems(length): { body: Item }[] {
  return [...Array.from({ length }).keys()].map(index => ({
    body: { ID: index, title: 'foo', other: 'bar' }
  }))
}


function createCollection(
  length,
  pageSize,
  {
    noWrapper = false,
    independentlyRetrievable = true,
    filters = [],
    headers = {},
    itemHeaders = {},
    itemOperations = {},
    // eslint-disable-next-line unicorn/no-useless-undefined
    parameter = undefined
  } = {}
) {
  this.instances = createArrayOfItems(length)

  this.currentPath = randomApiPath()
  if (parameter) {
    this.currentPath += `/:${parameter}`
  }
  const itemEndpoint = independentlyRetrievable ? EndPoint.create({
    router: this.router, path: this.currentPath + '/:index',
    handler: ({ pathParameters, response }) => {
      if (typeof pathParameters.index === 'string') {
        const id = Number.parseInt(pathParameters.index)
        response.chart({
          body: this.instances[id].body,
          headers: itemHeaders
        })
      }
      else {
        response.chartError({ status: 400, body: new ProblemDocument({ title: "Bad request", detail: "`index` is not a string" }) })
      }
    }
  }) : undefined

  this.currentType = EndPoint.createCollection({
    router: this.router,
    itemEndpoint,
    path: this.currentPath,
    handler: async ({ page, queryParameters, response }) => {
      console.log({ queryParameters })
      let instances = this.instances
      for (const filter of filters) {
        if (filter.parameters) {
          for (const parameter of filter.parameters) {
            console.log(
              `looking for ${parameter.parameter} of ${parameter.value} in`,
              queryParameters
            )
            console.log({
              'otherParameters[parameter.parameter] === parameter.value':
                queryParameters[parameter.parameter] === parameter.value
            })
            if (queryParameters[parameter.parameter] === parameter.value) {
              instances = instances.slice(parameter.itemsRemoved)
            }
          }
        }
      }
      const pageNumber = Number.parseInt(page || '0')
      if (!Number.isNaN(pageNumber)) {
        const pageInstances = pageSize
          ? instances.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize)
          : instances
        const items = pageInstances
          .map(item => item.body)
          .map(item => (independentlyRetrievable ? summariseItem(item) : item))
        const hasMore = pageSize && pageNumber < this.instances.length / pageSize - 1;
        response.chartCollection(noWrapper
          ? {
            body: items,
            // itemOperations,
            nextPage: hasMore ? (pageNumber + 1).toFixed() : undefined,
            prevPage: pageNumber > 0 ? (pageNumber - 1).toFixed() : undefined,
            collectionPointer: '/{index}',
            headers
          }
          : {
            body: {
              items,
              count: items.length,
              page
            },
            // itemOperations,
            collectionPointer: '/items/{index}',
            nextPage: hasMore ? (pageNumber + 1).toFixed() : undefined,
            prevPage: pageNumber > 0 ? (pageNumber - 1).toFixed() : undefined,
            headers
          })
      }
      else {
        response.chart({
          status: 400,
          body: new ProblemDocument({ title: "Bad request", detail: `page '${page}' is not a number` })
        })
      }
    },
    ...(filters && {
      filters: filters.map(filter => ({
        rel: filter.rel,
        parameters: [
          ...new Set<string>(filter.parameters?.map(parameter => parameter.parameter))
        ]
      }))
    })
  })
  return this.currentType
}

Given(
  "a waycharter endpoint that's a collection with {int} items and a page size of {int}",
  async function (count, pageSize) {
    createCollection.bind(this)(count, pageSize)
  }
)

Given(
  "a waycharter endpoint that's a collection templated with the parameter {string} with {int} items and a page size of {int}",
  async function (parameter, count, pageSize) {
    createCollection.bind(this)(count, pageSize, { parameter })
  }
)

Given(
  "a waycharter endpoint that's a collection with {int} item(s) without any wrapper",
  async function (count) {
    createCollection.bind(this)(count, undefined, { noWrapper: true })
  }
)

Given(
  "a waycharter endpoint that's a collection with {int} items without any wrapper and a page size of {int}",
  async function (count, pageSize) {
    createCollection.bind(this)(count, pageSize, { noWrapper: true })
  }
)

Given(
  "a waycharter endpoint that's a collection with {int} items that aren't independently retrievable",
  async function (count) {
    createCollection.bind(this)(count, undefined, {
      independentlyRetrievable: false
    })
  }
)

Given('the singleton has a {string} link to that instance', async function (
  relationship
) {
  this.singleton.links.push({ rel: relationship, uri: this.currentPath })
})


// eslint-disable-next-line unicorn/no-useless-undefined
async function loadCurrent({ parameters = undefined } = {}) {
  const expandedUrl = URI.expand(routerToRfc6570(this.currentPath), parameters ?? {})
  this.result = await load.bind(this)(
    expandedUrl,
    this.baseUrl
  )
}

When('we load that resource instance', async function () {
  await loadCurrent.bind(this)()
})

When('we load the latter singleton', async function () {
  await loadCurrent.bind(this)()
})

When('we load the collection', async function () {
  await loadCurrent.bind(this)()
  console.log({ result: this.result })
  console.log({ allOps: this.result.allOperations })
})

When('we load the collection with {string} of {string}', async function (
  parameter,
  value
) {
  await loadCurrent.bind(this)({ parameters: { [parameter]: value } })
})

When('we load page {string} of the collection', async function (page) {
  await loadCurrent.bind(this)()
  this.result = await this.waychaser(
    new URL(
      this.result.ops.find('next').uri.replace('=1', `=${page} `),
      this.baseUrl
    )
  )
})

When('we load the singleton', async function () {
  this.result = await load.bind(this)(this.previousPath, this.baseUrl)
})

When('we invoke the {string} operation', async function (relationship) {
  this.result = await this.result.invoke(relationship)
})

When(
  'we invoke the {string} operation with the header {string} {string}',
  async function (relationship, headerName, headerValue) {
    this.result = await this.result.invoke(relationship, undefined, {
      headers: {
        [headerName]: headerValue
      }
    })
  }
)

When('we invoke the {string} operation with', async function (
  relationship,
  dataTable
) {
  const op = this.result.ops.find(relationship);
  console.log({ query: dataTable.rowsHash() })
  this.result = await op.invoke({ parameters: dataTable.rowsHash() })
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

async function getNthItem(relationship, nth) {
  this.result = await this.result.invoke(relationship, { parameters: { index: nth - 1 } })
}

When(
  'we invoke the {string} operation for the {int}(st)(nd)(rd)(th) item',
  getNthItem
)

Then('it will have a {string} operation', async function (relationship) {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  // eslint-disable-next-line unicorn/no-array-callback-reference
  expect(this.result.ops.find(relationship)).to.not.be.undefined
})

Then("it won't have a {string} operation", async function (relationship) {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  expect(this.result.ops.find(relationship)).to.be.undefined
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
    expect(related.response.ok).to.be.true
    expect(related.response.url).to.equal(
      new URL(this.previousPath, this.baseUrl).toString()
    )
  }
)

Then(
  'the {string} operation will return the instance with the {string} {string}',
  async function (relationship, indexParameter, indexParameterValue) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const related = await this.result.invoke(relationship)
    // const bodyAsTest = await related.response.text()
    expect(related.response.url).to.equal(
      new URL(this.currentPath, this.baseUrl).toString()
    )
    expect(related.response.ok).to.be.true
    expect(related.content).to.deep.equal({
      [indexParameter]: indexParameterValue
    })
  }
)

Then('an empty collection will be returned', async function () {
  expect(this.result.ops.find('item')).to.be.undefined
})

Then('the response will include the following header(s)', async function (
  dataTable
) {
  const headers = dataTable.rowsHash()

  for (const name in headers) {
    expect(this.result.response.headers.get(name)).to.equal(headers[name])
  }
})

Then('a(n) collection with {int} item(s) will be returned', async function (
  length
) {
  console.log(this.result.content)
  console.log(this.result.ops)
  const items = await this.result.invokeAll('item')
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
  expect(this.result.content).to.deep.equal(
    summariseItem(this.instances[0].body)
  )
})

Then('that unabridged item will be returned', async function () {
  expect(this.result.content).to.deep.equal(this.instances[0].body)
})

Then('the {int}(th) item summary will be returned', async function (nth) {
  expect(this.result.content).to.deep.equal(
    summariseItem(this.instances[nth - 1].body)
  )
})

Then('the {int}(th) unabridged item will be returned', async function (nth) {
  expect(this.result.content).to.deep.equal(this.instances[nth - 1].body)
})

async function getItems() {
  const resources = await this.result.invokeAll('item')
  const items = resources.map(resource => resource.content)
  return items
}

async function checkItemsInCollection(
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

Then('a {int} bad request will be returned', async function (status) {
  expect(this.result.response.status).to.equal(400)
})


Given('the following collection with items at {string}', async function (collectionPointer, documentString) {
  this.currentPath = randomApiPath()
  this.currentType = EndPoint.createStaticCollection({
    router: this.router,
    path: this.currentPath,
    body: JSON.parse(documentString),
    collectionPointer
  })
});

Given('the following collection that canonically links to the above endpoint with items at {string}', async function (collectionPointer, documentString) {
  this.currentPath = randomApiPath()
  expect(this.currentType).to.not.be.undefined
  this.currentType = EndPoint.createStaticCollection({
    router: this.router,
    path: this.currentPath,
    body: JSON.parse(documentString),
    itemEndpoint: this.currentType,
    collectionPointer
  })
});

Given('a waycharter endpoint at {string} that varies its response as follows', async function (path, dataTable) {
  this.currentPath = path
  this.currentType = EndPoint.create({
    router: this.router, path, handler: async ({
      pathParameters,
      response,
    }) => {
      response.chart({
        body: JSON.parse(dataTable.rowsHash()[pathParameters.item])
      })
    }
  })
});

When('we load all the {string} operations', async function (relationship) {
  this.result = await this.result.invokeAll(relationship)
  for (const result of this.result) {
    console.log({ result })
    for (const op of result.ops) {
      console.log({ op })
    }
  }
});

Then('{int} items will be returned', async function (count) {
  expect(this.result.length).to.equal(count)
  expect(this.result[0]).to.be.instanceOf(WayChaserResponse)
});

When('for each item we invoke the {string} operation', async function (relationship) {
  this.result = await Promise.all(this.result.map(item => item.invoke(relationship)))
});

Then('the 2nd item will be', async function (documentString) {
  expect(this.result[1].content).to.deep.equal(JSON.parse(documentString))
});