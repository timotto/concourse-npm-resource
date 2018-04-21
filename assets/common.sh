#!/bin/bash
set -e

setup_aptkey() {
    payload=$1
    key_url=$(jq -r '.source.key_url // ""' < $payload)

    if [ -z "$key_url" ]; then
        echo "invalid payload (missing key_url)"
        exit 1
    fi
    
    curl -sL "$key_url" | apt-key add -
}

setup_apt() {
    payload=$1
    repository=$(jq -r '.source.repository // ""' < $payload)

    if [ -z "$repository" ]; then
        echo "invalid payload (missing repository)"
        exit 1
    fi

    echo "$repository" > /apt.list
    apt-get \
        -o Dir::Etc::sourcelist=/apt.list \
        update
}

setup_resource() {
    true
    # echo "Initializing apt-key..."
    # setup_aptkey $1 $2
    # echo "Initializing apt..."
    # setup_apt $1
}
