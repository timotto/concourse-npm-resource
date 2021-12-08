# Testing

Testing uses cucumber-js, and requires a private npm registry to test against.

## Running tests manually

```
docker build . -t npm-res-test
cd test
npm install
DOCKER_IMAGE=npm-res-test:latest TEST_REGISTRY= CORRECT_CREDENTIALS= INCORRECT_CREDENTIALS=123 npm test
```

Prefix the command with  `NORMRF=true` to avoid removing the temp test volume directory

Most of the tests are disabled by default and can be re-enabled by setting the extension to `.feature` instead of `.xfeature`

<!--TODO: document how to run the other tests?-->
