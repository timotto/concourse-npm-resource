# Testing

Testing uses cucumber-js, and requires a private npm registry to test against.

## Running tests manually

```Bash
cd test
npm install
docker build .. -t npm-res-test && DOCKER_IMAGE=npm-res-test:latest TEST_REGISTRY= CORRECT_CREDENTIALS= INCORRECT_CREDENTIALS=123 npm test
```

Prefix the command with  `NORMRF=true` to avoid removing the temp test volume directory

## Running private repo tests manually
<!-- TODO: create a docker compose config for this? run it in github actions? -->
```Bash
cd test
npm install

export DOCKER_IMAGE=npm-res-test:latest
# use your default docker bridge, usually 172.17.0.1
DOCKER_NET=172.17.0.1
export TEST_REGISTRY=http://$DOCKER_NET:4873/

docker run -d --name npm-res-test-registry -p 4873:4873 verdaccio/verdaccio
# create a user, i would just use Username:test Password:test Email: test@example.com
npm adduser --registry:$TEST_REGISTRY
# obtain the authtoken
export CORRECT_CREDENTIALS=$(grep $DOCKER_NET ~/.npmrc | sed -r 's/.*:_authToken="([^"]+)"/\1/')
export INCORRECT_CREDENTIALS=123

# Most of the private repo tests are disabled by default and can be re-enabled by explicitly passing `features/*.*feature`
# repeat as needed
docker build .. -t npm-res-test && npm test -- features/*.*feature

# or maybe just run a specific test:
docker build .. -t npm-res-test && npm test -- features/publish_a_private_package.xfeature --name "Uploading a package to a private registry$"

# ... clean up
docker container rm npm-res-test-registry --force
```

**Note:** It appears that some tests expect different responses from the npm registry compared to what verdaccio returns? Not all tests will run properly in the above manner.
