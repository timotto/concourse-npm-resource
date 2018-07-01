const { Given, Then, When, BeforeAll, Before, After, setDefaultTimeout } = require('cucumber');
const assert = require('assert');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const mktemp = require('mktemp');

setDefaultTimeout(30000);

const unitUnderTest = process.env['DOCKER_IMAGE'] || 'timotto/concourse-npm-resource:latest';

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

Before(async () => {
  const base = path.join(process.cwd(), 'tmp');
  await fs.mkdirs(base);
  this.tempDir = await mktemp.createDir(path.join(base, 'npm-resource-test-volume-XXXXXXXX'));
  this.input = {};
});

After(async () =>
  fs.remove(this.tempDir));

Given(/^a source configuration for package "([^"]*)"$/, async packageName =>
  this.input.source = sourceDefinition(packageName));

Given(/^a source configuration for private package "(.*)" with (.*) credentials$/, async (privatePackageName, credentialSet) =>
  this.input.source = sourceDefinition(privatePackageName, undefined, { uri: testRegistry, token: credentials[credentialSet] }));

Given(/^a get step with skip_download: (.*) params$/, skipDownload =>
  this.input.params = { skip_download: skipDownload === 'true' });

Given(/^a known version "(.*)" for the resource$/, version =>
  this.input.version = { version });

When(/^the resource is checked$/, async () =>
  runResource('check'));

When(/^the resource is fetched$/, async () =>
  runResource('in'));

Then(/^an error is returned$/, () =>
  assert.notEqual(this.result.code, 0));

Then(/^version "([^"]*)" is returned$/, expectedVersion => {
  assert.strictEqual(this.result.code, 0);
  const j = JSON.parse(this.result.stdout);

  assert.notEqual(j, undefined);
  assert.strictEqual(j.length, 1);
  assert.strictEqual(j[0].version, expectedVersion);
});

Then(/^the content of file "(.*)" is "(.*)"$/, async (filename, content) => {
  const expectedContent = `${content}\n`;
  const actualContent = await fs.readFile(path.join(this.tempDir, filename), 'utf-8');
  assert.strictEqual(actualContent, expectedContent);
});

Then(/^the file "(.*)" does exist$/, async filename =>
  assert.strictEqual(await findTempFile(filename), true));

Then(/^the file "(.*)" does not exist$/, async filename =>
  assert.strictEqual(await findTempFile(filename), false));

const findTempFile = async filename =>
  fs.pathExists(path.join(this.tempDir, filename));

const sourceDefinition = (packageName, scope = undefined, registry = undefined) => ({
  package: packageName,
  scope,
  registry
});

const testRunner = process.env['TEST_RUNNER'] || 'docker';

const runResource = async command =>
  testRunner === 'docker'
    ? runDockerResource(command)
    : runShellResource(command);

const runShellResource = async command => {
  const localScriptPath = path.join('/', 'opt', 'resource', command);
  return spawnIn(
    localScriptPath,
    [this.tempDir],
    JSON.stringify(this.input))
    .then(result =>
      this.result = result);
}

const runDockerResource = async command =>
  spawnIn('docker', [
    'run', '--rm', '-i',
    '-v', `${this.tempDir}:/test-volume`,
    unitUnderTest,
    `/opt/resource/${command}`,
    '/test-volume'
  ], JSON.stringify(this.input))
    .then(result => this.result = result);

const spawnIn = async (command, args, input = undefined) =>
  new Promise(resolve => {
    const result = { stdout: "", stderr: "" };
    const x = spawn(command, args);
    x.stdout.on('data', data => result.stdout += data);
    x.stderr.on('data', data => result.stderr += data);
    x.on('exit', code => resolve(({ code, ...result })));
    if (input) {
      x.stdin.write(input);
      x.stdin.end();
    }
  });

const assertEnv = key => {
  if (process.env[key] === undefined) throw `${key} is undefined`;
  return process.env[key];
}
