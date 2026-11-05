#!/bin/sh
# One-command update for GitHub Pages.
# Usage (in Git Bash):  sh deploy.sh
# It commits every local change and pushes to origin/main.
set -e
cd "$(dirname "$0")"

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "ERROR: no 'origin' remote configured yet."
  echo "Run once: git remote add origin https://github.com/USER/REPO.git"
  exit 1
fi

git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "update: $(date '+%Y-%m-%d %H:%M')"
fi

git push origin main
echo "Done. Wait about 1 minute, then refresh your GitHub Pages URL."
