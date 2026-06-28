import { expect, test } from "bun:test";
import { buildBipartiteGraph } from "./graph";
import { GitHubRepo } from "./github";

test("buildBipartiteGraph: monta grafo bipartido corretamente", () => {
  const mockRepos: GitHubRepo[] = [
    {
      name: "api-vendas",
      stargazers_count: 10,
      languages_url: "https://api.github.com/languages-1",
      html_url: "https://github.com/mock/api-vendas",
    },
    {
      name: "app-mobile",
      stargazers_count: 5,
      languages_url: "https://api.github.com/languages-2",
      html_url: "https://github.com/mock/app-mobile",
    },
  ];

  const mockLanguages = new Map<string, Record<string, number>>([
    ["api-vendas", { TypeScript: 10000, JavaScript: 2000 }],
    ["app-mobile", { TypeScript: 5000, Dart: 8000 }],
  ]);

  const response = buildBipartiteGraph(mockRepos, mockLanguages);

  // Deve possuir os nós dos repositórios (2) e das tecnologias (3: TypeScript, JavaScript, Dart) = 5 nós
  expect(response.nodes.length).toBe(5);

  // Deve possuir as conexões correspondentes (2 do api-vendas + 2 do app-mobile) = 4 conexões
  expect(response.links.length).toBe(4);

  // Vértices individuais
  const repoNode = response.nodes.find((n) => n.id === "repo_api-vendas");
  const techNode = response.nodes.find((n) => n.id === "tech_TypeScript");

  expect(repoNode).toBeDefined();
  expect(repoNode?.group).toBe("repositorio");
  expect(repoNode?.stars).toBe(10);

  expect(techNode).toBeDefined();
  expect(techNode?.group).toBe("tecnologia");

  // Conexões corretas
  const link = response.links.find(
    (l) => l.source === "repo_api-vendas" && l.target === "tech_TypeScript"
  );
  expect(link).toBeDefined();
});
