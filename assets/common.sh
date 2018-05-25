#!/bin/bash

set -e

TMPDIR=/tmp

registry=""
scope=""
yarn_args=""

setup_npmrc() {
    if [ -n "$token" ]; then
        token_target="${registry:-https://registry.npmjs.org/}"
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
    if [ -z "$package" ]; then
      echo "invalid payload (missing package)"
      exit 1
    fi
}

setup_resource() {
    registry=$(jq -r '.source.registry.uri // ""' < $payload)
    token=$(jq -r '.source.registry.token // ""' < $payload)
    scope=$(jq -r '.source.scope // ""' < $payload)
    package=$(jq -r '.source.package // ""' < $payload)

    echo "Initializing npmrc..."
    setup_npmrc $1 $2
    setup_package $1
}
