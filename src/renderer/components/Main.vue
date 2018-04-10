<template>
  <div>
    <div class="splash">
      <div class="wrap-content">
        <img id="logo" src="static/uber-run.svg" alt="Uber Run">
        <p>Download your Uber invoices and receipts automatically.</p>
        <br/>
        <p><router-link :to="{ name: 'uber' }" class="btn btn-lg btn-started" tag="button">Get Started with Uber</router-link></p>
        <p>OR</p>
        <p><router-link :to="{ name: 'lyft' }" class="btn btn-lg btn-started" tag="button">Get Started with Lyft</router-link></p>
      </div>
    </div>
  </div>
</template>
