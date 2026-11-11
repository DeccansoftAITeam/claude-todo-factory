#!/usr/bin/env bash
# Render the verification engine's structured output as a markdown comment.
# Usage: verification-report.sh <output.json> <raw_base_url> <run_url> <title> [evidence_dir]
set -euo pipefail
out="$1" base="$2" run_url="$3" title="$4" evdir="${5:-}"

result=$(jq -r .result "$out")
case "$result" in pass) icon="✅" ;; fail) icon="❌" ;; *) icon="⚠️" ;; esac

echo "### 🔎 ${title}: ${icon} \`${result}\`"
echo
echo "**Target:** $(jq -r .target_url "$out")"
echo
jq -r .summary "$out"
echo
echo "| ID | Criterion | Result |"
echo "|---|---|---|"
jq -r '.criteria[] | "| \(.id) | \(.description | gsub("\\|"; "/")) | \(if .status=="pass" then "✅ pass" elif .status=="fail" then "❌ fail" else "⚠️ inconclusive" end) |"' "$out"
echo

jq -c '.criteria[]' "$out" | while read -r c; do
  id=$(jq -r .id <<<"$c")
  echo "<details><summary><b>${id}</b>: $(jq -r .description <<<"$c")</summary>"
  echo
  echo "**Steps:**"
  jq -r '.steps[] | "1. \(.)"' <<<"$c"
  echo
  echo "**Observed:** $(jq -r .notes <<<"$c")"
  echo
  jq -r '.screenshots[]' <<<"$c" | while read -r shot; do
    name=$(basename "$shot")
    echo "<img src=\"${base}/${name}\" alt=\"${id} ${name}\" width=\"640\">"
    echo
  done
  echo "</details>"
  echo
done

if [[ -n "$evdir" ]]; then
  find "$evdir" -type f -name '*.webm' | while read -r v; do
    echo "🎥 Video: [$(basename "$v")](${base}/$(basename "$v"))"
  done
fi
echo
echo "Evidence artifacts and logs: [workflow run](${run_url}) · Engine: Claude headless + Playwright MCP"
