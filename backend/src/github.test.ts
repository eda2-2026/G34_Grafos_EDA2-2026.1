import { expect, test, mock } from "bun:test";
import { GitHubService } from "./github";
import { AppConfig } from "./config";

const mockConfig: AppConfig = {
  githubToken: "mock-token",
  githubOrg: "mock-org",
  port: 3000,
};

test("GitHubService: getHeaders e inicialização", () => {
  const service = new GitHubService(mockConfig);
  expect(service).toBeDefined();
});

test("GitHubService: fetchRepositories com resposta mockada", async () => {
  const service = new GitHubService(mockConfig);

  // Mock do global fetch
  const originalFetch = global.fetch;
  global.fetch = mock(() => {
    return Promise.resolve(
      new Response(
        JSON.stringify([
          {
            name: "repo-test-1",
            stargazers_count: 5,
            languages_url: "https://api.github.com/languages-1",
            html_url: "https://github.com/mock-org/repo-test-1",
          },
        ]),
        { status: 200, statusText: "OK" }
      )
    );
  }) as any;

  try {
    const repos = await service.fetchRepositories();
    expect(repos.length).toBe(1);
    expect(repos[0].name).toBe("repo-test-1");
  } finally {
    global.fetch = originalFetch; // Restaurando o fetch global original
  }
});

test("GitHubService: runWithLimit concorrência", async () => {
  const service = new GitHubService(mockConfig);
  const items = [1, 2, 3, 4, 5];
  const processed: number[] = [];

  const results = await service.runWithLimit(2, items, async (num) => {
    processed.push(num);
    return num * 2;
  });

  expect(results).toEqual([2, 4, 6, 8, 10]);
  expect(processed.length).toBe(5);
});
