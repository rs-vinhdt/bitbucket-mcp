import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { BitbucketClient } from "../client.js";

export function registerPipelineTools(server: McpServer, client: BitbucketClient) {
  server.tool(
    "list_pipelines",
    "List pipelines for a repository, sorted by most recent first",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      pagelen: z.number().int().min(1).max(100).default(25).describe("Page size"),
      page: z.number().int().min(1).default(1).describe("Page number"),
    },
    async ({ workspace, repoSlug, pagelen, page }) => {
      const result = await client.listPipelines(workspace, repoSlug, pagelen, page);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_pipeline",
    "Get details of a specific pipeline run",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      pipelineUuid: z.string().describe("Pipeline UUID (e.g. '{uuid}')"),
    },
    async ({ workspace, repoSlug, pipelineUuid }) => {
      const result = await client.getPipeline(workspace, repoSlug, pipelineUuid);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "trigger_pipeline",
    "Trigger a new pipeline run on a branch or tag, optionally with custom pipeline pattern and variables",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      refName: z.string().describe("Branch or tag name to run the pipeline on"),
      refType: z.enum(["branch", "tag"]).default("branch").describe("Reference type"),
      pattern: z.string().optional().describe("Custom pipeline pattern name (from bitbucket-pipelines.yml)"),
      variables: z
        .array(
          z.object({
            key: z.string().describe("Variable name"),
            value: z.string().describe("Variable value"),
            secured: z.boolean().optional().describe("Mark value as secured (masked in logs)"),
          })
        )
        .optional()
        .describe("Pipeline variables (e.g. [{key: 'CLUSTER_NAME', value: 'provrel2'}])"),
    },
    async ({ workspace, repoSlug, refName, refType, pattern, variables }) => {
      const target: {
        type: "pipeline_ref_target";
        ref_type: "branch" | "tag";
        ref_name: string;
        selector?: { type: "custom"; pattern: string };
      } = {
        type: "pipeline_ref_target",
        ref_type: refType,
        ref_name: refName,
      };
      if (pattern) {
        target.selector = { type: "custom", pattern };
      }
      const result = await client.triggerPipeline(workspace, repoSlug, target, variables);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "stop_pipeline",
    "Stop a running pipeline",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      pipelineUuid: z.string().describe("Pipeline UUID"),
    },
    async ({ workspace, repoSlug, pipelineUuid }) => {
      await client.stopPipeline(workspace, repoSlug, pipelineUuid);
      return {
        content: [{ type: "text" as const, text: "Pipeline stopped successfully." }],
      };
    }
  );

  server.tool(
    "list_pipeline_steps",
    "List steps of a pipeline run",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      pipelineUuid: z.string().describe("Pipeline UUID"),
    },
    async ({ workspace, repoSlug, pipelineUuid }) => {
      const result = await client.listPipelineSteps(workspace, repoSlug, pipelineUuid);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "get_pipeline_step_log",
    "Get the log output of a specific pipeline step",
    {
      workspace: z.string().describe("Workspace slug"),
      repoSlug: z.string().describe("Repository slug"),
      pipelineUuid: z.string().describe("Pipeline UUID"),
      stepUuid: z.string().describe("Step UUID"),
    },
    async ({ workspace, repoSlug, pipelineUuid, stepUuid }) => {
      const result = await client.getPipelineStepLog(workspace, repoSlug, pipelineUuid, stepUuid);
      return {
        content: [{ type: "text" as const, text: result }],
      };
    }
  );
}
