<template>
  <div>
    <div class="jumbotron splash">
      <div class="container">
        <div class="row">
          <div class="col">
            <h2>Settings</h2>
            <br/>
            <form>
              <div class="form-group">
                <p> Choose folder where you want to save Invoice files.</p>
                <button class="btn btn-lg btn-started" @click="openDialog('invoice')">Choose Folder</button>
                <p class="path-chosen"><strong>Selected Path:</strong> <pre>{{ invoicePath }}</pre></p>
              </div>
              <br/>
              <div class="form-group">
                <p> Please set path to Chromium / Chrome Canary browser <i id="info" class="far fa-fw fa-1x fa-question-circle"></i></p>
                <b-popover ref="popover" target="info" triggers="click" placement="bottom">
                   <template slot="title">Note</template>
                   You can download Chromium from <a class="js-external-link" href="https://download-chromium.appspot.com/">here</a> or download Chrome Canary
                   from <a class="js-external-link" href="https://www.google.com/chrome/browser/canary.html">here</a> to run this app.
                   <br/>
                   <br/>
                </b-popover>
                <button class="btn btn-lg btn-started" @click="openDialog('chrome')">Choose File</button>
                <p class="path-chosen"><strong>Selected Path:</strong> <pre>{{ chromePath }}</pre></p>
              </div>
              <div class="form-group">
                <br/>
                <button class="btn btn-lg btn-started" @click="saveSettings">Save Settings</button>
                <button class="btn btn-lg btn-started" @click="goBack">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      invoicePath: null,
      chromePath: null
    }
  },
  created () {
    this.invoicePath = this.$electronstore.get('invoicePath')
    this.chromePath = this.$electronstore.get('chromePath')
  },
  methods: {
    goBack () {
      this.$router.push({ path: '/' })
    },
    saveSettings () {
      if (this.invoicePath !== null) {
        this.$electronstore.set('invoicePath', this.invoicePath)
      } else {
        this.$electronstore.set('invoicePath', null)
      }

      if (this.chromePath.endsWith('Google Chrome Canary.app')) {
        this.$electronstore.set('chromePath', `${this.chromePath}/Contents/MacOS/Google Chrome Canary`)
      } else if (this.chromePath.endsWith('Chromium.app')) {
        this.$electronstore.set('chromePath', `${this.chromePath}/Contents/MacOS/Chromium`)
      } else {
        this.$electronstore.set('chromePath', this.chromePath)
      }

      this.$router.push({ path: '/' })
    },
    openDialog (type) {
      if (type === 'invoice') {
        this.invoicePath = this.$electron.remote.dialog.showOpenDialog({
          buttonLabel: 'Select',
          properties: ['openDirectory', 'createDirectory']
        })[0]
      }

      if (type === 'chrome') {
        this.chromePath = this.$electron.remote.dialog.showOpenDialog({
          buttonLabel: 'Choose',
          properties: ['openFile'],
          filters: [
            { name: 'Chromium', extensions: ['app'] }
          ]
        })[0]
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.splash {
  background: white;
  min-height: 100vh;
  padding-top: 3rem;

  h2 {
    font-size: 2.5rem;
    color: #000;
    font-weight: 700;
    margin-top: 0;
  }

  p {
    font-size: 1.2rem;
  }

  .path-chosen {
    font-size: 1rem;
  }
}

#info {
  font-size: 1rem;
}

.btn-started {
  background: #d800d0;
  color: white;
  border-radius: 30px;
  width: 142px;
  height: 42px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 15px;

  &:focus:enabled {
    background: #0012B9;
  }

  &:hover:enabled {
    background: #0012B9;
    color: white;
  }
}
</style>
