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

export interface GrafoResponse {
  nodes: GrafoNode[];
  links: GrafoLink[];
}
