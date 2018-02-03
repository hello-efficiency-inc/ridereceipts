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

</style>
