<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  name: 'uberrun'
}
</script>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
@import url('https://use.fontawesome.com/releases/v5.0.2/css/all.css');
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700');

$font-family-sans-serif: 'Source Sans Pro';
$blue: #0B1E4E;

html {
  position: relative;
  min-height: 100%;
}

body {
  color: #0B1E4E;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 1em;
  font-weight: 600;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
