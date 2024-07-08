import auth from '/js/auth.js'
import b from '/js/b.js'
import config from '/config.js'
import { relativeBetweenDates } from '/shared/util.js'
import dialog from '/widgets/dialog.js'
import toast from '/widgets/toast.js'
import ws from '/js/ws.js'
import * as util from '/js/util.js'

function getToken() {
  return localStorage.getItem('token')
}

b('#logout-page-nav-item', {
  onclick: async () => {
    const token = getToken()
    await auth.jsonToast('logging out.', '/logout', {
      body: { token },
      return: true,
    })
    localStorage.removeItem('token')
    util.redirect('/login.html', 'You have successfully logged out')
  },
})

let running
b('#bot-running', {
  onclick(e) {
    e.preventDefault()
    dialog('#confirm-bot', {
      submit: 'Yes',
      cancel: 'No',
      title: `${running ? 'Disable' : 'Enable'} Bot`,
      body: `Are you sure you want to ${
        running ? 'disable' : 'enable'
      } the bot?`,
      onsubmit() {
        ws.bot.sendJSON('toggling bot activation', 'toggleBotRunning')
      },
    }).showModal()
  },
})

const navMenuB = b('#nav-menu')
const navMenuButtonB = b('#nav-menu-button', {
  toggle(e) {
    e.preventDefault()
    e.stopPropagation()
    navMenuB.cls('shown')
    navMenuButtonB.cls('rotated')
  },
  onclick(e) {
    this.toggle(e)
    const docClick = (e) => {
      if (e.target && e.target.classList.contains('nav-item')) {
        return
      }
      if (navMenuB.classList.contains('shown')) {
        this.toggle(e)
        document.removeEventListener('click', docClick)
        return
      }
    }
    document.addEventListener('click', docClick)
  },
})

const runningB = b('#bot-running-status')
const lastRunB = b('#bot-lastrun-status')
const successB = b('#bot-success-status')

class BotHandler {
  errorToast = null
  botLastRun(data) {
    if (data.success === null) {
      successB.innerText = 'UNKNOWN'
    } else {
      successB.innerText = data.success ? 'SUCCESS' : 'ERROR'
    }

    successB.cls('green', 'red', data.success !== null)

    if (data.time === null) {
      lastRunB.innerText = 'UNKNOWN'
    } else {
      lastRunB.innerText = relativeBetweenDates(data.time)
    }

    lastRunB.cls('green', 'red', data.time !== null)
  }
  botRunning(data) {
    running = data.running
    runningB.innerText = data.running ? 'RUNNING' : 'STOPPED'
    runningB.cls('green', 'red', data.running)
  }
  closeToast() {
    if (this.errorToast) {
      this.errorToast.remove()
      this.errorToast = null
    }
  }
  onopen() {
    this.closeToast()
  }
  onclose() {
    if (!this.errorToast) {
      this.errorToast = toast(
        'Could not connect to server.  Website functionality will not work.',
        '#toasts',
        true,
      )
    }
  }
}

async function validateToken() {
  const token = getToken()
  if (!token) {
    util.redirect('/login.html')
  }

  const resp = await auth.jsonToast('validating login', '/validate', {
    body: { token },
    return: true,
  })
  if (resp.message !== 'ok') {
    util.redirect('/login.html', { message: 'Your session has expired' })
  }
}

await validateToken()
setInterval(validateToken, 30_000)

ws.start('bot', config.wsPort, new BotHandler())