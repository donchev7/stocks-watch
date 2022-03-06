#!/bin/bash

set -ex

find dist -type f -name '*.json' -exec sed -i '' -e 's/bobby/live/g' {} +