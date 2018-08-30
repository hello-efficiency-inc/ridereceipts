import qs from 'qs'
import axios from 'axios'
import { OUTLOOK_CLIENT_ID, GOOGLE_CLIENT_ID, OUTLOOK_CLIENT_SECRET } from '../config'

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_REDIRECT_URI = 'http://localhost'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GOOGLE_SCOPE = 'profile email https://www.googleapis.com/auth/gmail.readonly'

const OUTLOOK_AUTHORIZATION_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
const OUTLOOK_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const OUTLOOK_REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'
const OUTLOOK_SCOPE = 'openid profile User.Read Mail.Read'

const cryptObj = window.crypto

export default {
  guid () {
    const buf = new Uint16Array(8)
    cryptObj.getRandomValues(buf)
    function s4 (num) {
      let ret = num.toString(16)
      while (ret.length < 4) {
        ret = '0' + ret
      }
      return ret
    }
    return s4(buf[0]) + s4(buf[1]) + '-' + s4(buf[2]) + '-' + s4(buf[3]) + '-' +
      s4(buf[4]) + '-' + s4(buf[5]) + s4(buf[6]) + s4(buf[7])
  },
  buildAuthUrl (provider) {
    const authUrl = provider === 'google' ? GOOGLE_AUTHORIZATION_URL : OUTLOOK_AUTHORIZATION_URL

    const urlParams = {
      response_type: 'code',
      redirect_uri: provider === 'google' ? GOOGLE_REDIRECT_URI : OUTLOOK_REDIRECT_URI,
      client_id: provider === 'google' ? GOOGLE_CLIENT_ID : OUTLOOK_CLIENT_ID,
      client_secret: provider !== 'google' ? OUTLOOK_CLIENT_SECRET : '',
      state: this.guid(),
      nonce: this.guid(),
      scope: provider === 'google' ? GOOGLE_SCOPE : OUTLOOK_SCOPE
    }
    return `${authUrl}?${qs.stringify(urlParams)}`
  },

  async fetchGoogleProfile (provider, token) {
    const response = await axios.get(GOOGLE_PROFILE_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data
  },

  async fetchToken (provider, code) {
    const tokenUrl = provider === 'google' ? GOOGLE_TOKEN_URL : OUTLOOK_TOKEN_URL
    const response = await axios.post(tokenUrl, qs.stringify({
      code,
      client_id: provider === 'google' ? GOOGLE_CLIENT_ID : OUTLOOK_CLIENT_ID,
      redirect_uri: provider === 'google' ? GOOGLE_REDIRECT_URI : OUTLOOK_REDIRECT_URI,
      grant_type: 'authorization_code'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.data
  }
}
