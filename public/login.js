import b from './js/b.js'
import auth from './js/auth.js'
import log from './js/log.js'
import dialog from './widgets/dialog.js'
import { getParam } from './js/util.js'

const submitButton = b('#login .submit-button')
const userB = b('#username-input', {
  oninput: (e) => {
    submitButton.disabled = userB.value.length === 0 || passB.value.length === 0
  },
})
const passB = b('#password-input', {
  oninput: (e) => {
    submitButton.disabled = userB.value.length === 0 || passB.value.length === 0
  },
  onkeypress: (e) => {
    if (e.key === 'Enter' && !submitButton.disabled) {
      submitButton.click()
    }
  },
})

const errorB = b('#error', { innerText: getParam('message') })

dialog('#login', {
  submit: 'Submit',
  hideCancel: true,
  submitDisabled: true,
  async onsubmit() {
    const body = {
      username: userB.value,
      password: passB.value,
    }
    try {
      const token = await auth.json('/login', {
        body,
        method: 'POST',
        return: true,
      })
      if (token.err) {
        errorB.innerText = token.err
        return true
      }

      localStorage.setItem('token', token.token)
      window.location.href = getParam('from', '/')
    } catch (ex) {
      log.error('An error occurred on login', ex)
      errorB.innerText =
        'An error occurred on login. Check your username and password'
      return true
    }
  },
}).showModal()