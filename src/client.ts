/**
 * Bitbucket Cloud REST API 2.0 client.
 * Base: https://api.bitbucket.org/2.0
 * Uses native fetch (Node 18+), no external HTTP dependencies.
 */

import type {
  BitbucketConfig,
  PaginatedResponse,
  Workspace,
  Project,
  Repository,
  PullRequest,
  Comment,
  DiffStat,
  Branch,
  Commit,
  Participant,
  Account,
} from "./types.js";

export class BitbucketClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: BitbucketConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");

    const authorization =
      config.auth.type === "token"
        ? `Bearer ${config.auth.token}`
        : `Basic ${Buffer.from(`${config.auth.username}:${config.auth.password}`).toString("base64")}`;

    this.headers = {
      Authorization: authorization,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  // ---------------------------------------------------------------------------
  // Core HTTP
  // ---------------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = path.startsWith("http")
      ? path
      : `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Bitbucket API ${method} ${path} failed (${res.status}): ${text}`
      );
    }

    if (res.status === 204) return undefined as T;

    return (await res.json()) as T;
  }

  private get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  private post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  private delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  // ---------------------------------------------------------------------------
  // Workspaces
  // ---------------------------------------------------------------------------

  async listWorkspaces(
    pagelen = 25,
    page = 1
  ): Promise<PaginatedResponse<Workspace>> {
    return this.get(`/workspaces?pagelen=${pagelen}&page=${page}`);
  }

  async getWorkspace(workspace: string): Promise<Workspace> {
    return this.get(`/workspaces/${encodeURIComponent(workspace)}`);
  }

  // ---------------------------------------------------------------------------
  // Projects
  // ---------------------------------------------------------------------------

  async listProjects(
    workspace: string,
    pagelen = 25,
    page = 1
  ): Promise<PaginatedResponse<Project>> {
    return this.get(
      `/workspaces/${encodeURIComponent(workspace)}/projects?pagelen=${pagelen}&page=${page}`
    );
  }

  // ---------------------------------------------------------------------------
  // Repositories
  // ---------------------------------------------------------------------------

  async listRepositories(
    workspace: string,
    pagelen = 25,
    page = 1
  ): Promise<PaginatedResponse<Repository>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}?pagelen=${pagelen}&page=${page}`
    );
  }

  async getRepository(
    workspace: string,
    repoSlug: string
  ): Promise<Repository> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}`
    );
  }

  // ---------------------------------------------------------------------------
  // Branches
  // ---------------------------------------------------------------------------

  async listBranches(
    workspace: string,
    repoSlug: string,
    pagelen = 25,
    page = 1
  ): Promise<PaginatedResponse<Branch>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/refs/branches?pagelen=${pagelen}&page=${page}`
    );
  }

  // ---------------------------------------------------------------------------
  // Commits
  // ---------------------------------------------------------------------------

  async listCommits(
    workspace: string,
    repoSlug: string,
    pagelen = 25,
    page = 1
  ): Promise<PaginatedResponse<Commit>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/commits?pagelen=${pagelen}&page=${page}`
    );
  }

  // ---------------------------------------------------------------------------
  // Pull Requests
  // ---------------------------------------------------------------------------

  async listPullRequests(
    workspace: string,
    repoSlug: string,
    state: "OPEN" | "MERGED" | "DECLINED" | "SUPERSEDED" = "OPEN",
    pagelen = 25,
    page = 1
  ): Promise<PaginatedResponse<PullRequest>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests?state=${state}&pagelen=${pagelen}&page=${page}`
    );
  }

  async getPullRequest(
    workspace: string,
    repoSlug: string,
    prId: number
  ): Promise<PullRequest> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}`
    );
  }

  async createPullRequest(
    workspace: string,
    repoSlug: string,
    data: {
      title: string;
      description?: string;
      source: { branch: { name: string } };
      destination: { branch: { name: string } };
      close_source_branch?: boolean;
      reviewers?: { uuid: string }[];
    }
  ): Promise<PullRequest> {
    return this.post(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests`,
      data
    );
  }

  async getPullRequestDiff(
    workspace: string,
    repoSlug: string,
    prId: number
  ): Promise<string> {
    const url = `${this.baseUrl}/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/diff`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...this.headers,
        Accept: "text/plain",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bitbucket API GET diff failed (${res.status}): ${text}`);
    }
    return res.text();
  }

  async getPullRequestDiffStat(
    workspace: string,
    repoSlug: string,
    prId: number,
    pagelen = 100
  ): Promise<PaginatedResponse<DiffStat>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/diffstat?pagelen=${pagelen}`
    );
  }

  async getPullRequestComments(
    workspace: string,
    repoSlug: string,
    prId: number,
    pagelen = 25,
    page = 1
  ): Promise<PaginatedResponse<Comment>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/comments?pagelen=${pagelen}&page=${page}`
    );
  }

  async addPullRequestComment(
    workspace: string,
    repoSlug: string,
    prId: number,
    body: string
  ): Promise<Comment> {
    return this.post(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/comments`,
      { content: { raw: body } }
    );
  }

  async approvePullRequest(
    workspace: string,
    repoSlug: string,
    prId: number
  ): Promise<Participant> {
    return this.post(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/approve`,
      {}
    );
  }

  async unapprovePullRequest(
    workspace: string,
    repoSlug: string,
    prId: number
  ): Promise<void> {
    return this.delete(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/approve`
    );
  }

  async mergePullRequest(
    workspace: string,
    repoSlug: string,
    prId: number,
    mergeStrategy?: "merge_commit" | "squash" | "fast_forward"
  ): Promise<PullRequest> {
    const body: Record<string, unknown> = {};
    if (mergeStrategy) body.merge_strategy = mergeStrategy;
    return this.post(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/merge`,
      body
    );
  }

  async declinePullRequest(
    workspace: string,
    repoSlug: string,
    prId: number
  ): Promise<PullRequest> {
    return this.post(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pullrequests/${prId}/decline`,
      {}
    );
  }

  // ---------------------------------------------------------------------------
  // File browsing
  // ---------------------------------------------------------------------------

  async getFileContent(
    workspace: string,
    repoSlug: string,
    filePath: string,
    ref?: string
  ): Promise<string> {
    const refParam = ref ? `?at=${encodeURIComponent(ref)}` : "";
    const url = `${this.baseUrl}/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/src/${ref ? encodeURIComponent(ref) : "HEAD"}/${filePath}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...this.headers,
        Accept: "application/octet-stream",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bitbucket API GET file failed (${res.status}): ${text}`);
    }
    return res.text();
  }

  // ---------------------------------------------------------------------------
  // Pipelines
  // ---------------------------------------------------------------------------

  async listPipelines(
    workspace: string,
    repoSlug: string,
    pagelen = 25,
    page = 1,
    sort = "-created_on"
  ): Promise<PaginatedResponse<Pipeline>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pipelines?pagelen=${pagelen}&page=${page}&sort=${encodeURIComponent(sort)}`
    );
  }

  async getPipeline(
    workspace: string,
    repoSlug: string,
    pipelineUuid: string
  ): Promise<Pipeline> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pipelines/${encodeURIComponent(pipelineUuid)}`
    );
  }

  async triggerPipeline(
    workspace: string,
    repoSlug: string,
    target: {
      type: "pipeline_ref_target";
      ref_type: "branch" | "tag";
      ref_name: string;
      selector?: { type: "custom"; pattern: string };
    },
    variables?: PipelineVariable[]
  ): Promise<Pipeline> {
    const body: { target: typeof target; variables?: PipelineVariable[] } = { target };
    if (variables && variables.length > 0) body.variables = variables;
    return this.post(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pipelines`,
      body
    );
  }

  async stopPipeline(
    workspace: string,
    repoSlug: string,
    pipelineUuid: string
  ): Promise<void> {
    return this.post(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pipelines/${encodeURIComponent(pipelineUuid)}/stopPipeline`,
      {}
    );
  }

  async listPipelineSteps(
    workspace: string,
    repoSlug: string,
    pipelineUuid: string,
    pagelen = 100
  ): Promise<PaginatedResponse<PipelineStep>> {
    return this.get(
      `/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pipelines/${encodeURIComponent(pipelineUuid)}/steps?pagelen=${pagelen}`
    );
  }

  async getPipelineStepLog(
    workspace: string,
    repoSlug: string,
    pipelineUuid: string,
    stepUuid: string
  ): Promise<string> {
    const url = `${this.baseUrl}/repositories/${encodeURIComponent(workspace)}/${encodeURIComponent(repoSlug)}/pipelines/${encodeURIComponent(pipelineUuid)}/steps/${encodeURIComponent(stepUuid)}/log`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...this.headers,
        Accept: "application/octet-stream",
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bitbucket API GET step log failed (${res.status}): ${text}`);
    }
    return res.text();
  }
}

// --- Pipeline types (Cloud-specific) ---

export interface PipelineVariable {
  key: string;
  value: string;
  secured?: boolean;
}

export interface Pipeline {
  uuid: string;
  build_number: number;
  state: {
    name: string;
    type: string;
    result?: {
      name: string;
      type: string;
    };
    stage?: {
      name: string;
      type: string;
    };
  };
  target: {
    type: string;
    ref_type?: string;
    ref_name?: string;
    selector?: { type: string; pattern: string };
  };
  trigger: {
    name: string;
    type: string;
  };
  created_on: string;
  completed_on?: string;
  duration_in_seconds?: number;
  links: Record<string, { href: string }>;
}

export interface PipelineStep {
  uuid: string;
  name: string;
  state: {
    name: string;
    type: string;
    result?: {
      name: string;
      type: string;
    };
  };
  started_on?: string;
  completed_on?: string;
  duration_in_seconds?: number;
  script_commands?: { name: string; command: string }[];
  links: Record<string, { href: string }>;
}
