#if on github, cd to directory
export NHS_RULES_DIR=$GITHUB_WORKSPACE

cd "$NHS_RULES_DIR"

#clean build directory of old artifacts
rm -rf './build' './functions'

# copy source files to build directory-- this is so that assets maintain their relative positions
cp -r './source/' './build'
cp -r './function-source/' './functions'

# run markdown building and script minifying
node build-scripts/build-markdown.js
node build-scripts/minify-scripts.js