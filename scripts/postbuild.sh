#!/bin/bash

set -ex

find dist -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/adapters/..\/adapters/g' {} +
find dist -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/middleware/..\/middleware/g' {} +
find dist -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/config/..\/config/g' {} +
find dist -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/entities/..\/entities/g' {} +
find dist -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/logger/..\/logger/g' {} +
find dist -type f -name '*.json' -exec sed -i '' -e 's/ne-bobby/ne-live/g' {} +