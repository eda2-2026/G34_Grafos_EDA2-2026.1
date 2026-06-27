// Tipos compartilhados do TechGraph
export type GrafoNodeType = 'repositorio' | 'tecnologia';

export interface GrafoNode {
  id: string;
  label: string;
  group: GrafoNodeType;
  stars?: number;
  languagesInfo?: Record<string, number>;
}

/**
 * Representa uma aresta no grafo bipartido.
 * Conecta obrigatoriamente um nó do tipo 'repositorio' a um nó do tipo 'tecnologia'.
 */
export interface GrafoLink {
  source: string;
  target: string;
}

/**
 * Estrutura de dados retornada pelo endpoint do backend contendo os nós e as arestas do grafo.
 */
export interface GrafoResponse {
  nodes: GrafoNode[];
  links: GrafoLink[];
}
