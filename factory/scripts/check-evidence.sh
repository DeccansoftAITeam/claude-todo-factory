#!/usr/bin/env bash
# Evidence integrity: every passing criterion must cite >=1 screenshot that exists.
# Usage: check-evidence.sh <output.json> <evidence_dir>
# Prints one line per problem; exit 1 if any.
set -euo pipefail
out="$1" dir="$2" bad=0
while IFS=$'\t' read -r id shots; do
  if [[ -z "$shots" ]]; then echo "$id: passed without a screenshot"; bad=1; continue; fi
  for s in $shots; do
    [[ -f "$dir/$(basename "$s")" ]] || { echo "$id: screenshot $s not found"; bad=1; }
  done
done < <(jq -r '.criteria[] | select(.status=="pass") | [.id, (.screenshots | join(" "))] | @tsv' "$out")
exit $bad
