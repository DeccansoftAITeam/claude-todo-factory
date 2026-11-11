#!/usr/bin/env bash
# Run one Claude Code headless (`claude -p`) factory stage.
#
# Replaces warpdotdev/oz-agent-action from the reference factory. It:
#   - authenticates with ANTHROPIC_API_KEY + the anthropic-workspace-id header
#     (the key is not workspace-scoped, so every request must name a workspace)
#   - forces structured output with --json-schema
#   - bounds cost (--max-budget-usd) and tools (--allowedTools)
#   - writes the raw result, the structured output and a step summary
#
# Usage:
#   claude-run.sh --stage triage --prompt-file p.md --schema factory/schemas/triage.json \
#     --model claude-sonnet-5-5 --budget 1 --tools "Read,Glob,Grep" [--mcp-config f.json] \
#     --out .factory/triage
set -euo pipefail

stage="" prompt_file="" schema="" model="${CLAUDE_MODEL:-claude-sonnet-5-5}" budget="2" tools="" mcp="" out=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --stage) stage="$2"; shift 2 ;;
    --prompt-file) prompt_file="$2"; shift 2 ;;
    --schema) schema="$2"; shift 2 ;;
    --model) model="$2"; shift 2 ;;
    --budget) budget="$2"; shift 2 ;;
    --tools) tools="$2"; shift 2 ;;
    --mcp-config) mcp="$2"; shift 2 ;;
    --out) out="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done
: "${stage:?--stage required}" "${prompt_file:?--prompt-file required}" "${schema:?--schema required}" "${out:?--out required}"
: "${ANTHROPIC_API_KEY:?ANTHROPIC_API_KEY secret is not set}"
: "${ANTHROPIC_WORKSPACE_ID:?ANTHROPIC_WORKSPACE_ID secret is not set}"

export ANTHROPIC_CUSTOM_HEADERS="anthropic-workspace-id: ${ANTHROPIC_WORKSPACE_ID}"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1

mkdir -p "$out"
args=(-p "$(cat "$prompt_file")"
  --model "$model"
  --output-format json
  --json-schema "$(cat "$schema")"
  --max-budget-usd "$budget"
  --permission-mode dontAsk)
# One comma-separated argument: rules like "Bash(npm test:*)" contain spaces.
[[ -n "$tools" ]] && args+=(--allowedTools "$tools")
[[ -n "$mcp" ]] && args+=(--mcp-config "$mcp" --strict-mcp-config)

echo "::group::claude -p ($stage, $model, budget \$$budget)"
set +e
claude "${args[@]}" > "$out/result.json" 2> "$out/stderr.log"
code=$?
set -e
echo "exit=$code"
tail -n 20 "$out/stderr.log" || true
echo "::endgroup::"

if ! jq -e . "$out/result.json" > /dev/null 2>&1; then
  echo "::error::$stage: claude did not return JSON (exit $code)"; cat "$out/result.json"; exit 1
fi

jq '.structured_output // empty' "$out/result.json" > "$out/output.json"
cost=$(jq -r '.total_cost_usd // 0' "$out/result.json")
turns=$(jq -r '.num_turns // 0' "$out/result.json")
is_error=$(jq -r '.is_error // false' "$out/result.json")

{
  echo "### Claude headless · \`$stage\`"
  echo "| model | turns | cost (USD) | error |"
  echo "|---|---|---|---|"
  printf '| %s | %s | %.4f | %s |\n' "$model" "$turns" "$cost" "$is_error"
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"

if [[ "$is_error" == "true" || ! -s "$out/output.json" ]]; then
  echo "::error::$stage: no structured output. result: $(jq -r '.result // .subtype // "?"' "$out/result.json" | head -c 500)"
  exit 1
fi
echo "$stage structured output:"; cat "$out/output.json"
