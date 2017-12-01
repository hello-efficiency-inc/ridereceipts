<template>
  <div id="app">
    <div class="container">
    <router-view></router-view>
  </div>
  </div>
</template>

<script>
  export default {
    name: 'getreceipt'
  }
</script>

<style lang="scss">
  @import 'node_modules/normalize-scss/sass/normalize';
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700');

  #app,
  html,
  body,
  .container {
    height: 100%;
  }

  body {
    background-image: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
    color: #0B1E4E;
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 1em;
    font-weight: 400;
    overflow: hidden;
    overflow-y: scroll;
    min-height: 700px;
    -webkit-font-smoothing: antialiased;
	  -moz-osx-font-smoothing: grayscale;
  }
</style>
