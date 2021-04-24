import { expect } from 'chai'
import { Given, When, Then } from '@cucumber/cucumber'
import { randomApiPath } from './random-api-path'

Given(
  'a waycharter resource that varies its response on headers as follows:',
  async function (dataTable) {
    console.log(dataTable.hashes())
    const headersSettings = dataTable.hashes()
    this.currentPath = randomApiPath()
    this.waycharter.registerResourceType({
      path: this.currentPath,
      loaderVaries: headersSettings.map(setting => setting.Header),
      loader: async (parameters, headers) => {
        console.log({ headers })
        for (const setting of headersSettings) {
          if (headers[setting.Header.toLowerCase()] === setting.Value) {
            return { body: setting.Response }
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
  this.result = await this.waychaser.load(
    new URL(this.currentPath, this.baseUrl),
    { headers: dataTable.rowsHash() }
  )
  expect(this.result.response.ok).to.be.true()
})

Then('the first response will be {string}', async function (expectedResponse) {
  this.currentResult = this.prevResult
  expect(await this.prevResult.body()).to.equal(expectedResponse)
})

Then('the second response will be {string}', async function (expectedResponse) {
  this.currentResult = this.result
  expect(await this.result.body()).to.equal(expectedResponse)
})

Then("it's {string} header will contain", async function (header, dataTable) {
  expect(this.currentResult.response.headers.get(header)).to.equal(
    dataTable
      .raw()[0]
      .map(row => row.toLowerCase())
      .join(', ')
  )
})
