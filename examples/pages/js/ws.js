import logger from './log.js'
import { isHTTPS, toastErrOp } from './util.js'

const log = logger.clone('WEBSOCKET')

const sockets = {
  start(name, port, ...handlers) {
    const protocol = isHTTPS() ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${location.hostname}:${port}`)
    sockets[name] = socket
    socket.handlers = handlers
    socket.onopen = function (e) {
      log.debug(`{${name}} Connection established`, e)
      for (const handler of socket.handlers) {
        if (handler.onopen) {
          handler.onopen(e)
        }
      }
    }
    socket.sendJSON = (name, type, data) => {
      try {
        return socket.send(JSON.stringify({ type, data }))
      } catch (ex) {
        log.error(`An error occurred sending data to server ${name}`, data)
        toastErrOp(name, ex)
      }
    }

    socket.onmessage = function (e) {
      log.debug(`websocket ${name} msg`, e.data)
      const msg = JSON.parse(e.data)
      for (const handler of socket.handlers) {
        if (handler[msg.type]) {
          handler[msg.type](msg.data)
        } else {
          log.debug(
            `{${name}} No method for ${msg.type} in handler ${handler.id}`,
          )
        }
      }
    }

    socket.onclose = function (e) {
      if (e.wasClean) {
        log.info(
          `{${name}} Connection closed cleanly, code=${e.code} reason=${e.reason}`,
        )
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        log.error(`{${name}} Connection died`, e)
      }
      for (const handler of socket.handlers) {
        if (handler.onclose) {
          handler.onclose(e)
        }
      }
      log.debug(`Retrying websocket connection in 1s`)
      setTimeout(() => sockets.start(name, port, ...socket.handlers), 1000)
    }

    socket.onerror = function (error) {
      log.error(`[error] {${name}} Socket Error`, error)
      for (const handler of socket.handlers) {
        if (handler.onerror) {
          handler.onerror(e)
        }
      }
      socket.close()
    }

    return socket
  },
}

export default sockets