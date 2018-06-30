const {Given, Then, When, BeforeAll, setDefaultTimeout} = require('cucumber');
const assert = require('assert');
const {sourceDefinition} = require('../../src/pipeline-fixture');
const {spawnIn} = require('../../src/resource-runner');

const assertEnv = key => {
  if (process.env[key] === undefined) throw `${key} is undefined`;
  return process.env[key];
}
setDefaultTimeout(30000);

const unitUnderTest = process.env['DOCKER_IMAGE'] || 'timotto/concourse-npm-resource:latest';
console.log(`DOCKER_IMAGE=${unitUnderTest}`);

let testRegistry;
let credentials;
BeforeAll(() => {
  testRegistry = assertEnv('TEST_REGISTRY');
  credentials = {
    correct: assertEnv('CORRECT_CREDENTIALS'),
    incorrect: assertEnv('INCORRECT_CREDENTIALS'),
    empty: "",
    missing: undefined
  }
});

Given(/^a source configuration for package "([^"]*)"$/, async packageName => {
  this['source'] = sourceDefinition(packageName);
});

Given(/^a source configuration for private package "(.*)" with (.*) credentials$/, async (privatePackageName,credentialSet) =>
  this.source = sourceDefinition(privatePackageName, undefined, {uri: testRegistry, token: credentials[credentialSet]}));

When(/^the resource is checked$/, async () => {
  const command = 'docker';
  const args = ['run','-i','--rm',unitUnderTest,'/opt/resource/check'];
  const input = JSON.stringify({source: this['source'].source});

  this['result'] = await spawnIn(command, args, input);
});

Then(/^version "([^"]*)" is returned$/, expectedVersion => {
  assert.strictEqual(this.result.code, 0);
  const j = JSON.parse(this.result.stdout);

  assert.notEqual(j, undefined);
  assert.strictEqual(j.length, 1);
  assert.strictEqual(j[0].version, expectedVersion);
});

Then(/^an error is returned$/, () => assert.notEqual(this.result.code, 0, JSON.stringify({source: this.source, result: this.result})));

