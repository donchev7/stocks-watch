set -ex

find dist/handlers -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/adapters/..\/adapters/g' {} +
find dist/handlers -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/middleware/..\/middleware/g' {} +
find dist/handlers -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/config/..\/config/g' {} +
find dist/handlers -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/entities/..\/entities/g' {} +
find dist/handlers -type f -name '*.js' -exec sed -i '' -e 's/..\/..\/logger/..\/logger/g' {} +
find dist/handlers -type f -name '*.json' -exec sed -i '' -e 's/bobby/live/g' {} +