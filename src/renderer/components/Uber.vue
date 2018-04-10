<template>
  <div>
    <form v-on:submit.prevent="submitForm" class="wrapper" v-if="form !== null">
      <nav class="navbar navbar-light bg-transparent">
        <div class="navbar-brand">
          <img src="static/uber-run.svg" alt="Uber Run" width="110">
        </div>
      </nav>
      <transition name="fade">
        <div class="jumbotron form--container" v-if="form === 'EMAIL'" key="email">
          <div class="form-group">
            <label for="email">Enter the email address associated with your Uber account</label>
            <b-form-input id="email"
            v-model.trim="fields.email"
            type="text"
            :readonly="!emailError"
            :state="emailError"
            aria-describedby="email emailFeedback"
            placeholder="Email Address"></b-form-input>
            <b-form-invalid-feedback id="emailFeedback">
              'Oops! There is no account associated with this email address.'
            </b-form-invalid-feedback>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'CAPTCHA'" key="captcha">
          <div class="form-group">
          <label>Verifying your account. This takes approximately 1 minute.</label>
          <br/>
          <div class="loading">
            <div class="inner"></div>
          </div>
        </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'PASSWORD'" key="password">
          <div class="form-group">
            <label for="password">Enter the password for your Uber<br/>account <i id="user-password" class="far fa-2x fa-question-circle"></i></label>
            <b-form-input
              id="password"
              v-model.trim="fields.password"
              type="password"
              :readonly="!passError"
              :state="passError"
              aria-describedby="password passwordFeeback"
              placeholder="Password">
            </b-form-input>
            <img class="password-lock" src="static/password-lock.svg">
            <b-form-invalid-feedback id="passwordFeedback">
              Oops! That is not the correct password. Unfortunately you will have to start again because the app does
              not store any information.
            </b-form-invalid-feedback>
          </div>
          <b-popover  ref="popover" target="user-password" triggers="click focus" placement="bottom">
             <template slot="title">Security</template>
             Uber Run is an automation app that tells the Chromium browser to download your invoices and receipts. This app has no database; therefore, it does not store your login credentials, personal information or any other data. It is as secure as logging into your Uber account through your browser.
             <br/>
             <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#security">Learn more</a></p>
          </b-popover>
        </div>
        <div class="jumbotron form--container" v-if="form === 'VERIFICATION'" key="verification">
          <div class="form-group">
            <label for="verification">Enter the Uber verification code sent to you via SMS <i id="verification-code" class="far fa-2x fa-question-circle"></i></label>
            <b-popover ref="popover" target="verification-code" triggers="click focus" placement="bottom">
               <template slot="title">Security</template>
               Uber Run is an automation app that tells the Chromium browser to download your invoices and receipts. This app has no database; therefore, it does not store your login credentials, personal information or any other data. It is as secure as logging into your Uber account through your browser.
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#security">Learn more</a></p>
            </b-popover>
            <b-form-input
              id="verification"
              v-model.trim="fields.verification_code"
              type="text"
              size="4"
              :readonly="!veriError"
              :state="veriError"
              aria-describedby="verification verificationFeeback"
              placeholder="Verification code"></b-form-input>
              <b-form-invalid-feedback id="verificationFeedback">
                Oops! That is not the correct verification code. Unfortunately you will have to start again because the app does not store any information.
              </b-form-invalid-feedback>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'FILTER_OPTION'" key="filteroption">
          <div class="form-group">
            <label>Which invoices/receipts would you like to <br/> download? <i id="filter-option" class="far fa-2x fa-question-circle"></i></label>
            <b-popover ref="popover" target="filter-option" triggers="click" placement="bottom">
               <template slot="title">Note</template>
               Uber Run can only download the invoices and/or receipts that exist in your Uber account.
               <br/>
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#limitations">Learn more</a></p>
            </b-popover>
            <div class="row">
              <div class="col">
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio"  v-model="fields.filter_option" name="filter" value="previousyear">
                    Previous year
                  </label>
                </div>
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio" v-model="fields.filter_option" name="filter" value="currentyear">
                    Current year
                  </label>
                </div>
              </div>
              <div class="col">
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio" v-model="fields.filter_option" name="filter" value="lastthreemonths">
                    Last 3 months
                  </label>
                </div>
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio" v-model="fields.filter_option" name="filter" value="lastmonth">
                    Last month
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'GENERATE_LINKS'" key="generatelinks">
          <div class="form-group">
            <label>Checking your Uber account for all invoices/receipts within the time frame you selected. This could take 10 mins or more.</label>
            <br/>
            <div class="loading">
              <div class="inner"></div>
            </div>
            <p class="progress-tip text-center"><i id="progress-checking" class="far fa-2x fa-question-circle"></i></p>
            <b-popover ref="popover" target="progress-checking" triggers="click" placement="top">
               <template slot="title">Speed</template>
               We purposely check your account slowly to prevent the Uber website from knowing you are running a script.
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#limitation">Learn more</a></p>
            </b-popover>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'INVOICE_COUNT'" key="invoicecounts">
          <div class="form-group">
            <label>{{ downloadingMessage }}</label>
            <br/>
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{ width: percent + '%' }" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <p class="progress-tip text-center"><i id="progress-tip" class="far fa-2x fa-question-circle"></i></p>
            <b-popover  ref="popover" target="progress-tip" triggers="click" placement="top">
               <template slot="title">Speed</template>
               We purposely check your account slowly to prevent the Uber website from knowing you are running a script.
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#limitation">Learn more</a></p>
            </b-popover>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'DOWNLOADED'" key="downloaded">
          <div class="form-group">
            <label v-if="invoiceCount > 0">Success! All invoices have been<br/> downloaded for you.</label>
            <p v-if="invoiceCount > 0" class="text-center"><button type="button" @click.stop.prevent="openInvoiceFolder()" class="btn btn-lg btn-started">View Invoices</button></p>
            <label v-if="invoiceCount === 0">{{ downloadingMessage }}</label>
            <p v-if="invoiceCount === 0" class="text-center"><button type="button" @click.stop.prevent="startAgain()" class="btn btn-lg btn-started">Start Again</button></p>
            <div class="donation-msg">
              <p class="text-center">Did you find this app useful? If so, please make a donation so we can keep maintaining Uber Run.</p>
              <p class="text-center"><a href="https://paypal.me/UberRun" class="js-external-link">Click here to donate</a></p>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'ERROR'" key="error">
          <div class="form-group">
            <label>It seems like your IP address is temporarily banned. Please try again later.</label>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'error-captcha'" key="error-captcha">
          <div class="form-group">
            <label>Uber Run failed to verify your account. Please try again.</label>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'CHROME_NOT_FOUND'" key="chromenotfound">
          <div class="form-group">
            <label>
              It seems like you don't have Chromium installed. Please download it from
              <a class="js-external-link" href="https://download-chromium.appspot.com/">here</a>. Place the file on your desktop and unzip it.
            </label>
          </div>
        </div>
      </transition>
      <div class="submit-container" v-if="!disableButton">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12">
              <div class="continue-btn float-right" v-if="!hideButton">
                <button type="submit" v-if="!errorButton" class="btn btn-outline-primary btn--submit">Next<img class="arrow" src="static/next-arrow.svg"></button>
                <button type="button" v-if="errorButton" @keyup.enter="startForm()" @click="startAgain()" class="btn btn-outline-primary btn--submit-start">Start Again<img class="arrow" src="static/next-arrow.svg"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
