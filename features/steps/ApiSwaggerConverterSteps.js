const { Given, When, Then } = require('@cucumber/cucumber')
const { expect } = require('chai')
const RSON = require('relaxed-json')
const generateSwaggerJson = require('../../src/express/converters/metadata-to-openapi-v3')

Given('API metadata', function (docString) {
  this.apis = RSON.parse(docString)
})

Then('converted to Swagger JSON should be', function (expectedSwaggerJson) {
  const actual = generateSwaggerJson({}, this.apis)
  expect(actual).to.eql(RSON.parse(expectedSwaggerJson))
})

When('converted to Swagger JSON with configuration', function (dataTable) {
  const config = dataTable.rowsHash()
  Object.entries(config).forEach(([k, v]) => {
    if (v.startsWith('{')) config[k] = RSON.parse(v)
  })
  this.swaggerJson = generateSwaggerJson(config, this.apis)
})

Then('the Swagger JSON should be', function (expectedSwaggerJson) {
  expect(this.swaggerJson).to.eql(RSON.parse(expectedSwaggerJson))
})
