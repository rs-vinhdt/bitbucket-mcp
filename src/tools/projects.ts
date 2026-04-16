import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BitbucketClient } from "../client.js";

export function registerWorkspaceTools(server: McpServer, client: BitbucketClient) {
  server.tool(
    "list_workspaces",
    "List all workspaces accessible to the authenticated user",
    {
      pagelen: z.number().int().min(1).max(100).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ pagelen, page }) => {
      const result = await client.listWorkspaces(pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_workspace",
    "Get details of a specific workspace",
    {
      workspace: z.string().describe("Workspace slug or UUID"),
    },
    async ({ workspace }) => {
      const result = await client.getWorkspace(workspace);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "list_projects",
    "List projects in a workspace",
    {
      workspace: z.string().describe("Workspace slug"),
      pagelen: z.number().int().min(1).max(100).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ workspace, pagelen, page }) => {
      const result = await client.listProjects(workspace, pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
