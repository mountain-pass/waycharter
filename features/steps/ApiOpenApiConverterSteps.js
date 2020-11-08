const { Given, When, Then } = require('@cucumber/cucumber')
const { expect } = require('chai')
const RSON = require('relaxed-json')
const { convertToOpenapiV3 } = require('../../index')

Given('API metadata', function (docString) {
  this.apis = RSON.parse(docString)
})

Then('converted to OpenAPI JSON should be', function (expectedOpenAPIJson) {
  const actual = convertToOpenapiV3({}, this.apis)
  expect(actual).to.eql(RSON.parse(expectedOpenAPIJson))
})

When('converted to OpenAPI JSON with configuration', function (dataTable) {
  const config = dataTable.rowsHash()
  Object.entries(config).forEach(([k, v]) => {
    if (v.startsWith('{')) config[k] = RSON.parse(v)
  })
  this.OpenAPIJson = convertToOpenapiV3(config, this.apis)
})

Then('the OpenAPI JSON should be', function (expectedOpenAPIJson) {
  expect(this.OpenAPIJson).to.eql(RSON.parse(expectedOpenAPIJson))
})
