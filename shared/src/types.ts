// Tipos compartilhados do TechGraph
export type GrafoNodeType = 'repositorio' | 'tecnologia';

export interface GrafoNode {
  id: string;
  label: string;
  group: GrafoNodeType;
}

export interface GrafoLink {
  source: string;
  target: string;
}

export interface GrafoResponse {
  nodes: GrafoNode[];
  links: GrafoLink[];
}
