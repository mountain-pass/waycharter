/**
 * Will start and stop the entire server app with an inmemory database.
 */

var { AfterAll, After, Before, Given, BeforeAll } = require('@cucumber/cucumber')

const { wrap } = require('../../src/express')
const express = wrap(require('express'))

const globalWorld = {
  express
}

// BeforeAll({ tags: '@UseExpress' }, function () {
//   // do nothiing
// })

Before({ tags: '@UseExpress' }, function () {
  const world = this
  world.app = globalWorld.express()
})

// Given('the test data', function (jsonString) {
//   const testData = JSON.parse(jsonString)
//   // console.log('Loading test data', testData)
//   return globalWorld.mongoUnit.load(testData)
// })

// After({ tags: '@UseExpress' }, function () {
//   return globalWorld.mongoUnit.drop()
// })

// AfterAll({ tags: '@UseExpress' }, function () {
//   console.log('AfterAll - executing...')
//   return Promise.all([globalWorld.server.close(), globalWorld.db.close(), globalWorld.mongoUnit.stop()])
//     .then(() => console.log('AfterAll - complete.'))
//     .catch((err) => console.log(`AfterAll - error - ${err.message}`))
// })
