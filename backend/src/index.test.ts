import { expect, test, mock, beforeEach } from "bun:test";
import { app, cache } from "./index";

beforeEach(() => cache.clear());

test("Elysia: Rota raiz retorna status ok", async () => {
  const response = await app.handle(new Request("http://localhost/")).then(r => r.text());
  expect(response).toBe("TechGraph Backend is Running");
});

test("Elysia: Rota /api/grafo-tecnologias retorna os dados do grafo", async () => {
  // Mock global fetch para retornar dados mockados da API do GitHub e evitar chamadas reais
  const originalFetch = global.fetch;
  global.fetch = mock((url: string) => {
    if (url.includes("/repos")) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              name: "repo-1",
              stargazers_count: 10,
              languages_url: "https://api.github.com/languages-1",
              html_url: "https://github.com/mock/repo-1",
            },
          ]),
          { status: 200 }
        )
      );
    } else if (url.includes("/languages-1")) {
      return Promise.resolve(
        new Response(
          JSON.stringify({ TypeScript: 8000 }),
          { status: 200 }
        )
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
  }) as any;

  try {
    const response = await app.handle(new Request("http://localhost/api/grafo-tecnologias"));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.nodes.length).toBe(2); // repo-1 e TypeScript
    expect(data.links.length).toBe(1);  // repo-1 -> TypeScript

    const repoNode = data.nodes.find((n: any) => n.id === "repo_repo-1");
    expect(repoNode).toBeDefined();
    expect(repoNode.githubUrl).toBe("https://github.com/mock/repo-1");
  } finally {
    global.fetch = originalFetch;
  }
});

test("Elysia: Repos sem linguagens não geram nós de tecnologia", async () => {
  const originalFetch = global.fetch;
  global.fetch = mock((url: string) => {
    if (url.includes("/repos")) {
      return Promise.resolve(
        new Response(
          JSON.stringify([
            {
              name: "repo-vazio",
              stargazers_count: 0,
              languages_url: "https://api.github.com/languages-vazio",
              html_url: "https://github.com/mock/repo-vazio",
            },
          ]),
          { status: 200 }
        )
      );
    } else if (url.includes("/languages-vazio")) {
      // Repositório sem linguagens catalogadas
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
  }) as any;

  try {
    const response = await app.handle(new Request("http://localhost/api/grafo-tecnologias"));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.nodes.length).toBe(1); // apenas o nó do repo
    expect(data.links.length).toBe(0); // sem conexões
    expect(data.nodes[0].languagesInfo).toBeUndefined(); // sem languagesInfo vazio
  } finally {
    global.fetch = originalFetch;
  }
});
