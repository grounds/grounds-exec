#!/bin/bash
set -e

source "./scripts/env.sh"

bin="./node_modules/.bin"

$bin/istanbul cover $bin/_mocha -- $TEST_OPTS

if [ $CODECLIMATE_REPO_TOKEN ]; then
  $bin/codeclimate < coverage/lcov.info
fi
