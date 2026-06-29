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

    nodesMap.set(repoId, {
      id: repoId,
      label: repo.name,
      group: "repositorio",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      description: repo.description ?? undefined,
      topics: repo.topics?.length > 0 ? repo.topics : undefined,
      updatedAt: repo.updated_at,
      archived: repo.archived || undefined,
      githubUrl: repo.html_url,
      languagesInfo: Object.keys(languages).length > 0 ? languages : undefined,
    });

    for (const tech of Object.keys(languages)) {
      const techId = `tech_${tech}`;
      technologies.add(tech);
      links.push({ source: repoId, target: techId });
    }
  }

  for (const tech of technologies) {
    nodesMap.set(`tech_${tech}`, {
      id: `tech_${tech}`,
      label: tech,
      group: "tecnologia",
    });
  }

  return { nodes: Array.from(nodesMap.values()), links };
}
