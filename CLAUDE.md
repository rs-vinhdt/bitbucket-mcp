# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for **Bitbucket Cloud**. Exposes Bitbucket Cloud REST API 2.0 operations as MCP tools so AI assistants can interact with workspaces, repositories, pull requests, pipelines, and more.

- **Language:** TypeScript (ESM, `"type": "module"`)
- **Runtime:** Node.js >= 18 (uses native `fetch`)
- **MCP SDK:** `@modelcontextprotocol/sdk` v1.x
- **Transport:** STDIO (JSON-RPC over stdin/stdout)
- **Bitbucket API:** Cloud REST API 2.0 (`https://api.bitbucket.org/2.0/...`)

## Build & Run

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript → dist/
npm run dev          # Watch mode (tsc --watch)
npm start            # Run the compiled server (needs env vars)
bash test.sh         # Smoke test (no real Bitbucket needed)
```

## Architecture

```
src/
├── index.ts          # Entry point: creates McpServer, wires tools, connects StdioServerTransport
├── client.ts         # BitbucketClient: HTTP client wrapping all Cloud API 2.0 calls + Pipeline/Step types
├── types.ts          # TypeScript interfaces for Bitbucket Cloud API responses
└── tools/
    ├── projects.ts       # list_workspaces, get_workspace, list_projects
    ├── repositories.ts   # list_repositories, get_repository, list_branches, list_commits, get_file_content
    ├── pull-requests.ts  # list/get/create PRs, diff, diffstat, comments, approve, merge, decline
    └── pipelines.ts      # list/get/trigger/stop pipelines, list steps, get step log
```

**Data flow:** MCP Client → StdioServerTransport → McpServer → tool handler → BitbucketClient → Bitbucket Cloud API

Each tool file exports a `register*Tools(server, client)` function that calls `server.tool()` with a zod schema and handler.

## Adding a New Tool

1. Add the API method to `src/client.ts`
2. Register the tool in the appropriate `src/tools/*.ts` file using `server.tool(name, description, zodSchema, handler)`
3. Import and call the register function in `src/index.ts` if it's a new tool file

## Important Constraints

- **Never use `console.log()`** — corrupts JSON-RPC on stdout. Use `console.error()` for all logging.
- All `.js` import paths must include the extension (ESM requirement): `import { Foo } from "./foo.js"`
- `zod` is a peer dependency of the MCP SDK — always available, no separate install needed.
- TypeScript: target `ES2022`, module/moduleResolution `Node16`.
- Bitbucket Cloud pagination uses `pagelen`/`page`/`next` (not `start`/`limit`/`isLastPage` like Server).

## Environment Variables

Two auth methods are supported. **App Password (Basic auth) is recommended** for Bitbucket Cloud. `BITBUCKET_URL` defaults to `https://api.bitbucket.org/2.0` if not set.

| Variable | Description |
|---|---|
| `BITBUCKET_URL` | Optional. API base URL (default: `https://api.bitbucket.org/2.0`) |
| `BITBUCKET_USERNAME` | **Recommended.** Atlassian account email (for App Password / Basic auth) |
| `BITBUCKET_PASSWORD` | **Recommended.** Bitbucket App Password (create at Bitbucket → Settings → App passwords) |
| `BITBUCKET_TOKEN` | Alternative: OAuth2 access token → `Authorization: Bearer <token>` |

**Note:** Bitbucket Cloud App Passwords require Basic auth (`email:app-password`), NOT Bearer tokens. Only OAuth2 access tokens use Bearer.

## MCP Client Configuration

To use with Claude Desktop or Claude Code CLI:

```bash
claude mcp add bitbucket \
  -e BITBUCKET_USERNAME=you@example.com \
  -e BITBUCKET_PASSWORD=your-app-password \
  -- node /path/to/bitbucket-mcp/dist/index.js
```

Or add to MCP config JSON:

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node",
      "args": ["/path/to/bitbucket-mcp/dist/index.js"],
      "env": {
        "BITBUCKET_USERNAME": "you@example.com",
        "BITBUCKET_PASSWORD": "your-app-password"
      }
    }
  }
}
```

## Key References

- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Bitbucket Cloud REST API: https://developer.atlassian.com/cloud/bitbucket/rest/
