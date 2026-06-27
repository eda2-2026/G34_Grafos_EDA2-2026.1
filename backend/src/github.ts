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

  /**
   * Obtém as linguagens de um repositório específico.
   */
  async fetchRepoLanguages(languagesUrl: string): Promise<Record<string, number>> {
    const response = await fetch(languagesUrl, { headers: this.getHeaders() });
    if (!response.ok) {
      throw new Error(`Falha ao obter linguagens: ${response.statusText}`);
    }
    return (await response.json()) as Record<string, number>;
  }

  /**
   * Executa uma lista de tarefas assíncronas com um limite de concorrência especificado.
   */
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
