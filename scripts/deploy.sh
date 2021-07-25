#!/bin/bash

set -e # exit with nonzero exit code if anything fails
echo "Starting to update blog gh-pages\n"

git config --global user.email "1437931235@qq.com"
git config --global user.name "daief"

cd dist
git init
git add -f .
git commit -m "Assets Init"
git push --force --quiet "https://${ACTION_DEPLOY_KEY}@github.com/daief/daief.github.io.git" master:master >/dev/null

echo "Done updating gh-pages\n"

# else
#  echo "Skipped updating gh-pages, because build is not triggered from the master branch."
# fi;
