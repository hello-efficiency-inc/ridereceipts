<template>
  <div class="form-wrap">
    <div class="form-wrap__title">
      <h1>Uber Invoice</h1>
    </div>
    <form class="form-wrap__form form--fullscreen">
      <div v-if="loading" class="spinner">
        <spinner></spinner>
      </div>
      <ol :class="{'form--show-next': currentForm }"
      class="form-wrap__fields">
      <li :class="{ current: form === 'EMAIL', 'form--show': form === 'EMAIL' }">
        <label class="form-wraps__fields-label fs-anim-upper" for="email">What's your email?</label>
        <input class="fs-anim-lower" id="email" @keyup.enter="submitForm()" v-model="email" name="email"
        type="text"
        placeholder="Email address" required/>
      </li>
      <li :class="{ current: form === 'PASSWORD', 'form--show': form === 'PASSWORD' }">
        <label class="form-wraps__fields-label fs-anim-upper" for="password">What's your password?</label>
        <input class="fs-anim-lower" id='password' @keyup.enter="submitForm()" v-model="password"
        name="password" type="password"
        placeholder="Password" required/>
      </li>
      <li :class="{ current: form === 'VERIFICATION', 'form--show': form === 'VERIFICATION' }">
        <label class="form-wraps__fields-label fs-anim-upper" for="verification">Please enter your verification code that is sent to you via SMS</label>
        <input class="fs-anim-lower" id="verification" @keyup.enter="submitForm()" v-model="verification"
        name="verification"
        type="text" placeholder="Verification code"
        required/>
      </li>
      <li :class="{ current: form === 'FILTER_CONFIRM', 'form--show': form === 'FILTER_CONFIRM' }">
        <label class="form-wraps__fields-label fs-anim-upper" for="filter">Do you want to filter your trips ?</label>
        <label class="form-wrap__radio" for="yes">
          Yes
          <input @keyup.enter="submitForm()" v-model="filter_confirm" id="yes" value="true" type="radio" required/>
          <div class="radio__indicator"></div>
        </label>
        <label class="form-wrap__radio" for="no">
          No
          <input @keyup.enter="submitForm()" v-model="filter_confirm" id="no" value="false" type="radio" required/>
          <div class="radio__indicator"></div>
        </label>
      </li>
      <li :class="{ current: form === 'FILTER_OPTION', 'form--show': form === 'FILTER_OPTION' }">
        <label class="form-wraps__fields-label fs-anim-upper" for="filter">Do you want to filter your trips ?</label>
        <label v-for="filter in filters" class="form-wrap__radio" :for="filter.id">
          {{ filter.name }}
          <input @keyup.enter="submitForm()" v-model="filter_option" :id="filter.id" :value="filter.name" type="radio" required/>
          <div class="radio__indicator"></div>
        </label>
      </li>
      <li :class="{ current: form === 'ERROR', 'form--show': form === 'ERROR' }">
        <label class="form-wraps__fields-label fs-anim-upper" for="q1">Oops seems like your IP Address is banned temporary. Please try again later.</label>
      </li>
      <li :class="{ current: form === 'CHROME_NOT_FOUND', 'form--show': form === 'CHROME_NOT_FOUND' }">
        <label class="form-wraps__fields-label fs-anim-upper" for="q1">Oops seems you don't have chrome executable path in place on desktop. Please download it from <a
          href="https://download-chromium.appspot.com/">here</a>
          and extract zip file to a folder on your desktop.</label>
        </li>
      </ol>
    </form>
    <div v-if="!loading">
      <div v-if="!errorButton" class="form-wrap__controls">
        <button class="form-wrap__submit" @click="submitForm()">Continue</button>
      </div>
      <div v-if="errorButton" class="form-wrap__controls">
        <button class="form-wrap__submit" @click="startAgain()">Start Again</button>
      </div>
    </div>
  </div>
</template>

<script>
import puppeteer from '../services/puppeteer'
import Spinner from 'vue-simple-spinner'

export default {
  name: 'landing-page',
  data () {
    return {
      spinnerColor: '#0B1E4E',
      form: null,
      email: null,
      password: null,
      verification: null,
      filters: null,
      filter_option: null,
      filter_confirm: null,
      download: null
    }
  },
  components: {
    Spinner
  },
  computed: {
    loading () {
      return this.form === null
    },
    currentForm () {
      return this.form === 'PASSWORD' || 'VERIFICATION' || 'FILTER_CONFIRM' || 'FILTER_OPTION' || 'ERROR'
    },
    errorButton () {
      if (this.form === 'ERROR') {
        return true
      }
      if (this.form === 'CHROME_NOT_FOUND') {
        return true
      }
      return false
    }
  },
  mounted () {
    puppeteer()

    this.$electron.ipcRenderer.on('form', (event, data) => {
      this.setCurrentForm(data)
    })
    this.$electron.ipcRenderer.on('filters', (event, data) => {
      this.filters = data
    })
  },
  methods: {
    setCurrentForm (data) {
      this.form = data
    },
    startAgain () {
      this.form = null
      this.email = null
      this.password = null
      this.verification = null
      this.filters = null
      this.filter_options = null
      this.filter_confirm = null
      puppeteer()
    },
    submitForm () {
      switch (this.form) {
        case 'EMAIL':
          this.$electron.ipcRenderer.send('email', this.email)
          break
        case 'PASSWORD':
          this.$electron.ipcRenderer.send('password', this.password)
          break
        case 'VERIFICATION':
          this.$electron.ipcRenderer.send('code', this.verification)
          break
        case 'FILTER_CONFIRM':
          this.$electron.ipcRenderer.send('filter_confirm', this.filter_confirm)
          break
        case 'FILTER_OPTION':
          this.$electron.ipcRenderer.send('filter_option', this.filter_option)
      }
    }
  }
}
</script>
<style lang="scss">
.form-wrap {
  position: relative;
  width: 100%;
  height: 100%;

  .form-wrap__submit {
    display: block;
    float: right;
  }
}

.form-wrap__title {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 40px;
  width: 100%;

  h1 {
    font-weight: 700;
    font-size: 2.5em;
    text-transform: uppercase;
    margin: 0;
  }
}

.form-wrap__form {
  position: relative;
  text-align: left;
  font-size: 2.5em;
}

.form--fullscreen {
  max-width: 960px;
  top: 32%;
  margin: 0 auto;
  width: 70%;

  .form-wrap__fields > li {
    position: absolute;
    width: 100%;
  }
}

.form-wrap__fields {
  position: relative;
  margin: 0 auto;
  padding: 0;
  top: 0;
  list-style: none;

  & > li.current {
    visibility: visible;
  }

  & > li {
    position: relative;
    z-index: 1;
    margin: 0;
    padding: 0;
    border: none;
    visibility: hidden;
  }

  & > li label {
    position: relative;
  }

  & > li label.form-wraps__fields-label {
    display: inline-block;
    padding: 0 5px 1em 0;
    font-weight: 700;
    pointer-events: none;
  }

  /* placeholder */
  & input::-webkit-input-placeholder,
  & textarea::-webkit-input-placeholder {
    color: rgba(0, 0, 0, 0.3);
  }

  & input:-moz-placeholder,
  & textarea:-moz-placeholder {
    color: rgba(0, 0, 0, 0.3);
  }

  & input::-moz-placeholder,
  & textarea::-moz-placeholder {
    color: rgba(0, 0, 0, 0.3);
  }

  & input:-ms-input-placeholder,
  & textarea:-ms-input-placeholder {
    color: rgba(0, 0, 0, 0.3);
  }

  /* Hide placeholder when focused in Webkit browsers */
  & input:focus::-webkit-input-placeholder {
    color: transparent;
  }

}

.form-wrap__fields input {
  display: block;
  margin: 0;
  padding: 0 0 0.15em;
  width: 100%;
  border: none;
  border-bottom: 2px solid rgba(0, 0, 0, 02);
  background-color: transparent;
  color: #0B1E4E;
  text-overflow: ellipsis;
  font-weight: bold;
  font-size: 1.5em;
  border-radius: 0;

  &:focus {
    box-shadow: none;
    background: none;
    outline: none;
  }
}

button.form-wrap__submit {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 0 40px 60px 0;
  background: none;
  font-size: 1.25rem;
  padding: 0.6em 1.5em;
  border: 3px solid #0B1E4E;
  border-radius: 40px;
  font-weight: 700;
  color: rgba(0, 0, 0, 1);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #0B1E4E;
    color: white;
    outline: none;
    box-shadow: none;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:after {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    line-height: 3;
    background: transparent;
    text-align: center;
    color: black;
    content: 'or press ENTER';
    font-size: 0.65em;
    pointer-events: none;
  }
}

.form--show {
  animation: animFadeIn 0.5s;
}

@keyframes animFadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.form--show-next {
  animation: animMoveUpFromDown 0.4s both;
}

@keyframes animMoveUpFromDown {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.form-wrap__radio {
  display: block;
  position: relative;
  padding-left: 30px;
  margin-bottom: 15px;
  cursor: pointer;
  font-size: 24px;
  font-weight: 400;
}

.form-wrap__radio input {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

.form-wrap__radio input:checked ~ .radio__indicator {
  background: #2aa1c0;

  &:after {
    display: block;
  }
}

.radio__indicator {
  position: absolute;
  top: 7px;
  left: 0;
  height: 20px;
  width: 20px;
  background: #e6e6e6;
  border-radius: 50%;

  &:after {
    content: '';
    display: none;
    left: 7px;
    top: 7px;
    height: 6px;
    width: 6px;
    border-radius: 50%;
    background: #fff;
    position: relative;
  }
}

.spinner {
  padding-top:100px;
  position: absolute;
  top: 60%;
  margin: 0 auto;
  width: 100%;
}
</style>
