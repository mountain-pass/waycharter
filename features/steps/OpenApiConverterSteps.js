const { Given, When, Then } = require('@cucumber/cucumber')
const { expect } = require('chai')
const RSON = require('relaxed-json')
const { convertToOpenapiV3 } = require('../../index')

Given('API metadata', function (docString) {
  this.apis = RSON.parse(docString)
})

When('converted to OpenAPI JSON with configuration', function (dataTable) {
  const world = this
  const config = dataTable.rowsHash()
  /* istanbul ignore next */
  Object.entries(config).forEach(([k, v]) => {
    if (v.startsWith('{')) config[k] = RSON.parse(v)
  })
  world.actualOpenApiV3 = convertToOpenapiV3(config, this.apis)
})

Then('converted to OpenAPI JSON should be', function (expectedOpenAPIJson) {
  const world = this
  const actualJson = convertToOpenapiV3({}, world.apis)
  expect(actualJson).to.eql(RSON.parse(expectedOpenAPIJson))
})

Then('the OpenAPI JSON should be', function (expectedOpenAPIJson) {
  const world = this
  expect(world.actualOpenApiV3).to.eql(RSON.parse(expectedOpenAPIJson))
})
