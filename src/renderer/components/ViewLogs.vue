<template>
  <div>
    <div class="container-fluid">
      <div class="row">
        <div class="col py-3 px-3">
          <pre class="log-container">
            {{ logContent }}
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import log from 'electron-log'
import fs from 'fs'

export default {
  data () {
    return {
      logContent: null
    }
  },
  mounted () {
    setInterval(() => {
      this.logContent = fs.readFileSync(log.transports.file.findLogPath(), 'utf8')
    }, 1000)
  }
}
</script>
<style>
.log-container {
  width: 100%;
  height: 95vh;
  padding: 15px;
  font-size: 12px;
  background:#e3e3e3;
  overflow: scroll;
}
</style>
