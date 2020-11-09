const { Then } = require('@cucumber/cucumber')
const { expect } = require('chai')
const RSON = require('relaxed-json')
const flatten = require('../../src/common/utils/flatten-apis')

Then('the flattened JSON should be', function (expectedJsonString) {
  const world = this
  expect(flatten(world.apis)).to.eql(RSON.parse(expectedJsonString))
})
