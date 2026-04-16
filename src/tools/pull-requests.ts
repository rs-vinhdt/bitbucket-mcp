import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BitbucketClient } from "../client.js";

export function registerPullRequestTools(server: McpServer, client: BitbucketClient) {
  server.tool(
    "list_pull_requests",
    "List pull requests in a repository",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      state: z
        .enum(["OPEN", "MERGED", "DECLINED", "SUPERSEDED"])
        .default("OPEN")
        .describe("PR state filter"),
      pagelen: z.number().int().min(1).max(50).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ workspace, repoSlug, state, pagelen, page }) => {
      const result = await client.listPullRequests(workspace, repoSlug, state, pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_pull_request",
    "Get details of a specific pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
    },
    async ({ workspace, repoSlug, prId }) => {
      const result = await client.getPullRequest(workspace, repoSlug, prId);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_pull_request_diff",
    "Get the raw diff of a pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
    },
    async ({ workspace, repoSlug, prId }) => {
      const result = await client.getPullRequestDiff(workspace, repoSlug, prId);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );

  server.tool(
    "get_pull_request_diffstat",
    "Get diffstat (files changed, lines added/removed) for a pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
    },
    async ({ workspace, repoSlug, prId }) => {
      const result = await client.getPullRequestDiffStat(workspace, repoSlug, prId);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_pull_request_comments",
    "Get comments on a pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
      pagelen: z.number().int().min(1).max(100).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ workspace, repoSlug, prId, pagelen, page }) => {
      const result = await client.getPullRequestComments(workspace, repoSlug, prId, pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "create_pull_request",
    "Create a new pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      title: z.string().describe("PR title"),
      description: z.string().optional().describe("PR description (Markdown)"),
      sourceBranch: z.string().describe("Source branch name"),
      destinationBranch: z.string().describe("Destination branch name"),
      closeBranch: z.boolean().default(false).describe("Close source branch after merge"),
      reviewers: z.array(z.string()).optional().describe("List of reviewer UUIDs"),
    },
    async ({ workspace, repoSlug, title, description, sourceBranch, destinationBranch, closeBranch, reviewers }) => {
      const result = await client.createPullRequest(workspace, repoSlug, {
        title,
        description,
        source: { branch: { name: sourceBranch } },
        destination: { branch: { name: destinationBranch } },
        close_source_branch: closeBranch,
        reviewers: reviewers?.map((uuid) => ({ uuid })),
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "add_pull_request_comment",
    "Add a comment to a pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
      body: z.string().describe("Comment body (Markdown)"),
    },
    async ({ workspace, repoSlug, prId, body }) => {
      const result = await client.addPullRequestComment(workspace, repoSlug, prId, body);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "approve_pull_request",
    "Approve a pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
    },
    async ({ workspace, repoSlug, prId }) => {
      const result = await client.approvePullRequest(workspace, repoSlug, prId);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "merge_pull_request",
    "Merge a pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
      mergeStrategy: z
        .enum(["merge_commit", "squash", "fast_forward"])
        .optional()
        .describe("Merge strategy (default: repo setting)"),
    },
    async ({ workspace, repoSlug, prId, mergeStrategy }) => {
      const result = await client.mergePullRequest(workspace, repoSlug, prId, mergeStrategy);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "decline_pull_request",
    "Decline a pull request",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      prId: z.number().int().describe("Pull request ID"),
    },
    async ({ workspace, repoSlug, prId }) => {
      const result = await client.declinePullRequest(workspace, repoSlug, prId);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
