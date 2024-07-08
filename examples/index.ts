import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()
import * as globals from './server/globals.js'

import express from 'express'
import morganBody from 'morgan-body'
import * as http from 'http'
import * as https from 'https'
import { init as startBot, processCourse } from './server/bot.js'
import { startBrowser, closeBrowser } from './server/scrape.js'
import { startLR, uuid, getCert } from './server/util.js'
import log from './server/log.js'
import api from './server/api.js'
import pages from './server/pages.js'
import auth from './server/auth.js'

const app = globals.set('app', express())
const cert = getCert()
const server = cert ? https.createServer(cert, app) : http.createServer({}, app)

if (globals.isDev) {
  app.set('json spaces', 2)

  if (globals.isLR) {
    startLR(app, globals.outDir)
  }
}

app.use('/', (req, _, next) => {
  // @ts-ignore
  req.id = uuid()
  next()
})

app.use('/', pages)

app.use(express.static(globals.outDir))
app.use(express.json())

morganBody(app, {
  logRequestId: true,
  logReqUserAgent: true,
  logRequestBody: globals.isVerbose,
  logAllReqHeader: false, //globals.isVerbose,
  logResponseBody: globals.isVerbose,
  logAllResHeader: false, //globals.isVerbose,
})

app.use('/api', api)
app.use('/auth', auth)

async function start() {
  if (globals.startPuppeteer) {
    log.info('Starting Puppeteer')
    await startBrowser()
  }

  log.info('Starting Bot')
  startBot(globals.startBot)

  log.info('Starting Server')
  server.listen(globals.port, () => {
    const msg = JSON.stringify(globals.config, null, 2)
    const protocol = cert ? 'https' : 'http'
    log.info(
      `[server]: Server is running at ${protocol}://localhost:${globals.port}\n\nCONFIG:\n\n${msg}`,
    )
  })
}

process.on('SIGTERM', async () => {
  if (globals.startPuppeteer) {
    log.info('Closing puppeteer')
    await closeBrowser()
  }
  log.info('Process TERMed')
  process.exit()
})

if (process.argv.length > 2) {
  const course = process.argv[2]
  log.info(`Running bot for course ${course}`)
  await processCourse(course)
  log.info(`Bot completed for course ${course}`)
  process.exit(0)
}
start()
