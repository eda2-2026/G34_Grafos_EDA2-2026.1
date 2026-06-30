export interface AppConfig {
  githubToken: string;
  githubOrg: string;
  port: number;
}

export function loadConfig(): AppConfig {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubOrg = process.env.GITHUB_ORG;
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (!githubToken) {
    throw new Error("Variável de ambiente GITHUB_TOKEN é obrigatória.");
  }
  if (!githubOrg) {
    throw new Error("Variável de ambiente GITHUB_ORG é obrigatória.");
  }

  return {
    githubToken,
    githubOrg,
    port,
  };
}
