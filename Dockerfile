FROM node:alpine

RUN apk --update --no-cache add bash jq

USER node:node
ADD --chown=node:node assets /opt/resource
