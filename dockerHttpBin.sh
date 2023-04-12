#!/usr/bin/env sh

set -e

CONTAINER_NAME=httpbin

if [[ ! -z "${GITHUB_ACTION}" ]]; then
  echo "Not starting httpbin- GITHUB_ACTION was set"
  exit 0
fi

if [[ $(docker ps -a --filter="name=$CONTAINER_NAME" --filter "status=exited" | grep -w "$CONTAINER_NAME") ]]; then
  docker start httpbin
elif [[ $(docker ps -a --filter="name=$CONTAINER_NAME" --filter "status=running" | grep -w "$CONTAINER_NAME") ]]; then
  echo "httpbin running"
else
  docker run  -d --rm --name httpbin -p 4321:80 --platform linux/amd64 kennethreitz/httpbin
fi
