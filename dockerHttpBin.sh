#!/usr/bin/env sh

set -e

CONTAINER_NAME=httpbin

if [ -n "${GITHUB_ACTION}" ]; then
  echo "Not starting httpbin- GITHUB_ACTION was set"
  exit 0
fi

if [ "$(docker ps -a --filter="name=$CONTAINER_NAME" --filter "status=exited" | grep -w "$CONTAINER_NAME")" ]; then
  echo "httpbin stopped- restarting"
  docker start httpbin
elif [ "$(docker ps -a --filter="name=$CONTAINER_NAME" --filter "status=running" | grep -w "$CONTAINER_NAME")" ]; then
  echo "httpbin already running"
else
  echo "httpbin does not exist- running"
  docker run  -d --name $CONTAINER_NAME -p 4321:80 --platform linux/amd64 kennethreitz/httpbin
fi
