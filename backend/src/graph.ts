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
      languagesInfo: languages,
    });

    // Mapeia temporariamente as tecnologias encontradas
    for (const tech of Object.keys(languages)) {
      technologies.add(tech);
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
