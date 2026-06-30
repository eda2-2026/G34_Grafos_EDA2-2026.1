import { useState } from 'react';

export interface GraphConfig {
  particles: boolean;
  particleSpeed: number;   // 0.003 – 0.012
  nodeScale: number;       // 0.5 – 3.0
  chargeStrength: number;  // -30 – -400
  linkDistance: number;    // 30 – 300
  minDegree: number;       // hide tech nodes with fewer connections
  showArchived: boolean;
}

export const DEFAULT_CONFIG: GraphConfig = {
  particles: false,
  particleSpeed: 0.006,
  nodeScale: 1,
  chargeStrength: -120,
  linkDistance: 80,
  minDegree: 1,
  showArchived: true,
};

interface Props {
  config: GraphConfig;
  onChange: (next: Partial<GraphConfig>) => void;
}

function Slider({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="ctrl-row">
      <span className="ctrl-label">{label}</span>
      <div className="ctrl-right">
        <input
          type="range" min={min} max={max} step={step} value={value}
          className="ctrl-slider"
          onChange={e => onChange(parseFloat(e.target.value))}
        />
        <span className="ctrl-val">{format ? format(value) : value}</span>
      </div>
    </div>
  );
}

export function GraphControls({ config, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`graph-controls ${open ? 'is-open' : ''}`}>
      <button className="ctrl-toggle" onClick={() => setOpen(o => !o)}>
        <span className="ctrl-toggle-icon">⚙</span>
        <span className="ctrl-toggle-label">Controles</span>
        <span className="ctrl-toggle-chevron">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="ctrl-panel">
          <div className="ctrl-group">
            <p className="ctrl-group-title">Visual</p>
            <div className="ctrl-row">
              <span className="ctrl-label">Partículas nos links</span>
              <button
                className={`ctrl-toggle-pill ${config.particles ? 'active' : ''}`}
                onClick={() => onChange({ particles: !config.particles })}
              >
                {config.particles ? 'ON' : 'OFF'}
              </button>
            </div>
            {config.particles && (
              <Slider label="Velocidade" value={config.particleSpeed}
                min={0.002} max={0.015} step={0.001}
                format={v => `${(v * 1000).toFixed(0)}`}
                onChange={v => onChange({ particleSpeed: v })} />
            )}
            <Slider label="Tamanho dos nós" value={config.nodeScale}
              min={0.4} max={3} step={0.1}
              format={v => `${v.toFixed(1)}×`}
              onChange={v => onChange({ nodeScale: v })} />
          </div>

          <div className="ctrl-group">
            <p className="ctrl-group-title">Física</p>
            <Slider label="Repulsão" value={config.chargeStrength}
              min={-400} max={-20} step={10}
              format={v => `${v}`}
              onChange={v => onChange({ chargeStrength: v })} />
            <Slider label="Distância links" value={config.linkDistance}
              min={20} max={300} step={5}
              format={v => `${v}px`}
              onChange={v => onChange({ linkDistance: v })} />
          </div>

          <div className="ctrl-group">
            <p className="ctrl-group-title">Filtros</p>
            <Slider label="Conexões mínimas" value={config.minDegree}
              min={1} max={10} step={1}
              format={v => `≥${v} repo${v > 1 ? 's' : ''}`}
              onChange={v => onChange({ minDegree: v })} />
            <div className="ctrl-row">
              <span className="ctrl-label">Repos arquivados</span>
              <button
                className={`ctrl-toggle-pill ${config.showArchived ? 'active' : ''}`}
                onClick={() => onChange({ showArchived: !config.showArchived })}
              >
                {config.showArchived ? 'Visíveis' : 'Ocultos'}
              </button>
            </div>
          </div>

          <button className="ctrl-reset" onClick={() => onChange({ ...DEFAULT_CONFIG })}>
            Resetar padrões
          </button>
        </div>
      )}
    </div>
  );
}
