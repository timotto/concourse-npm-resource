#!/bin/bash

set -e

registry=""
scope=""
yarn_args=""

setup_npmrc() {
    registry=$(jq -r '.source.registry.uri // ""' < $payload)
    token=$(jq -r '.source.registry.token // ""' < $payload)
    scope=$(jq -r '.source.registry.scope // ""' < $payload)

    if [ -n "$token" ]; then
        token_target="${registry:-https://npm.timotto.io/repository/my-npm/}"
        token_target="${token_target/http*:/}"
        
        echo "${token_target}:_authToken=$token" \
        >> $HOME/.npmrc

        echo "  Using token for authentication"
    fi

    if [ -n "$scope" ]; then
        if [ -z "$registry" ]; then
          echo "  invalid payload (defined scope but missing registry)"
          exit 1
        fi

        echo "@${scope}:registry=${registry}" \
        >> $HOME/.npmrc

        echo "  Scope limited to @$scope"
    fi

    if [ -n "$registry" ]; then
        if [ -z "$scope" ]; then
            yarn_args="--registry $registry "
        fi
        echo "  Registry is $registry"
    fi
}

setup_package() {
    package=$(jq -r '.source.package // ""' < $payload)

    if [ -z "$package" ]; then
      echo "invalid payload (missing package)"
      exit 1
    fi
}

setup_resource() {
    echo "Initializing npmrc..."
    setup_npmrc $1 $2
    setup_package $1
}
