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
}
