// features/support/steps.js
const { Given, When, Then } = require('@cucumber/cucumber')
const { expect } = require('chai')
// const express = require('express')
const RSON = require('relaxed-json')
const Metadata = require('../../src/express/Metadata')

// setup routes

const parsePath = (path) => (~path.indexOf(',') ? path.split(',') : path)

Given('the route {string} {string}', function (method, path) {
  const world = this

  world.app[method](parsePath(path), (req, res) => res.json({ message: 'noop' }))
})

Given('the route {string} {string} with subroute {string} {string}', function (method, path, submethod, subpath) {
  const world = this
  const router = world.express.Router()
  router[submethod](parsePath(subpath), (req, res) => res.json({ message: 'noop' }))
  world.app[method](parsePath(path), router)
})

Given('the route {string} {string} with metadata', function (method, path, dataTable) {
  const world = this
  const meta = dataTable.hashes()[0]
  world.app[method](parsePath(path), new Metadata(meta), (req, res) => res.json({ message: 'noop' }))
})

// assert metadata

Then('the metadata routes should be', function (dataTable) {
  const world = this
  const expectedArray = dataTable.hashes()
  expect(world.app._waycharter.apis).to.have.length(expectedArray.length)
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
