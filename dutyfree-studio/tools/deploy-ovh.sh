#!/bin/sh
# Publishes the static site of the last commit (index.html, css, js, assets: what the Railway image serves)
# at the root of the ovh-deploy branch on GitHub. An OVH web hosting linked to that branch
# (Git deployment with the GitHub webhook) pulls it.
# Usage (from anywhere in the repository): sh dutyfree-studio/tools/deploy-ovh.sh
set -eu

cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

if ! git diff --quiet HEAD -- dutyfree-studio; then
  echo "deploy-ovh: commit your changes to dutyfree-studio first, the published site must match a commit" >&2
  exit 1
fi

index="$(mktemp)"
rm -f "$index"
GIT_INDEX_FILE="$index" git read-tree --empty
for dir in css js assets; do
  GIT_INDEX_FILE="$index" git read-tree --prefix="$dir/" "HEAD:dutyfree-studio/$dir"
done
GIT_INDEX_FILE="$index" git update-index --add --cacheinfo "100644,$(git rev-parse HEAD:dutyfree-studio/index.html),index.html"
tree="$(GIT_INDEX_FILE="$index" git write-tree)"
rm -f "$index"

parent=""
if git fetch -q origin ovh-deploy 2>/dev/null; then
  if [ "$tree" = "$(git rev-parse 'FETCH_HEAD^{tree}')" ]; then
    echo "deploy-ovh: ovh-deploy already holds this site"
    exit 0
  fi
  parent="-p FETCH_HEAD"
fi

# shellcheck disable=SC2086
commit="$(git commit-tree "$tree" $parent -m "build: dutyfree-studio from $(git rev-parse --short HEAD)")"
git push origin "${commit}:refs/heads/ovh-deploy"
echo "deploy-ovh: pushed ${commit} to ovh-deploy"
