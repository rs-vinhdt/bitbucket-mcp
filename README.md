# Bitbucket MCP Server

An MCP (Model Context Protocol) server that connects AI assistants to Bitbucket Cloud. Enables tools like Claude Code, Claude Desktop, and other MCP clients to interact with your workspaces, repositories, pull requests, and pipelines.

## Features

**25 tools** across 4 categories:

| Category | Tools |
|---|---|
| **Workspaces** | List workspaces, get workspace details, list projects |
| **Repositories** | List repos, get repo details, list branches, list commits, read file content |
| **Pull Requests** | List/get/create PRs, view diffs & diffstats, read/add comments, approve, merge, decline |
| **Pipelines** | List/get pipelines, trigger/stop runs, list steps, read step logs |

## Setup

### 1. Create an Atlassian API Token

> **Note:** Atlassian replaced App Passwords with **API tokens with scopes**. Existing App Passwords will be disabled on **June 9, 2026** — use an API token going forward.

1. Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token with scopes**
3. Give it a label (e.g. `claude-mcp`) and select an **expiry date** (max 1 year)
4. Select **Bitbucket** as the app
5. (Optional) Restrict to a specific **workspace**
6. Select the scopes you need:

   | Scope | Required for |
   |---|---|
   | `read:account` | `list_workspaces`, `get_workspace` |
   | `read:project:bitbucket` | `list_projects` |
   | `read:repository:bitbucket` | `list_repositories`, `get_repository`, `list_branches`, `list_commits`, `get_file_content` |
   | `read:pullrequest:bitbucket` | `list_pull_requests`, `get_pull_request`, `get_pull_request_diff`, `get_pull_request_diffstat`, `get_pull_request_comments` |
   | `write:pullrequest:bitbucket` | `create_pull_request`, `update_pull_request_destination`, `add_pull_request_comment`, `approve_pull_request`, `merge_pull_request`, `decline_pull_request` |
   | `read:pipeline:bitbucket` | `list_pipelines`, `get_pipeline`, `list_pipeline_steps`, `get_pipeline_step_log` |
   | `write:pipeline:bitbucket` | `trigger_pipeline`, `stop_pipeline` |

7. Click **Create** and **copy the token immediately** — it's only shown once

The API token is used **exactly like an App Password**: as the `BITBUCKET_PASSWORD` value, paired with your Atlassian email as `BITBUCKET_USERNAME`. Auth is HTTP Basic (`email:api-token`).

### 2. Install & Build

```bash
git clone <this-repo>
cd bitbucket-mcp
npm install
npm run build
```

### 3. Connect to Claude Code CLI

```bash
claude mcp add bitbucket \
  -e BITBUCKET_USERNAME=you@example.com \
  -e BITBUCKET_PASSWORD=your-api-token \
  -- node /path/to/bitbucket-mcp/dist/index.js
```

Restart Claude Code, then start using it:

> "List all open PRs in workspace myteam repo backend"
>
> "Show me the diff for PR #42"
>
> "Trigger a pipeline on the main branch"

### 4. Connect to Claude Desktop

Add to your Claude Desktop MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "node",
      "args": ["/absolute/path/to/bitbucket-mcp/dist/index.js"],
      "env": {
        "BITBUCKET_USERNAME": "you@example.com",
        "BITBUCKET_PASSWORD": "your-api-token"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BITBUCKET_USERNAME` | Yes* | Atlassian account email |
| `BITBUCKET_PASSWORD` | Yes* | Atlassian API token (or legacy App Password) |
| `BITBUCKET_TOKEN` | Alt* | OAuth2 access token (uses Bearer auth instead) |
| `BITBUCKET_URL` | No | API base URL (default: `https://api.bitbucket.org/2.0`) |

\* Set either `BITBUCKET_USERNAME` + `BITBUCKET_PASSWORD` (recommended) **or** `BITBUCKET_TOKEN`.

## Development

```bash
npm run dev          # Watch mode (recompile on change)
npm run build        # One-time build
npm start            # Run the server
bash test.sh         # Smoke test (no Bitbucket credentials needed)
```

### Testing with MCP Inspector

```bash
export BITBUCKET_USERNAME=you@example.com
export BITBUCKET_PASSWORD=your-api-token
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a browser UI where you can call each tool interactively.

## Architecture

```
src/
├── index.ts              # Entry point, auth config, tool registration
├── client.ts             # BitbucketClient — HTTP wrapper for all API calls
├── types.ts              # TypeScript interfaces for API responses
└── tools/
    ├── projects.ts       # Workspace & project tools
    ├── repositories.ts   # Repository, branch, commit, file tools
    ├── pull-requests.ts  # Pull request tools
    └── pipelines.ts      # Pipeline tools
```

To add a new tool:

1. Add the API method to `src/client.ts`
2. Register the tool in the matching `src/tools/*.ts` file
3. Rebuild: `npm run build`

## License

MIT
