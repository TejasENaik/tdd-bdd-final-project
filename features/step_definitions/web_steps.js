
const {
  When,
  Then,
  BeforeAll,
  AfterAll,
  setDefaultTimeout
} = require('@cucumber/cucumber');

const {
  Builder,
  By,
  until,
  Select
} = require('selenium-webdriver');

const firefox = require('selenium-webdriver/firefox');
const assert = require('assert');

const BASE_URL = 'http://localhost:8080';

let driver;

setDefaultTimeout(60 * 1000);

// Start the browser once before running the scenarios
BeforeAll(async function () {
  const options = new firefox.Options();
  options.addArguments('-headless');

  driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build();
});

// Close the browser after all scenarios
AfterAll(async function () {
  if (driver) {
    await driver.quit();
  }
});

// Get a form field by its ID
async function getField(fieldName) {
  const elementId =
    'product_' + fieldName.toLowerCase().replace(/ /g, '_');

  return driver.findElement(By.id(elementId));
}

// Get a button by its ID
async function getButton(buttonText) {
  const buttonId = buttonText.toLowerCase() + '-btn';
  return driver.findElement(By.id(buttonId));
}

// Visit the home page
When('I visit the {string}', async function (pageName) {
  await driver.get(BASE_URL + '/');
});

// Verify the page title
Then('I should see {string} in the title', async function (expectedTitle) {
  await driver.wait(until.titleContains(expectedTitle), 10000);

  const actualTitle = await driver.getTitle();

  assert.ok(
    actualTitle.includes(expectedTitle),
    `Expected title to include "${expectedTitle}", but got "${actualTitle}"`
  );
});

// Verify text is not present on the page
Then('I should not see {string}', async function (text) {
  const pageSource = await driver.getPageSource();

  assert.ok(
    !pageSource.includes(text),
    `Expected not to see "${text}" on the page`
  );
});

// Set a form field
When('I set the {string} to {string}', async function (fieldName, value) {
  const field = await getField(fieldName);

  await field.clear();
  await field.sendKeys(value);
});

// Select an option from a dropdown
When(
  'I select {string} in the {string} dropdown',
  async function (value, dropdownName) {
    const dropdown = await getField(dropdownName);
    const select = new Select(dropdown);

    await select.selectByVisibleText(value);
  }
);

// Copy a field value for later use
When('I copy the {string} field', async function (fieldName) {
  const field = await getField(fieldName);

  this.copiedId = await field.getAttribute('value');

  assert.ok(
    this.copiedId,
    `Could not copy value from field "${fieldName}"`
  );
});

// Check whether a field is empty
Then('the {string} field should be empty', async function (fieldName) {
  const field = await getField(fieldName);
  const value = await field.getAttribute('value');

  assert.strictEqual(
    value,
    '',
    `Expected field "${fieldName}" to be empty, but it was "${value}"`
  );
});

// Paste the previously copied value
When('I paste the {string} field', async function (fieldName) {
  assert.ok(this.copiedId, 'No ID was copied to paste.');

  const field = await getField(fieldName);

  await field.clear();
  await field.sendKeys(this.copiedId);
});

// Check a text field value
Then(
  'I should see {string} in the {string} field',
  async function (expectedValue, fieldName) {
    const field = await getField(fieldName);

    await driver.wait(until.elementIsVisible(field), 10000);

    const actualValue = await field.getAttribute('value');

    assert.strictEqual(
      actualValue,
      expectedValue,
      `Expected "${expectedValue}" in field "${fieldName}", but got "${actualValue}"`
    );
  }
);

// Check a dropdown's selected value
Then(
  'I should see {string} in the {string} dropdown',
  async function (expectedValue, dropdownName) {
    const dropdown = await getField(dropdownName);
    const select = new Select(dropdown);
    const selectedOption = await select.getFirstSelectedOption();
    const actualValue = await selectedOption.getText();

    assert.strictEqual(
      actualValue,
      expectedValue,
      `Expected "${expectedValue}" in dropdown "${dropdownName}", but got "${actualValue}"`
    );
  }
);

// Change a field value
When('I change {string} to {string}', async function (fieldName, newValue) {
  const field = await getField(fieldName);

  await field.clear();
  await field.sendKeys(newValue);
});

// Press a button
When('I press the {string} button', async function (buttonText) {
  const button = await getButton(buttonText);

  await driver.wait(until.elementIsVisible(button), 10000);
  await driver.wait(until.elementIsEnabled(button), 10000);

  await button.click();
});

// Verify a success or other message
Then(
  'I should see the message {string}',
  async function (expectedMessage) {
    await driver.wait(async function () {
      const pageSource = await driver.getPageSource();
      return pageSource.includes(expectedMessage);
    }, 10000);

    const pageSource = await driver.getPageSource();

    assert.ok(
      pageSource.includes(expectedMessage),
      `Expected message "${expectedMessage}" to appear on the page`
    );
  }
);

