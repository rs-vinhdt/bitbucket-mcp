/**
 * Bitbucket Cloud REST API 2.0 types.
 * Based on: https://developer.atlassian.com/cloud/bitbucket/rest/
 */

export type BitbucketConfig =
  | { baseUrl: string; auth: { type: "token"; token: string } }
  | { baseUrl: string; auth: { type: "basic"; username: string; password: string } };

// --- Paginated response (Cloud uses page/pagelen/next) ---

export interface PaginatedResponse<T> {
  size?: number;
  page?: number;
  pagelen: number;
  next?: string;
  previous?: string;
  values: T[];
}

// --- Workspace ---

export interface Workspace {
  uuid: string;
  name: string;
  slug: string;
  type: string;
  is_private?: boolean;
  links: Links;
}

// --- Project ---

export interface Project {
  uuid: string;
  key: string;
  name: string;
  description?: string;
  is_private: boolean;
  type: string;
  links: Links;
}

// --- Repository ---

export interface Repository {
  uuid: string;
  name: string;
  slug: string;
  full_name: string;
  description?: string;
  is_private: boolean;
  language: string;
  size?: number;
  mainbranch?: { name: string; type: string };
  project?: Project;
  owner?: Account;
  links: Links;
  type: string;
  created_on: string;
  updated_on: string;
}

// --- Pull Request ---

export interface PullRequest {
  id: number;
  title: string;
  description?: string;
  state: "OPEN" | "MERGED" | "DECLINED" | "SUPERSEDED";
  author: Account;
  source: PullRequestEndpoint;
  destination: PullRequestEndpoint;
  merge_commit?: { hash: string };
  close_source_branch: boolean;
  created_on: string;
  updated_on: string;
  reviewers: Account[];
  participants: Participant[];
  comment_count: number;
  task_count: number;
  links: Links;
  type: string;
}

export interface PullRequestEndpoint {
  branch: { name: string };
  commit: { hash: string };
  repository: {
    full_name: string;
    name: string;
    uuid: string;
  };
}

export interface Participant {
  user: Account;
  role: "PARTICIPANT" | "REVIEWER" | "AUTHOR";
  approved: boolean;
  state: "approved" | "changes_requested" | null;
}

// --- Account / User ---

export interface Account {
  uuid: string;
  display_name: string;
  nickname?: string;
  account_id?: string;
  type: string;
  links: Links;
}

// --- Comment ---

export interface Comment {
  id: number;
  content: {
    raw: string;
    markup: string;
    html: string;
  };
  user: Account;
  created_on: string;
  updated_on: string;
  inline?: {
    from?: number;
    to?: number;
    path: string;
  };
  parent?: { id: number };
  links: Links;
  type: string;
}

// --- Diff stat ---

export interface DiffStat {
  status: "added" | "removed" | "modified" | "renamed";
  lines_added: number;
  lines_removed: number;
  old?: { path: string };
  new?: { path: string };
  type: string;
}

// --- Branch ---

export interface Branch {
  name: string;
  target: Commit;
  type: string;
  links: Links;
}

// --- Commit ---

export interface Commit {
  hash: string;
  message: string;
  date: string;
  author: {
    raw: string;
    user?: Account;
  };
  parents: { hash: string }[];
  links: Links;
  type: string;
}

// --- Links ---

export interface Links {
  self?: LinkRef;
  html?: LinkRef;
  clone?: LinkRef[];
  [key: string]: LinkRef | LinkRef[] | undefined;
}

export interface LinkRef {
  href: string;
  name?: string;
}
