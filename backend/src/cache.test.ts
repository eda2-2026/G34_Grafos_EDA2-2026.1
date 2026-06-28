import { expect, test } from "bun:test";
import { MemoryCache } from "./cache";

test("MemoryCache: set e get básicos", () => {
  const cache = new MemoryCache<string>(10);
  cache.set("dados-do-grafo");
  expect(cache.get()).toBe("dados-do-grafo");
});

test("MemoryCache: clear", () => {
  const cache = new MemoryCache<string>(10);
  cache.set("dados-do-grafo");
  cache.clear();
  expect(cache.get()).toBeNull();
});

test("MemoryCache: expiração por TTL", () => {
  // TTL negativo para expirar instantaneamente
  const cache = new MemoryCache<string>(-1);
  cache.set("dados-expirados");

  expect(cache.get()).toBeNull(); // Deve retornar null pois já expirou
});
