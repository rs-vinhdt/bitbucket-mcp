import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BitbucketClient } from "../client.js";

export function registerRepositoryTools(server: McpServer, client: BitbucketClient) {
  server.tool(
    "list_repositories",
    "List repositories in a workspace",
    {
      workspace: z.string().describe("Workspace slug"),
      pagelen: z.number().int().min(1).max(100).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ workspace, pagelen, page }) => {
      const result = await client.listRepositories(workspace, pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_repository",
    "Get details of a specific repository",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
    },
    async ({ workspace, repoSlug }) => {
      const result = await client.getRepository(workspace, repoSlug);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "list_branches",
    "List branches in a repository",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      pagelen: z.number().int().min(1).max(100).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ workspace, repoSlug, pagelen, page }) => {
      const result = await client.listBranches(workspace, repoSlug, pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "list_commits",
    "List recent commits in a repository",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      pagelen: z.number().int().min(1).max(100).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ workspace, repoSlug, pagelen, page }) => {
      const result = await client.listCommits(workspace, repoSlug, pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_file_content",
    "Get the content of a file in a repository",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      filePath: z.string().describe("Path to the file (e.g. 'src/index.ts')"),
      ref: z.string().optional().describe("Branch name, tag, or commit hash (default: HEAD)"),
    },
    async ({ workspace, repoSlug, filePath, ref }) => {
      const result = await client.getFileContent(workspace, repoSlug, filePath, ref);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );
}
