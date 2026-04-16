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

### 1. Create a Bitbucket App Password

1. Log in to [bitbucket.org](https://bitbucket.org)
2. Click your avatar (bottom-left) → **Personal settings**
3. Under **Access management**, click **App passwords**
4. Click **Create app password**
5. Give it a label (e.g. `claude-mcp`)
6. Select the permissions you need:

   | Permission | Required for |
   |---|---|
   | **Account: Read** | `list_workspaces`, `get_workspace` |
   | **Projects: Read** | `list_projects` |
   | **Repositories: Read** | `list_repositories`, `get_repository`, `list_branches`, `list_commits`, `get_file_content` |
   | **Repositories: Write** | (only if you need to create repos) |
   | **Pull requests: Read** | `list_pull_requests`, `get_pull_request`, `get_pull_request_diff`, `get_pull_request_diffstat`, `get_pull_request_comments` |
   | **Pull requests: Write** | `create_pull_request`, `add_pull_request_comment`, `approve_pull_request`, `merge_pull_request`, `decline_pull_request` |
   | **Pipelines: Read** | `list_pipelines`, `get_pipeline`, `list_pipeline_steps`, `get_pipeline_step_log` |
   | **Pipelines: Write** | `trigger_pipeline`, `stop_pipeline` |

7. Click **Create** and **copy the generated password** — you won't see it again

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
  -e BITBUCKET_PASSWORD=your-app-password \
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
        "BITBUCKET_PASSWORD": "your-app-password"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BITBUCKET_USERNAME` | Yes* | Atlassian account email |
| `BITBUCKET_PASSWORD` | Yes* | Bitbucket App Password |
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
export BITBUCKET_PASSWORD=your-app-password
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
