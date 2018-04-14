<template>
  <div id="app">
    <transition name="fade">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import 'bootstrap-vue/dist/bootstrap-vue.css'
import jetpack from 'fs-jetpack'
import os from 'os'

export default {
  name: 'uberrun',
  mounted () {
    const documentDir = jetpack.cwd(this.$electron.remote.app.getPath('documents'))
    const platform = os.platform()
    const useDataDir = jetpack.cwd(this.$electron.remote.app.getAppPath()).cwd(this.$electron.remote.app.getPath('desktop'))

    let exec
    switch (platform) {
      case 'darwin':
        exec = `${useDataDir.path()}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
        break
      case 'linux':
        exec = `${useDataDir.path()}/chrome-linux/chrome`
        break
      case 'win32':
        if (os.arch() === 'x64') {
          exec = `${useDataDir.path()}/chrome-win32/chrome.exe`
        }
        exec = `${useDataDir.path()}/chrome-win32/chrome.exe`
        break
      case 'win64':
        exec = `${useDataDir.path()}/chrome-win32/chrome.exe`
        break
    }

    if (!this.$electronstore.get('invoicePath')) {
      this.$electronstore.set('invoicePath', `${documentDir.path()}/Ride Receipts/`)
    }

    if (!this.$electronstore.get('chromePath')) {
      this.$electronstore.set('chromePath', exec)
    }
  }
}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import url('https://use.fontawesome.com/releases/v5.0.2/css/all.css');
@import url('https://fonts.googleapis.com/css?family=Nunito:400,600,700,800');

$font-family-sans-serif: 'Nunito';
$blue: #0B1E4E;

html {
  position: relative;
  min-height: 100%;
}

body {
  color: #0B1E4E;
  font-family: 'Nunito', sans-serif;
  font-size: 1em;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background-color: rgba(215,0,208,0.75);
  color: white;
  text-shadow: none
}

.vue-simple-spinner {
  border-color: #d800d0 rgb(238, 238, 238) rgb(238, 238, 238) !important;
}

.bs-popover-bottom {
  top: 2px !important;
}

.popover .arrow {
  margin: 0.04rem 0.3rem;
}

.bs-popover-bottom .arrow::before, .bs-popover-auto[x-placement^="bottom"] .arrow::before {
    border-bottom-color: rgba(0, 0, 0, 0.10);
}

.bs-popover-bottom .arrow::after, .bs-popover-auto[x-placement^="bottom"] .arrow::after {
  z-index:50000;
}

.popover {
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.50);
  border: 1px solid #E4E4E4;
  width: 370px;
  max-width: 100%;
  top:30px;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 10px;
  padding-top: 10px;
  border-radius: 0;
  font-weight: 400;
  font-size: 14px;
  font-family: 'Nunito', sans-serif;

  p {
    margin-bottom: 5px;
  }

  p.text-right {
        margin-top: 15px;
            margin-bottom: 5px;
  }

  a {
    font-weight: 800;
    font-size: 12px;
    color: #0012B9;
  }
}

.popover-header {
  padding-top: 20px;
  padding-bottom: 0px;
  font-family: 'Nunito', sans-serif;
  background: none !important;
  border-bottom: 0px;
  font-weight: 800;
  color: black;
}

.input-group {
  width: 80%;
  margin: 0 auto;
}

.invalid-feedback {
  width: 80%;
  margin:10px auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease-in;
}
.fade-enter, .fade-leave-active {
  opacity: 0
}

.navbar-brand {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  img {
    height: auto;
    margin-left: 30px;
    margin-top: 30px;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

.password-lock {
  position: relative;
    top: -35px;
    bottom: 0;
    left: 86%;
}

.splash {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;

  .wrap-content {
    width: 360px;
  }

  img {
    height: 180px;
    margin-bottom: 40px;
  }

  p.offline {
    font-size: 20px;
    color: red;
  }

  p {
    font-size: 20px;
    line-height: 26px;
    color: #0A11BA;
  }
}

.btn-started {
  background: #d800d0;
  color: white;
  border-radius: 30px;
  width: auto;
  height: 52px;
  padding-left:40px;
  padding-right: 40px;
  text-transform: uppercase;
  font-size: 15px;
  font-weight: 700;

  &:focus:enabled {
    background: white;
  }

  &:hover:enabled {
    background: #0012B9;
    color: white;
  }
}

.bg-transparent {
  background: transparent;
}

.submit-container {
  position: absolute;
  width: 96%;
  bottom: 10px;
  height: 100px;
  padding-top: 10px;
}

.form--container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  min-height: 70vh;
  padding: 3.5rem 9rem;

  label:not(.form-check-label) {
    font-size: 32px;
    width: 100%;
    text-align: center;
    font-weight: 800;
    margin-bottom: 42px;
    margin-top: -5px;
    line-height: 42px;

    color: black;
  }

  .form-check-label {
    display: block;
    margin-bottom: 10px;
    font-size: 24px;
    line-height: 32px;
    color: black;
    padding-left: 15px;
  }

  input[type="radio"] {
    margin-top: 8px;
    margin-left: -30px;
    width: 20px;
    height: 20px;
  }

  input {
    padding-left: 0;
    outline: none;
    border: none;
    border-bottom: 2px solid rgba(0, 0, 0, 1);
    background-color: transparent;
    border-radius: 0px;
    padding-bottom: 0;
    font-size: 1.9em;
    color: black;
    caret-color: #0012B9;
    text-overflow: ellipsis;
    transition: all 0.5s ease;
    width: 80%;
    margin: 0 auto;

    &:focus {
      border-image:  linear-gradient(to right, rgba(0,41,221,1) 0%, rgba(215,1,208,1) 100%);
      border-image-slice: 1;
      box-shadow: none;
      background: none;
      outline: none;
    }
  }

  p.invoice-link {
    font-size: 1.5em;
  }
}

.progress {
  background-color: #D9D9D9;
  height: 16px;
  border-radius: 1rem;
  width: 80%;
  margin: 10px auto;
}

.progress-bar {
  background: linear-gradient(to right, rgba(0,41,221,1) 0%, rgba(215,1,208,1) 100%);
}

.continue-btn {
  button {
    cursor: pointer;
  }
  p {
    margin-top: 5px;
  }

  .btn--submit-start {
    position: absolute;
    font-size: 24px;
    right: 10px;
    /* Rounded button: */
    background: #FFFFFF;
    border-radius: 100px;
    height: 52px;
    padding-left: 20px;
    padding-right: 20px;
    border: 0px;
    font-weight: 800;
    color: black;
    text-transform: uppercase;

    &:focus {
      background: #fff;
    }
    &:hover {
      box-shadow: 1px 1px 4px 2px rgba(160,160,160,0.50);
    }

    .arrow {
      margin-left: 10px;
      top: -1px;
      position:relative;
    }
  }

  .btn--submit {
    position: absolute;
    font-size: 24px;
    right: 10px;
    /* Rounded button: */
    background: #FFFFFF;
    border-radius: 100px;
    height: 52px;
    width: 178px;
    border: 0px;
    font-weight: 800;
    color: black;
    text-transform: uppercase;

    &:focus {
      background: #FFFFFF;
    }

    &:hover {
      box-shadow: 1px 1px 4px 2px rgba(160,160,160,0.50);
    }

    .arrow {
      margin-left: 10px;
      top: -1px;
      position:relative;
    }
  }
}

.fa-question-circle {
  color: #898989;
  font-size: 18px;
  top: -10px;
  position: relative;
  cursor: pointer;
}

.progress-tip {
  position: absolute;
  bottom: 10px;
  left: 50%;
}

/* Loading indicator */
.loading {
  position: relative;
  margin:0 auto;
  width: 62px;    /* diameter */
  height: 62px;    /* diameter */
}
.inner, .loading:after {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
/* Mask */
.loading:after {
  content:" ";
  margin: 10%;    /* stroke width */
  border-radius: 100%;
  background: #fff;    /* container background */
}
/* Spinning gradients */
.inner {
  animation-duration: 1s;    /* speed */
  -webkit-animation-duration: 1s;    /* speed */
  animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
  animation-timing-function: linear;
  -webkit-animation-timing-function: linear;
}
.inner {
  animation-name: rotate-inner;
  -webkit-animation-name: rotate-inner;
}
/* Halfs */
.inner:before, .inner:after {
  position: absolute;
  top: 0;
  bottom: 0;
  content:" ";
}
/* Left half */
.inner:before {
  left: 0;
  right: 50%;
  border-radius: 72px 0 0 72px;    /* diameter */
}
/* Right half */
.inner:after {
  left: 50%;
  right: 0;
  border-radius: 0 72px 72px 0;    /* diameter */
}
/* Half gradients */
.inner:before {
  background-image: linear-gradient(to bottom, #0029DD 0%, #D700D0 100%);
}
.inner:after {
    background-image: linear-gradient(to bottom, #ffffff 0%, #D8D8D8 100%);
}

/* Spinning animations */

@keyframes rotate-inner {
  0% {
    transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
  }
}
@-webkit-keyframes rotate-inner {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

#passwordFeedback {
  margin-top: -20px;
}

.donation-msg {
  margin-top: 6.5em;
  width: 500px;

  p {
    color: black;
  }

  a {
    color: #0012B9;
    padding-bottom: 1px;
    text-decoration: none;

    &:hover {
      border-bottom: 1px solid #0012B9;
    }
  }
}

.form-control.is-valid {
  border-color: #000;
  color: black;

  &:focus {
    outline: 0;
    box-shadow: none;
  }
}
</style>
