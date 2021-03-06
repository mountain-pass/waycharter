#!/bin/bash

: "${npm_lifecycle_event?This script should be run from npm}"

# need to remove `:not[@skippable]` if it's present
COVERING=${npm_lifecycle_event#cover:}
COVERING_WITHOUT_SKIPABLE=${COVERING//:not\[@skippable\]/}
COVER_NAME=${COVERING//[:@\[\]]/-}
COVER_NAME_WITHOUT_SKIPABLE=${COVERING_WITHOUT_SKIPABLE//[:@\[\]]/-}

COVERAGE=1 nyc \
    --nycrc-path \
    ".nycrc-${COVER_NAME_WITHOUT_SKIPABLE}.yml" \
    --clean \
    --temp-dir "coverage/${COVER_NAME}/.nyc_output" \
    --report-dir "coverage/${COVER_NAME}" \
    npm run "test:${COVERING}"