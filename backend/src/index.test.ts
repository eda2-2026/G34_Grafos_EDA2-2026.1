import { expect, test, mock } from "bun:test";
import { app } from "./index";

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
  } finally {
    global.fetch = originalFetch;
  }
});
