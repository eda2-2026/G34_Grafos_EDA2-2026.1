export type GrafoNodeType = 'repositorio' | 'tecnologia';

export interface GrafoNode {
  id: string;
  label: string;
  group: GrafoNodeType;
  // repo fields
  stars?: number;
  forks?: number;
  openIssues?: number;
  description?: string;
  topics?: string[];
  updatedAt?: string;
  archived?: boolean;
  githubUrl?: string;
  languagesInfo?: Record<string, number>;
  githubUrl?: string;
}

export interface GrafoLink {
  source: string;
  target: string;
}

export interface GrafoResponse {
  nodes: GrafoNode[];
  links: GrafoLink[];
}
