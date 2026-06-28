import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { loadConfig } from './config';
import { GitHubService } from './github';
import { buildBipartiteGraph } from './graph';
import { MemoryCache } from './cache';
import { GrafoResponse } from 'shared';

const config = loadConfig();
const githubService = new GitHubService(config);
const cache = new MemoryCache<GrafoResponse>(60);

const app = new Elysia()
  .use(cors())
  .get('/', () => 'TechGraph Backend is Running')
  .get('/api/grafo-tecnologias', async () => {
    const cachedData = cache.get();
    if (cachedData) {
      return cachedData;
    }

    const repos = await githubService.fetchRepositories();
    const languagesMap = new Map<string, Record<string, number>>();

    await githubService.runWithLimit(5, repos, async (repo) => {
      try {
        const langs = await githubService.fetchRepoLanguages(repo.languages_url);
        languagesMap.set(repo.name, langs);
      } catch (err) {
        languagesMap.set(repo.name, {});
      }
    });

    const graph = buildBipartiteGraph(repos, languagesMap);
    cache.set(graph);
    return graph;
  })
  .listen(config.port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export { app };
