import logger from '../logger'
import { createServer } from 'http'
import { API_PORT } from '../config'

import express from 'express'
import multer from 'multer'

const upload = multer({})

export const app = express()
app.use(express.json()) // support json encoded bodies
app.use(express.urlencoded({ extended: true })) // support url encoded bodies
app.use(upload.none()) // support multi-part bodies


let router

export function getNewRouter() {
  router = express.Router()
  return router
}

app.use(function (request, response, next) {
  router(request, response, next)
})

export let server

export function stopServer() {
  if (server !== undefined) {
    server.close()
  }
}

export function startServer() {
  stopServer()
  app.use(function (error, request, response, next) {
    console.log('eh', error)
    if (response.headersSent) {
      return next(error)
    }
    console.error(error)
    response.status(500)
    response.json({})
  })
  server = createServer(app)
  return new Promise(resolve => {
    server.listen(API_PORT, function () {
      logger.info(
        '📡  Server is listening on port %d ( http://localhost:%d ) ',
        API_PORT,
        API_PORT
      )
      resolve(app)
    })
  })
}
