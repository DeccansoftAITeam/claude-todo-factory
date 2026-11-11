#!/usr/bin/env bash
# Push verification evidence (screenshots, video) to the orphan `factory-evidence`
# branch so PR comments can embed screenshots inline, then print the raw base URL.
#
# Usage: publish-evidence.sh <evidence_dir> <dest_path>   (e.g. pr-4/run-123)
# Needs: GH_TOKEN with contents:write, GITHUB_REPOSITORY.
set -euo pipefail
src="$1" dest="$2"
branch=factory-evidence
work=$(mktemp -d)
remote="https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

if git ls-remote --exit-code --heads "$remote" "$branch" >/dev/null 2>&1; then
  git clone --quiet --depth 1 --branch "$branch" "$remote" "$work"
else
  git init --quiet -b "$branch" "$work"
  git -C "$work" remote add origin "$remote"
  echo "# Factory verification evidence (auto-generated)" > "$work/README.md"
fi

mkdir -p "$work/$dest"
# Screenshots + videos only; never logs or traces (could hold page data).
find "$src" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webm' \) -exec cp {} "$work/$dest/" \;

git -C "$work" config user.name "claude-factory[bot]"
git -C "$work" config user.email "claude-factory@users.noreply.github.com"
git -C "$work" add -A
git -C "$work" commit --quiet -m "evidence: $dest" || true
for i in 1 2 3; do
  git -C "$work" push --quiet origin "$branch" && break
  git -C "$work" pull --quiet --rebase origin "$branch" || true
done

echo "https://raw.githubusercontent.com/${GITHUB_REPOSITORY}/${branch}/${dest}"
