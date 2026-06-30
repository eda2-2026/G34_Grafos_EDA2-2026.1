import { AppConfig } from "./config";

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  topics: string[];
  archived: boolean;
  languages_url: string;
  html_url: string;
}

export class GitHubService {
  private token: string;
  private org: string;

  constructor(config: AppConfig) {
    this.token = config.githubToken;
    this.org = config.githubOrg;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
      // topics require this header on older API versions; harmless on newer
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "TechGraph-App",
    };
  }

  async fetchRepositories(): Promise<GitHubRepo[]> {
    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `https://api.github.com/orgs/${this.org}/repos?per_page=${perPage}&page=${page}&sort=updated`;
      const response = await fetch(url, { headers: this.getHeaders() });

      if (!response.ok) {
        throw new Error(`Falha ao obter repositórios: ${response.statusText}`);
      }

      const data = (await response.json()) as GitHubRepo[];
      if (data.length === 0) break;

      repos.push(...data);
      if (data.length < perPage) break;
      page++;
    }

    return repos;
  }

  async fetchRepoLanguages(languagesUrl: string): Promise<Record<string, number>> {
    const response = await fetch(languagesUrl, { headers: this.getHeaders() });
    if (!response.ok) {
      throw new Error(`Falha ao obter linguagens: ${response.statusText}`);
    }
    return (await response.json()) as Record<string, number>;
  }

  async runWithLimit<T, R>(limit: number, items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<any>[] = [];

    for (const item of items) {
      const p = Promise.resolve().then(() => fn(item));
      results.push(p as any);

      if (limit <= items.length) {
        const e: any = p.then(() => executing.splice(executing.indexOf(e), 1));
        executing.push(e);
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    }

    return Promise.all(results);
  }
}
