import { useMemo, useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { GrafoResponse, GrafoNode } from 'shared';

interface Props {
  data: GrafoResponse;
  highlightIds?: Set<string>;
  onNodeClick?: (node: GrafoNode) => void;
  onNodeHover?: (node: GrafoNode | null) => void;
}

const COLOR_REPO       = '#7aa2f7';
const COLOR_TECH       = '#f7768e';
const COLOR_DIM        = '#2a2a3a';
const LINK_ACTIVE      = 'rgba(180,200,255,0.55)';
const LINK_DIM         = 'rgba(60,65,90,0.2)';

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

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const nodeCount = data.nodes.length;
    const charge = Math.min(-80, -20 * Math.log2(Math.max(nodeCount, 2)));
    fg.d3Force('charge')?.strength(charge);
  }, [data.nodes.length]);

  const isFiltering = !!(highlightIds && highlightIds.size > 0);

  const nodeColor = (node: any): string => {
    if (isFiltering && !highlightIds!.has(node.id)) return COLOR_DIM;
    return node.group === 'repositorio' ? COLOR_REPO : COLOR_TECH;
  };

  const nodeVal = (node: any): number => {
    if (node.group === 'tecnologia') return Math.max(3, (degree[node.id] || 1) * 1.8);
    return 4;
  };

  const linkColor = (link: any): string => {
    if (!isFiltering) return LINK_ACTIVE;
    const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return highlightIds!.has(src) && highlightIds!.has(tgt) ? LINK_ACTIVE : LINK_DIM;
  };

  const nodeThreeObject = (node: any) => {
    const dimmed = isFiltering && !highlightIds!.has(node.id);
    const isRepo = node.group === 'repositorio';
    const sprite = new SpriteText(node.label as string);
    sprite.color = dimmed ? 'rgba(100,100,120,0.4)' : isRepo ? '#c0d4ff' : '#ffb3be';
    sprite.textHeight = isRepo ? 3.5 : 4.5;
    sprite.backgroundColor = dimmed
      ? 'rgba(0,0,0,0)'
      : isRepo
      ? 'rgba(122,162,247,0.12)'
      : 'rgba(247,118,142,0.12)';
    sprite.padding = 1.5;
    sprite.borderRadius = 2;
    return sprite;
  };

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={data}
      nodeLabel={() => ''}
      nodeColor={nodeColor}
      nodeVal={nodeVal}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={true}
      linkColor={linkColor}
      linkWidth={1.2}
      linkOpacity={0.7}
      backgroundColor="#0a0a0f"
      onNodeClick={(node) => onNodeClick?.(node as GrafoNode)}
      onNodeHover={(node) => onNodeHover?.(node as GrafoNode | null)}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      cooldownTime={3000}
    />
  );
}
