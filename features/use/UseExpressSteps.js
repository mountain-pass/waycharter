/**
 * Will start and stop the entire server app with an inmemory database.
 */

var { AfterAll, After, Before, Given, BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber')

setDefaultTimeout(5 * 1000) // 5 seconds

const { wrapExpressV4 } = require('../../index')
const express = wrapExpressV4(require('express'))

const globalWorld = {
  express
}

// BeforeAll({ tags: '@UseExpress' }, function () {
//   // do nothiing
// })

Before({ tags: '@UseExpress' }, function () {
  const world = this
  world.express = globalWorld.express
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
