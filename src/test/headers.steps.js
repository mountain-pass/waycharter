import { expect } from 'chai'
import { Given, When, Then } from '@cucumber/cucumber'
import { randomApiPath } from './random-api-path'
import { EndPoint } from '../waycharter'

Given(
  'a waycharter endpoint that varies its response on headers as follows:',
  async function (dataTable) {
    const headersSettings = dataTable.hashes()
    this.currentPath = randomApiPath()
    EndPoint.create({
      router: this.router,
      path: this.currentPath,
      headerParameters: headersSettings.map(setting => setting.Header),
      handler: async ({ requestHeaders, response }) => {
        for (const setting of headersSettings) {
          if (requestHeaders[setting.Header.toLowerCase()] === setting.Value) {
            response.chart({ body: setting.Response })
          }
        }
      }
    })
  }
)

When('we load the resource with the following headers:', async function (
  dataTable
) {
  this.prevResult = this.result
  this.result = await this.waychaser(
    new URL(this.currentPath, this.baseUrl),
    { headers: dataTable.rowsHash() }
  )
  expect(this.result.response.ok).to.be.true()
})

Then('the first response will be {string}', async function (expectedResponse) {
  this.currentResult = this.prevResult
  expect(this.prevResult.content).to.equal(expectedResponse)
})

Then('the second response will be {string}', async function (expectedResponse) {
  this.currentResult = this.result
  expect(this.result.content).to.equal(expectedResponse)
})

Then("it's {string} header will contain", async function (header, dataTable) {
  expect(this.currentResult.response.headers.get(header)).to.equal(
    dataTable
      .raw()[0]
      .map(row => row.toLowerCase())
      .join(', ')
  )
})
