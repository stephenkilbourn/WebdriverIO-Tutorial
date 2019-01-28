# Intro to Automation with WebdriverIO
This intro will walk through using the Webdriver.io testing framework to make your first automation test. It assumes node is already installed on your machine, but it doesn't require any complex coding knowledge.  We will be doing tests on a test website provided by Elemental Selenium called [The-Internet](http://the-internet.herokuapp.com/).

## Configure and Run a Test
To begin, make a directory for your first test. In the terminal:

```$ mkdir webdriverio-test && cd webdriverio-test```

Firefox uses the Gecko engine to render webpages.  Chrome uses a different layout engine called Blink, and Safari uses Webkit.  This means that each browser needs a different driver to be tested in Webdriver.io.   To test in Firefox, you will need the Geckodriver.  In that same test folder that you just created, download and unpack the Geckodriver:

```$ curl -L https://github.com/mozilla/geckodriver/releases/download/v0.21.0/geckodriver-v0.21.0-macos.tar.gz | tar xz```


Next, you will actually install the WebdriverIO software via the NPM package manager:

First, initialize your npm package.json file:

```$ npm init```
- follow the prompts shown in the terminal.  You can leave all entries as default.

Next, you will install the webdriverio package

```$ npm install webdriverio --save-dev```

If you view the package.json file in your webdriverio-test folder, then you will now see webdriverio as a dependency.

You will now write your first web driver test.  Create a file called test.js
```
const { remote } = require('webdriverio');

(async () => {
    const browser = await remote({
        logLevel: 'error',
        path: '/',
        capabilities: {
            browserName: 'firefox'
        }
    });

    await browser.url('http://the-internet.herokuapp.com/');

    const title = await browser.getTitle();
    console.log('Title was: ' + title);

    await browser.deleteSession();
})().catch((e) => console.error(e))
```

To use this test, you will need to start your Geckodriver file in a terminal tab. Ensure that you are still in the directory with the gecko driver file open, and then run:

```$ ./geckodriver --port 4444```

Now, in a second tab, return to your webdriverio-test folder.  You can run your first webdriver test file with node by typing node test.js
You should see your Firefox browser open and then the "The-Internet" website will open.  In the Terminal, the console.log statement from your test.js file will be  output.

## Using the Test Runner
Now, we will learn to use the test runner to run your web driver tests.  Install the @wdio.cli package:

npm i --save-dev @wdio/cli
Once that is installed, you will run the wide configuration utility: `./node_modules/.bin/wdio config`

An interface will help you create this configuration file. Select the default values except for the reporter, select spec and the Level of logging verbosity select trace.

Once the configuration is complete, you will see the wdio.conf.js in the project’s root directory. This file contains much of the configuration for a project’s Webdriver test setup.



Open the wide.conf.js file.  You will see the baseUrl path that you configured as local host: baseUrl: 'http://localhost',. Change that line, and set the local path to be ‘/‘ by inserting the lines:
```
baseUrl: 'http://the-internet.herokuapp.com',
// Override the default path of /wd/hub
path: '/',
```

Webdriver uses the term “Spec”  for the test files.  You will now create a “specs” directory to store test files and then write your first spec.

```mkdir -p ./test/specs```

You will now create your first Spec in that folder.  Create the file named testSpec.js and add the following content.

```
const assert = require('assert');

describe('The-Internet page', () => {
    it('should have the right title', () => {
        browser.url('/');
        const title = browser.getTitle();
        assert.equal(title, 'The Internet');
    });
});
```

Now you can use the test runner to run this spec and any other specs matching your configuration in the wdio.conf.js file by running the command:

``` $ ./node_modules/.bin/wdio wdio.conf.js```

You should see the test begin in your terminal, and then your browser will open and the automated tests will be visibly running. Once the test completes, the results in the "spec" reporter format will be displayed.

To simplify running your tests in the future, you can add a script to your package.json file.  Look for the Scripts section, and add the following:
```
"scripts": {
    "test": "wdio wdio.conf.js"
  },
```

Now, you can run your test by entering npm test in the terminal.

## Change to Chrome Testing Capabilities
You have so far only tested in Firefox with the geckodriver.  To use different browsers, you need to add other drivers and modify your wdio configuration file.  We will add an npm package to now run your tests in Chrome.

First install the chromedriver and the wdio-chromedriver-service packages:

```$ npm install wdio-chromedriver-service chromedriver --save-dev```

Next, open your wdio.conf.js file and modify your capabilities to read:
```
export.config = {
  // port to find chromedriver
  port: 9515, // default
  // ...

	capabilities: [{
        browserName: 'chrome',
        maxInstances: 1,
        }],
```

Look for the section of the wdio.conf file that says services:[] and add the Chromedriver service and below it add the shown settings:
```

   // ...
	services: ['chromedriver'],
    // options
    chromeDriverArgs: ['--port=9515'], // default
    chromeDriverLogs: './',

	// ...
```

Now run your test again:

```$ npm test```
You should see the Chrome browser being opened and tested.  The output of your successful test will be displayed in the terminal

## Adding Babel and Chai configurations
Before we continue to writing some more tests, we will add the Babel compiler. This will allow us to support modern javascript features.  Back in your terminal, run:

$ npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/register
You will then add a small babel configuration file called babel.config.js to your project's root directory:
```
module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                node: 8
            }
        }]
    ]
}
```
Now, In order to support more descriptive and easily readable tests, we will add the Mocha testing framework and the Chai assertion library packages for webdriverIO.

```$ npm install @wdio/mocha-framework chai chai-webdriverio --save-dev```
This will require a change to the wdio.conf.js file to let webdriver take advantage of these tools.  Look for the line that reads: // beforeSession: function (config, capabilities, specs), and replace it with the code:
```
before: function() {
    var chai = require('chai');
    global.expect = chai.expect;
    chai.Should();
}
```
## Explore The Page Object Pattern 
Your initial test loaded the webdriver URL, then saved the Title of the webpage to a constant, and asserted that title was equal to a desired value.  It is possible to write individual tests like this, but as tests suites become larger and more complex, they will become more brittle.  A change on a page's User Interface may break multiple tests. A way to avoid this is by abstracting the details about the elements on the page into separate files called page objects. By doing this, the tests can be written in a more readable format and changes to the UI being tested will only need to be updated in the page object files.  Ideally, anything specific to a page such as the selectors will be in the page object, and not inside a test.

We will begin this by creating our first page object.   First, we will create a pages directory to store our page objects:

```$ mkdir -p ./test/pages```

Now we will create a main page object called page.js in that folder.  This file will look like:

```
export default class Page {
  
    open(path) {
        browser.url(path);
    }
}
```

This is a basic page that other pages can inherit from.  We will now create a login page object. This page will inherit from the base page and contain getter functions for any selectors we will need in our test.

```
import Page from './page';

class LoginPage extends Page {

    get username() { return $('#username'); }
    get password() { return $('#password'); }
    get submitButton() { return $('form button[type="submit"]'); }
    get flash() { return $('#flash'); }
    get headerLinks() { return $$('#header a'); }

    open() {
        super.open('/login');
    }

    submit() {
        this.submitButton.click();
    }

}

export default new LoginPage();
```

Now that we've defined all of the needed selectors for our page, we can write a test spec for it. In your /pages/specs folder, create a file called login.spec.js
```
import { expect } from 'chai';
import LoginPage from '../pages/login.page';

describe('login form', () => {
    it('should deny access with wrong password', () => {
        LoginPage.open();
        LoginPage.username.setValue('New User');
        LoginPage.password.setValue('SuperSecretPassword');
        LoginPage.submit();

        expect(LoginPage.flash.getText()).to.contain('Your username is invalid!');
    });

    it('should allow access with correct credentials', () => {
        LoginPage.open();
        LoginPage.username.setValue('tomsmith');
        LoginPage.password.setValue('SuperSecretPassword!');
        LoginPage.submit();

        expect(LoginPage.flash.getText()).to.contain('You logged into a secure area!');
    });
}); 
```

You should now see both of your specs run in Chrome.

```$ npm test```
