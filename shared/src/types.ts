// Tipos compartilhados do TechGraph
export interface GrafoNode {
  id: string;
  label: string;
  group: 'repositorio' | 'tecnologia';
}

export interface GrafoLink {
  source: string;
  target: string;
}

export interface GrafoResponse {
  nodes: GrafoNode[];
  links: GrafoLink[];
}
