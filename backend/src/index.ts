import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => 'TechGraph Backend is Running')
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
