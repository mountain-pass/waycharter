// features/support/steps.js
const { Given, When, Then } = require('@cucumber/cucumber')
// const assert = require('assert').strict
const { expect } = require('chai')

Given('the route {string} {string}', function (method, path) {
  const world = this
  world.app[method](path, (req, res) => res.json({ message: 'noop' }))
})

Then('the metadata routes should be', function (dataTable) {
  const world = this
  const expectedArray = dataTable.hashes()
  expect(world.app._waycharter.apis).to.have.length(expectedArray.length)
  expect(world.app._waycharter.apis).to.eql(expectedArray)
})
