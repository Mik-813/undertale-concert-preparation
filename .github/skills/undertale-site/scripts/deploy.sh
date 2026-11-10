#!/usr/bin/env bash
# Push the current commit, wait for the Pages workflow and confirm the live asset hashes match the local build.
# Usage: deploy.sh   (run from anywhere inside the repo, after committing)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
LIVE=https://mik-813.github.io/undertale-concert-preparation/

[ -z "$(git status --porcelain)" ] || { echo "Uncommitted changes, commit first."; exit 1; }
npx vite build --logLevel error
git push --quiet
sleep 5
RUN=$(gh run list -L1 --json databaseId -q '.[0].databaseId')
gh run watch "$RUN" --exit-status >/dev/null || { echo "Workflow $RUN failed. Retry: gh run rerun $RUN"; exit 1; }

want=$(ls dist/assets | grep -E '^index-.*\.(js|css)$' | sort)
for i in 1 2 3 4 5 6; do
  sleep 20
  got=$(curl -fsSL "$LIVE?x=$RANDOM" | grep -oE 'index-[A-Za-z0-9_-]+\.(js|css)' | sort -u)
  if [ "$got" = "$want" ]; then echo "Live: $(echo $got)"; exit 0; fi
done
echo "Live hashes ($(echo $got)) differ from local ($(echo $want))."
exit 1
