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
  .onError(({ code, error }) => {
    console.error(`[Elysia Error] ${code}:`, error);
  })
  .get('/', () => 'TechGraph Backend is Running')
  .get('/api/grafo-tecnologias', async () => {
    const startTime = Date.now();
    const cachedData = cache.get();
    if (cachedData) {
      const duration = Date.now() - startTime;
      console.log(`[Cache HIT] /api/grafo-tecnologias - Retornado em ${duration}ms`);
      return cachedData;
    }

    console.log(`[Cache MISS] /api/grafo-tecnologias - Consultando API do GitHub...`);
    const repos = await githubService.fetchRepositories();
    const languagesMap = new Map<string, Record<string, number>>();

    await githubService.runWithLimit(5, repos, async (repo) => {
      try {
        const langs = await githubService.fetchRepoLanguages(repo.languages_url);
        languagesMap.set(repo.name, langs);
      } catch (err) {
        console.error(`Erro ao obter linguagens para ${repo.name}:`, err);
        languagesMap.set(repo.name, {});
      }
    });

    const graph = buildBipartiteGraph(repos, languagesMap);
    cache.set(graph);

    const duration = Date.now() - startTime;
    console.log(`[Sucesso] /api/grafo-tecnologias - Processado em ${duration}ms`);
    return graph;
  })
  .listen({ port: config.port, hostname: '0.0.0.0' });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export { app };
