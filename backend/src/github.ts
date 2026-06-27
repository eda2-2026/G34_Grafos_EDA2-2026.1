import { AppConfig } from "./config";

export interface GitHubRepo {
  name: string;
  stargazers_count: number;
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
      Accept: "application/vnd.github+json",
      "User-Agent": "TechGraph-App",
    };
  }

  /**
   * Obtém todos os repositórios da organização com suporte a paginação.
   */
  async fetchRepositories(): Promise<GitHubRepo[]> {
    const repos: GitHubRepo[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `https://api.github.com/orgs/${this.org}/repos?per_page=${perPage}&page=${page}`;
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
}
