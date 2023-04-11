#!/usr/bin/env sh

set -e

CONTAINER_NAME=httpbin

if [[ $(docker ps -a --filter="name=$CONTAINER_NAME" --filter "status=exited" | grep -w "$CONTAINER_NAME") ]]; then
  docker start httpbin
elif [[ $(docker ps -a --filter="name=$CONTAINER_NAME" --filter "status=running" | grep -w "$CONTAINER_NAME") ]]; then
  echo "httpbin running"
else
  docker run  -d --rm --name httpbin -p 4321:80 --platform linux/amd64 kennethreitz/httpbin
fi
