import { useMemo, useRef, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { GrafoResponse, GrafoNode } from 'shared';
import { GraphConfig } from './GraphControls';

interface Props {
  data: GrafoResponse;
  config: GraphConfig;
  highlightIds?: Set<string>;
  onNodeClick?: (node: GrafoNode) => void;
}

const COLOR_REPO  = '#5b8dee';
const COLOR_TECH  = '#e84855';
const COLOR_DIM   = '#1e1e38';
const LINK_ON     = 'rgba(160,185,255,0.5)';
const LINK_DIM    = 'rgba(50,55,90,0.15)';

export function GraphVisualizer({ data, config, highlightIds, onNodeClick }: Props) {
  const fgRef = useRef<any>(null);
  const didMount = useRef(false);

  // Apply physics config reactively — skip d3ReheatSimulation on first mount
  // to avoid race where engineRunning=true before state.layout is initialized
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(config.chargeStrength);
    fg.d3Force('link')?.distance(config.linkDistance);
    if (didMount.current) {
      fg.d3ReheatSimulation?.();
    } else {
      didMount.current = true;
    }
  }, [config.chargeStrength, config.linkDistance]);

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

  // Filter graph data based on config
  const graphData = useMemo(() => {
    const excludedNodes = new Set<string>();

    for (const node of data.nodes) {
      if (node.group === 'tecnologia' && (degree[node.id] || 0) < config.minDegree) {
        excludedNodes.add(node.id);
      }
      if (node.group === 'repositorio' && node.archived && !config.showArchived) {
        excludedNodes.add(node.id);
      }
    }

    if (excludedNodes.size === 0) return data;

    const nodes = data.nodes.filter(n => !excludedNodes.has(n.id));
    const links = data.links.filter(l => {
      const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return !excludedNodes.has(src) && !excludedNodes.has(tgt);
    });
    return { nodes, links };
  }, [data, config.minDegree, config.showArchived, degree]);

  const isFiltering = !!(highlightIds && highlightIds.size > 0);

  const nodeColor = (node: any): string => {
    if (isFiltering && !highlightIds!.has(node.id)) return COLOR_DIM;
    return node.group === 'repositorio' ? COLOR_REPO : COLOR_TECH;
  };

  const nodeVal = (node: any): number => {
    const base = node.group === 'tecnologia'
      ? Math.max(3, (degree[node.id] || 1) * 1.8)
      : 4;
    return base * config.nodeScale;
  };

  const linkColor = (link: any): string => {
    if (!isFiltering) return LINK_ON;
    const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return highlightIds!.has(src) && highlightIds!.has(tgt) ? LINK_ON : LINK_DIM;
  };

  const nodeThreeObject = (node: any) => {
    const dimmed = isFiltering && !highlightIds!.has(node.id);
    const isRepo = node.group === 'repositorio';
    const sprite = new SpriteText(node.label as string);
    sprite.color = dimmed ? 'rgba(80,85,120,0.4)' : isRepo ? '#a8c8ff' : '#ff9aa2';
    sprite.textHeight = isRepo ? 3 : 4;
    sprite.backgroundColor = dimmed ? 'transparent'
      : isRepo ? 'rgba(91,141,238,0.1)' : 'rgba(232,72,85,0.1)';
    sprite.padding = 1.5;
    return sprite;
  };

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={graphData}
      nodeLabel={() => ''}
      nodeColor={nodeColor}
      nodeVal={nodeVal}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={true}
      linkColor={linkColor}
      linkWidth={1.2}
      linkOpacity={0.7}
      linkDirectionalParticles={config.particles ? 2 : 0}
      linkDirectionalParticleSpeed={config.particleSpeed}
      linkDirectionalParticleWidth={1.5}
      backgroundColor="#06060f"
      onNodeClick={(node) => onNodeClick?.(node as GrafoNode)}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
      cooldownTime={3000}
    />
  );
}
