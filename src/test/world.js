import {
  PendingError,
  stepDefinitionWrapper
} from '@windyroad/cucumber-js-throwables'
import {
  setDefinitionFunctionWrapper,
  setWorldConstructor,
  Before,
  BeforeAll,
  After,
  AfterAll,
  setDefaultTimeout
} from '@cucumber/cucumber'
import chai from 'chai'
import dirtyChai from 'dirty-chai'
import logger from '../util/logger'
import chaiAsPromised from 'chai-as-promised'
import { WayCharter } from '../waycharter'
import { WayChaser } from '@mountainpass/waychaser'
import { startServer, app, stopServer, getNewRouter } from './fakes/server'
import { API_PORT } from './config'

chai.use(chaiAsPromised)
chai.use(dirtyChai)

global.expect = chai.expect
global.PendingError = PendingError

const DEFAULT_STEP_TIMEOUT = 90 * 1000

const baseUrl = `http://localhost:${API_PORT}`

// const baseUrl = `http://localhost:${API_PORT}`

BeforeAll({ timeout: 240000 }, async function () {
  logger.info('BEGIN BeforeAll', Date.now())
  logger.info('Starting server...')
  await startServer()

  logger.info('END BeforeAll', Date.now())
})

function world () {
  logger.info('BEGIN world')
  // reset the fake API server, so we can set new routes
  this.router = getNewRouter()
  this.baseUrl = baseUrl
  this.app = app
  this.waycharter = new WayCharter()
  this.router.use(this.waycharter.router)
  this.waychaser = new WayChaser()

  logger.info('END world')
  return ''
}

Before({ timeout: 240000 }, async function (scenario) {
  logger.info('BEGIN Before')
  logger.info('END Before')
})

After({ timeout: 600000 }, async function (scenario) {
  logger.info('BEGIN After')
  logger.info('%s: - %s', scenario.pickle.name, scenario.result.status)
  logger.info('END After')
})

AfterAll({ timeout: 600000 }, async function () {
  logger.debug('BEGIN AfterAll')
  stopServer()
  logger.debug('END AfterAll')
})

setWorldConstructor(world)

setDefinitionFunctionWrapper(stepDefinitionWrapper)

setDefaultTimeout(DEFAULT_STEP_TIMEOUT)