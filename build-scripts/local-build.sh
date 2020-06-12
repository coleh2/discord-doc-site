export NHS_RULES_DIR="."

#clean build directory of old artifacts
rm -rf './build'

# copy source files to build directory-- this is so that assets maintain their relative positions
cp -r './source/' './build'

node build-scripts/build-markdown.js