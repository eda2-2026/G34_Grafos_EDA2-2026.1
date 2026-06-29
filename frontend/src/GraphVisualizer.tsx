import { useMemo, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { GrafoResponse, GrafoNode } from 'shared';

interface Props {
  data: GrafoResponse;
  highlightIds?: Set<string>;
  onNodeClick?: (node: GrafoNode) => void;
  onNodeHover?: (node: GrafoNode | null) => void;
}

const NODE_COLOR_REPO = '#7aa2f7';
const NODE_COLOR_TECH = '#f7768e';
const NODE_COLOR_DIM = '#2a2a3a';
const LINK_COLOR = 'rgba(36,40,59,0.8)';
const LINK_COLOR_DIM = 'rgba(36,40,59,0.2)';

export function GraphVisualizer({ data, highlightIds, onNodeClick, onNodeHover }: Props) {
  const fgRef = useRef<any>(null);

  const degree = useMemo(() => {
    const d: Record<string, number> = {};
    for (const link of data.links) {
      const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
      d[src] = (d[src] || 0) + 1;
      d[tgt] = (d[tgt] || 0) + 1;
    }
    return d;
  }, [data.links]);

  const isFiltering = highlightIds && highlightIds.size > 0;

  const nodeColor = (node: any): string => {
    if (isFiltering && !highlightIds!.has(node.id)) return NODE_COLOR_DIM;
    return node.group === 'repositorio' ? NODE_COLOR_REPO : NODE_COLOR_TECH;
  };

  const nodeVal = (node: any): number => {
    if (node.group === 'tecnologia') return Math.max(2, (degree[node.id] || 1) * 1.5);
    return 3;
  };

  const linkColor = (link: any): string => {
    if (!isFiltering) return LINK_COLOR;
    const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return highlightIds!.has(src) && highlightIds!.has(tgt) ? LINK_COLOR : LINK_COLOR_DIM;
  };

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={data}
      nodeLabel="label"
      nodeColor={nodeColor}
      nodeVal={nodeVal}
      linkColor={linkColor}
      linkWidth={0.5}
      backgroundColor="#0f0f12"
      onNodeClick={(node) => onNodeClick?.(node as GrafoNode)}
      onNodeHover={(node) => onNodeHover?.(node as GrafoNode | null)}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      cooldownTime={3000}
    />
  );
}
