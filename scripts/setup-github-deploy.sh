#!/usr/bin/env bash
# One-time setup: create GitHub repo, push code, add EXPO_TOKEN for auto APK builds.
set -euo pipefail

REPO="vijayshagara/Task_Management_Portal-mobile"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Log in to GitHub first:"
  echo "  gh auth login"
  exit 1
fi

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  echo "Creating GitHub repo $REPO ..."
  gh repo create "$REPO" --public --description "Dairy Farmer Portal mobile app (Expo/React Native)" --source=. --remote=origin
else
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "git@github.com:${REPO}.git"
fi

echo "Pushing to GitHub ..."
git push -u origin master

if ! gh secret list --repo "$REPO" 2>/dev/null | grep -q EXPO_TOKEN; then
  echo ""
  echo "Add EXPO_TOKEN for GitHub Actions auto-builds:"
  echo "  1. Create token: https://expo.dev/settings/access-tokens"
  echo "  2. Run: gh secret set EXPO_TOKEN --repo $REPO"
  echo ""
  read -r -p "Paste your Expo token now (or press Enter to skip): " EXPO_TOKEN
  if [[ -n "${EXPO_TOKEN:-}" ]]; then
    printf '%s' "$EXPO_TOKEN" | gh secret set EXPO_TOKEN --repo "$REPO"
    echo "EXPO_TOKEN secret added."
  fi
else
  echo "EXPO_TOKEN secret already exists on GitHub."
fi

echo ""
echo "Done. Every push to master will trigger an APK build."
echo "Actions: https://github.com/$REPO/actions"
echo "APK builds: https://expo.dev/accounts/vijayshagara/projects/dairy-farmer-portal/builds"
