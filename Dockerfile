FROM node:alpine AS resource

RUN apk --update --no-cache add bash jq

ADD assets /opt/resource

FROM resource AS test

ADD test /test

WORKDIR /test

ARG TEST_REGISTRY
ARG INCORRECT_CREDENTIALS
ARG CORRECT_CREDENTIALS

RUN if [ -n "$TEST_REGISTRY" ] && [ -n "$INCORRECT_CREDENTIALS" ] && [ -n "$CORRECT_CREDENTIALS" ] ; \
    then npm install \
    && TEST_RUNNER=shell npm run test ; \
    fi
    
FROM resource
