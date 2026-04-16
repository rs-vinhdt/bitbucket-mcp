#!/usr/bin/env node

/**
 * Bitbucket MCP Server
 *
 * An MCP server that exposes Bitbucket Cloud REST API 2.0
 * operations as tools for AI assistants.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { BitbucketClient } from "./client.js";
import { registerWorkspaceTools } from "./tools/projects.js";
import { registerRepositoryTools } from "./tools/repositories.js";
import { registerPullRequestTools } from "./tools/pull-requests.js";
import { registerPipelineTools } from "./tools/pipelines.js";

const DEFAULT_BASE_URL = "https://api.bitbucket.org/2.0";

async function main() {
  const baseUrl = process.env["BITBUCKET_URL"] || DEFAULT_BASE_URL;
  const token = process.env["BITBUCKET_TOKEN"];
  const username = process.env["BITBUCKET_USERNAME"];
  const password = process.env["BITBUCKET_PASSWORD"];

  let client: BitbucketClient;

  if (username && password) {
    // App Passwords require Basic auth (username:app-password)
    // This is the standard auth method for Bitbucket Cloud
    console.error("Using Basic authentication (App Password)");
    client = new BitbucketClient({ baseUrl, auth: { type: "basic", username, password } });
  } else if (token) {
    // OAuth2 access tokens use Bearer auth
    console.error("Using Bearer token authentication (OAuth2)");
    client = new BitbucketClient({ baseUrl, auth: { type: "token", token } });
  } else {
    console.error(
      "Error: Set BITBUCKET_USERNAME + BITBUCKET_PASSWORD (App Password, recommended)\n" +
      "       or BITBUCKET_TOKEN (OAuth2 access token)"
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: "bitbucket-mcp",
    version: "0.1.0",
  });

  // Register all tools
  registerWorkspaceTools(server, client);
  registerRepositoryTools(server, client);
  registerPullRequestTools(server, client);
  registerPipelineTools(server, client);

  // Connect via STDIO transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Bitbucket MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
