import { GrafoNode, GrafoLink, GrafoResponse } from "shared";
import { GitHubRepo } from "./github";

export function buildBipartiteGraph(
  repos: GitHubRepo[],
  repoLanguages: Map<string, Record<string, number>>
): GrafoResponse {
  const nodesMap = new Map<string, GrafoNode>();
  const links: GrafoLink[] = [];
  const technologies = new Set<string>();

  for (const repo of repos) {
    const repoId = `repo_${repo.name}`;
    const languages = repoLanguages.get(repo.name) || {};

    // Adiciona o nó do repositório
    nodesMap.set(repoId, {
      id: repoId,
      label: repo.name,
      group: "repositorio",
      stars: repo.stargazers_count,
      languagesInfo: Object.keys(languages).length > 0 ? languages : undefined,
      githubUrl: repo.html_url,
    });

    // Mapeia e cria conexões para cada tecnologia utilizada
    for (const tech of Object.keys(languages)) {
      const techId = `tech_${tech}`;
      technologies.add(tech);

      links.push({
        source: repoId,
        target: techId,
      });
    }
  }

  // Adiciona nós consolidados de tecnologia
  for (const tech of technologies) {
    const techId = `tech_${tech}`;
    nodesMap.set(techId, {
      id: techId,
      label: tech,
      group: "tecnologia",
    });
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
}
