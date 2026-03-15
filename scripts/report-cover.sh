#!/bin/bash

: "${npm_lifecycle_event?This script should be run from npm}"
    
npx ts-node scripts/merge-coverage.ts

nyc \
    report \
    --clean \
    --check-coverage \
    --report-dir coverage/full