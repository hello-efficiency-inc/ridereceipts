<template>
    <div class="form-wrap">
      <div class="form-wrap__title">
        <h1>über receipt</h1>
      </div>
      <form class="form-wrap__form form--fullscreen">
        <ol class="form-wrap__fields">
          <li>
							<label class="form-wraps__fields-label fs-anim-upper" for="q1">What's your email?</label>
							<input class="fs-anim-lower" id="q1" name="q1" type="text" placeholder="Email address" required/>
						</li>
            <li>
  							<label class="form-wraps__fields-label fs-anim-upper" for="q1">What's your password?</label>
  							<input class="fs-anim-lower" id="q1" name="q1" type="password" placeholder="Password" required/>
  					</li>
            <li class="current">
  							<label class="form-wraps__fields-label fs-anim-upper" for="q1">Please enter your verification code that is sent to you via SMS</label>
  							<input class="fs-anim-lower" id="q1" name="q1" type="text" placeholder="Verification code" required/>
  					</li>
        </ol>
      </form>
      <div class="form-wrap__controls">
          <button class="form-wrap__submit" type="submit">Continue</button>
      </div>
    </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  // import jetpack from 'fs-jetpack'
  import puppeteer from 'puppeteer'

  export default {
    name: 'landing-page',
    components: {SystemInformation},
    data () {
      return {
        test: 'test'
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      start: async () => {
        console.log(this.$electron)
        const browser = await puppeteer.launch()
        const self = await this
        const page = await browser.newPage()
        await page.goto('https://auth.uber.com/login?next_url=https://riders.uber.com')
        await page.screenshot({path: `${await self.$electron.app.remote.getPath('desktop')}/screenshot.png`})
        browser.close()
      }
    }
  }
</script>
<style lang="scss">
.form-wrap {
  position: relative;
  width: 100%;
  height: 100%;

  .form-wrap__submit {
    display: block;
    float: right;
  }
}

.form-wrap__title {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 40px;
  width: 100%;

  h1 {
    font-weight: 700;
    font-size:  2.5em;
    text-transform: uppercase;
    margin: 0;
  }
}

.form-wrap__form {
  position: relative;
  text-align: left;
  font-size: 2.5em;
}

.form--fullscreen {
  max-width: 960px;
  top: 32%;
  margin: 0 auto;
  width: 70%;

  .form-wrap__fields > li {
    position: absolute;
    width: 100%;
  }
}

.form-wrap__fields {
  position: relative;
  margin: 0 auto;
  padding: 0;
  top: 0;
  list-style: none;

  & > li.current {
    visibility: visible;
  }

  & > li {
    position: relative;
    z-index: 1;
    margin: 0;
    padding: 0;
    border: none;
    visibility: hidden;
  }

  & > li label {
    position: relative;
  }

  & > li label.form-wraps__fields-label {
    display: inline-block;
    padding: 0 5px 1em 0;
    font-weight: 700;
    pointer-events: none;
  }

  /* placeholder */
& input::-webkit-input-placeholder,
& textarea::-webkit-input-placeholder {
	color: rgba(0,0,0,0.3);
}

& input:-moz-placeholder,
& textarea:-moz-placeholder {
	color: rgba(0,0,0,0.3);
}

& input::-moz-placeholder,
& textarea::-moz-placeholder {
	color: rgba(0,0,0,0.3);
}

& input:-ms-input-placeholder,
& textarea:-ms-input-placeholder {
	color: rgba(0,0,0,0.3);
}

/* Hide placeholder when focused in Webkit browsers */
& input:focus::-webkit-input-placeholder {
	color: transparent;
}

}

.form-wrap__fields input {
  display: block;
  margin: 0;
  padding: 0 0 0.15em;
  width: 100%;
  border: none;
  border-bottom: 2px solid rgba(0,0,0,02);
  background-color: transparent;
  color: #0B1E4E;
  text-overflow: ellipsis;
  font-weight: bold;
  font-size: 1.5em;
  border-radius: 0;

  &:focus {
    box-shadow: none;
    background: none;
    outline: none;
  }
}

button.form-wrap__submit {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 0 40px 60px 0;
  background: none;
  font-size: 1.25rem;
  padding: 0.6em 1.5em;
  border: 3px solid #0B1E4E;
  border-radius: 40px;
  font-weight: 700;
  color: rgba(0,0,0,1);
  transition: all 0.25s ease-in;
  cursor: pointer;

  &:hover,
  &:focus {
    background: #0B1E4E;
    color: white;
    outline: none;
    box-shadow: none;
  }

  &:after {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    line-height: 3;
    background: transparent;
    text-align: center;
    color: black;
    content: 'or press ENTER';
    font-size: 0.65em;
    pointer-events: none;
  }
}

.form--show-next {
  animation: animMoveUpFromDown 0.4s both;
}

@keyframes animMoveUpFromDown {
	from { transform: translateY(100%); }
	to { transform: translateY(0); }
}
</style>
