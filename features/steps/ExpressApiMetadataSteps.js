const { Given, Then } = require('@cucumber/cucumber')
const { expect } = require('chai')
const RSON = require('relaxed-json')
const request = require('supertest')
const Metadata = require('../../src/common/classes/Metadata')

const NOOP_HANDLER = (req, res) => res.send('success')
const NOOP_MIDDLEWARE = (req, res, next) => next()

// setup routes

const parsePath = (path) => (~path.indexOf(',') ? path.split(',') : path)

Given('the route {string} {string}', function (method, path) {
  const world = this

  world.app[method](parsePath(path), NOOP_HANDLER)
})

Given('the route {string} {string} with subroute {string} {string}', function (method, path, submethod, subpath) {
  const world = this
  const router = world.express.Router()
  router[submethod](parsePath(subpath), NOOP_HANDLER)
  world.app[method](parsePath(path), router)
})

Given('the route {string} {string} with metadata', function (method, path, dataTable) {
  const world = this
  const meta = dataTable.hashes()[0]
  world.app[method](new Metadata(meta), parsePath(path), NOOP_HANDLER)
})

Given('the route {string} {string} with metadata and middleware', function (method, path, dataTable) {
  const world = this
  const meta = dataTable.hashes()[0]
  world.app[method](new Metadata(meta), parsePath(path), NOOP_MIDDLEWARE, NOOP_HANDLER)
})

// assert metadata

Then('the metadata routes should be', function (dataTable) {
  const world = this
  const expectedArray = dataTable.hashes()
  expect(world.app._waycharter.apis).to.eql(expectedArray)
})

Then('the metadata json should be', function (docString) {
  const world = this
  const expectedJson = RSON.parse(docString)
  expect(
    world.app._waycharter.apis,
    `Expected: ${JSON.stringify(expectedJson, null, 2)} Actual: ${JSON.stringify(world.app._waycharter.apis, null, 2)}`
  ).to.eql(expectedJson)
})

Then('calling app._waycharter.toOpenApiV3 should return', function (expectedOpenApiV3String) {
  const world = this
  const actualOpenApiJson = world.app._waycharter.toOpenApiV3({})
  expect(actualOpenApiJson).to.eql(RSON.parse(expectedOpenApiV3String))
})
