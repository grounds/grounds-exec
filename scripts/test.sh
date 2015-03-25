#!/bin/sh
set -e

bin="./node_modules/.bin"

if [ $CODECLIMATE_REPO_TOKEN ]; then
  $bin/istanbul cover $bin/_mocha -- $TEST_OPTS
  $bin/codeclimate < coverage/lcov.info
else
  $bin/mocha $TEST_OPTS
fi