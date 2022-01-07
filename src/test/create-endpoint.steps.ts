import { expect } from 'chai'
import { When, Then } from '@cucumber/cucumber'
import { randomApiPath } from './random-api-path'
// import { PendingError } from '@windyroad/cucumber-js-throwables'
import { EndPoint } from '../waycharter'

When('we create a simple WayCharter endpoint', async function () {
  this.endpoint = EndPoint.create({
    router: this.router,
    path: randomApiPath(),
    handler: ({ response }) => {
      response.chart({ body: 'hello ' })
    }
  })
})

When('we create a WayCharter endpoint returning the body', async function (
  documentString
) {
  this.endpoint = EndPoint.create({
    router: this.router,
    path: randomApiPath(),
    handler: ({ response }) => {
      response.chart({
        body: JSON.parse(documentString)
      })
    }
  })
})

When(
  'we create a static WayCharter endpoint returning the body',
  async function (documentString) {
    this.endpoint = EndPoint.createStatic({
      router: this.router,
      path: randomApiPath(),
      body: JSON.parse(documentString)
    })
  }
)

When('we send a request to that endpoint', async function () {
  this.response = await this.waychaser(
    new URL(this.endpoint.path(), this.baseUrl)
  )
})

Then('we will get a successful response', async function () {
  expect(this.response.response.ok).to.be.true('response error')
})

Then('the response will have a {string} operation', async function (
  relationship
) {
  expect(this.response.ops.find(relationship)).to.not.be.undefined(
    `cannot find '${relationship}' op`
  )
})

Then('the response will contain the body', async function (documentString) {
  const body = this.response.content
  expect(body).to.deep.equal(JSON.parse(documentString))
})

Then('the {string} operation will return the same response', async function (
  relationship
) {
  this.previousResponse = this.response
  this.response = await this.previousResponse.ops.find(relationship).invoke()
  expect(this.response.response.ok).to.be.true('response error')
  expect(this.response.url).to.equal(this.previousResponse.url)
})
