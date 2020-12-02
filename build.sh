#!/usr/bin/env bash

set -e

function checkDir() {
  dir=$1
  if [[ ! -d "$dir" ]]; then
    echo "$dir does not exist"
    exit 1
  fi
}

function compileDir() {
  local dir=$1
  checkDir "$dir"
  echo "$dir"
  cd "$dir"
  tsc --build || {
    cd - >/dev/null
    exit 1
  }
  cd - >/dev/null
}

function compile() {
  local dir=$1 # e.g. http4t-core
  local tests="$dir/test"

  compileDir "$dir/src"
  compileDir "$tests"

  cd "$tests" >/dev/null
  yarn run test || {
    cd - >/dev/null
    exit 1
  }
  yarn run test:browser || {
    cd - >/dev/null
    exit 1
  }
  cd - >/dev/null
}

compile http4t-core
compile http4t-node
compile http4t-browser
compile http4t-result
compile http4t-bidi
compile http4t-bidi-eg
