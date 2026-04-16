#!/bin/bash
# Smoke test: verify the MCP server starts and responds to initialize + tools/list
# Usage: ./test.sh
# Requires: BITBUCKET_URL, and either BITBUCKET_TOKEN or BITBUCKET_USERNAME+BITBUCKET_PASSWORD

set -euo pipefail

# Default to dummy values if not set (enough to test protocol, not API calls)
export BITBUCKET_URL="${BITBUCKET_URL:-https://dummy.example.com}"
export BITBUCKET_TOKEN="${BITBUCKET_TOKEN:-dummy-token}"

INIT='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"0.1.0"}}}'
INITIALIZED='{"jsonrpc":"2.0","method":"notifications/initialized"}'
LIST_TOOLS='{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

echo "Starting MCP server..."
RESPONSE=$(printf '%s\n%s\n%s\n' "$INIT" "$INITIALIZED" "$LIST_TOOLS" | node dist/index.js 2>/dev/null)

# Check initialize response
if echo "$RESPONSE" | head -1 | grep -q '"serverInfo"'; then
  echo "PASS: Server initialized successfully"
else
  echo "FAIL: Initialize response missing serverInfo"
  echo "$RESPONSE" | head -1
  exit 1
fi

# Check tools/list response
if echo "$RESPONSE" | grep -q '"list_projects"'; then
  echo "PASS: Tools registered correctly"
else
  echo "FAIL: Tools not found in response"
  echo "$RESPONSE"
  exit 1
fi

# Count tools
TOOL_COUNT=$(echo "$RESPONSE" | grep -o '"name"' | wc -l)
echo "PASS: $TOOL_COUNT tools registered"

echo ""
echo "All tests passed!"
