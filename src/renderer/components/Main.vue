<template>
  <div class="main-splash">
    <transition name="fade" mode="out-in">
      <div class="wrap-content" v-if="downloaded">
        <img id="logo" src="static/ride-receipts.svg" alt="Ride Receipts" key="mainpage">
        <p>Download your rideshare receipts and<br/>invoices automatically.</p>
        <p class="choose-app">Choose an app to get started:</p>
        <p class="text-center">
          <router-link :to="{ name: 'uber' }" class="btn btn-lg main-btn" tag="button">
            Uber
          </router-link>
          <span class="option-text">or</span>
          <router-link :to="{ name: 'lyft' }" class="btn btn-lg main-btn" tag="button">
            Lyft
          </router-link>
        </p>
      </div>
      <div class="wrap-content" v-if="!downloaded" key="progress">
        <div class="row">
          <div class="col-8 mx-auto">
            <p class="sign-in-text mb-5 text-center">Downloading Chromium ...</p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import chrome from '../services/puppeteer_download'

export default {
  data () {
    return {
      progress: null,
      downloaded: false
    }
  },
  mounted () {
    const self = this
    chrome((progress, finished) => {
      self.progress = progress
      self.downloaded = finished
    })
  }
}
</script>
<style lang="scss">
.main-splash {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  .wrap-content {
    width: 450px;
  }

  .choose-app {
    color: #000;
    font-weight: 800;
  }

  p {
    font-size: 20px;
    color: #0A11BA;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
  }
}

.option-text {
  font-size: 20px;
  font-weight: 800;
  margin-left: 20px;
  margin-right: 20px;
  color: black;
}

.main-btn {
  display:inline-block;
  border: none;
  position: relative;
  background: transparent;
  padding-top: 15px;
  padding-left: 58px;
  padding-right: 58px;
  padding-bottom: 15px;
  border-radius: 100px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 15px;

  &:hover {
    background: #D700D0;
    color: #fff;

    &:before {
      background: none;
    }
  }

  &:before,
  &:after {
    content: ' ';
    position: absolute;
    border-radius: 100px;
  }

  &:before {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -2;
    background: #0029dd;
    background: -moz-linear-gradient(top, #d700d0 0%, #0029dd 100%);
    background: -webkit-linear-gradient(top, #d700d0 0%, #0029dd 100%);
    background: linear-gradient(to bottom, #d700d0 0%,#0029dd 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#d700d0', endColorstr='#0029dd',GradientType=0 );
  }

  &:after {
    top: 2px;
    bottom: 2px;
    left: 2px;
    right: 2px;
    background-color: #fff;
    z-index: -1;
    opacity: 1;
    transition: all 0.6s ease-in-out;
  }
}
</style>
