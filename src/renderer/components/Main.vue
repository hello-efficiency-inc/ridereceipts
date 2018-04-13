<template>
  <div>
    <div class="splash">
      <div class="wrap-content">
        <img id="logo" src="static/ride-receipts.svg" width="450" alt="Ride Receipts">
        <p>Download your rideshare receipts and invoices automatically.</p>
        <br/>
        <p>
          <router-link :to="{ name: 'uber' }" class="btn btn-lg btn-started" tag="button">
            Uber
          </router-link>
        </p>
        <p>OR</p>
        <p>
          <router-link :to="{ name: 'lyft' }" class="btn btn-lg btn-started" tag="button">
            Lyft
          </router-link>
      </p>
      </div>
    </div>
  </div>
</template>
