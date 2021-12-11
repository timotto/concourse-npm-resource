#!/bin/bash

set -e

TMPDIR=/tmp

registry=""
scope=""
yarn_args=""

cleanup_npmrc() {
    sed -i 's/_authToken=.*$/_authToken=xxxx/g' $HOME/.npmrc
}

setup_npmrc() {
    trap cleanup_npmrc EXIT
    echo -n > $HOME/.npmrc
    
    if [ -n "$token" ]; then
        token_target="${registry:-https://registry.npmjs.org/}"
        # use a regex match to work for both http and https while not skipping a head
        # to the port number if you are running a local registry on an alternate port
        [[ "$token_target" =~ (http|https):(.*) ]] && token_target="${BASH_REMATCH[2]}"

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
        echo "  Registry is $registry"
        if [ -z "$scope" ]; then
            npm config set registry $registry
            echo "  Registry change is global"
        fi
    fi
    for i in ${!additional_registries[@]}; do
        local prefix=
        if [ -n "${additional_scopes[$i]}" ]; then
            prefix="@${additional_scopes[$i]}:"
        fi
        echo "${prefix}registry=${additional_registries[$i]}" \
        >> $HOME/.npmrc
    done
}

setup_package() {
    if [ -z "$package" ]; then
      echo "invalid payload (missing package)"
      exit 1
    fi
}

setup_resource() {
    registry=$(jq -r '.source.registry.uri // ""' <<< $payload)
    token=$(jq -r '.source.registry.token // ""' <<< $payload)
    scope=$(jq -r '.source.scope // ""' <<< $payload)
    package=$(jq -r '.source.package // ""' <<< $payload)

    # associative array for extra registries
    additional_registries=( )
    additional_scopes=( )
    for row in $(jq -c 'if (.source.additional_registries != null) then .source.additional_registries[] else empty end' <<< $payload); do
        additional_registries+=("$(jq -r '.uri' <<< $row)")
        additional_scopes+=("$(jq -r 'if (.scope != null) then .scope else empty end' <<< $row)")
    done
    echo "Initializing npmrc..."
    setup_npmrc
    setup_package
}
