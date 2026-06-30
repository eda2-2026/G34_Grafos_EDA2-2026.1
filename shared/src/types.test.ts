import { expect, test } from "bun:test";
import type { GrafoResponse, GrafoNode } from "./types";

test("deve validar a estrutura de um nó de repositório", () => {
  const repoNode: GrafoNode = {
    id: "repo_api-vendas",
    label: "API de Vendas",
    group: "repositorio",
    stars: 12,
    languagesInfo: {
      "TypeScript": 45000,
      "JavaScript": 5000
    }
  };

  expect(repoNode.id).toBe("repo_api-vendas");
  expect(repoNode.group).toBe("repositorio");
  expect(repoNode.stars).toBe(12);
  expect(repoNode.languagesInfo?.["TypeScript"]).toBe(45000);
});

test("deve validar a estrutura de resposta completa do grafo", () => {
  const mockResponse: GrafoResponse = {
    nodes: [
      { id: "repo_app", label: "App Mobile", group: "repositorio" },
      { id: "tech_react-native", label: "React Native", group: "tecnologia" }
    ],
    links: [
      { source: "repo_app", target: "tech_react-native" }
    ]
  };

  expect(mockResponse.nodes.length).toBe(2);
  expect(mockResponse.links[0].source).toBe("repo_app");
});
