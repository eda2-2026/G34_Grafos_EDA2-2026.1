import { useEffect, useState, useMemo, useCallback } from 'react';
import { GrafoResponse, GrafoNode } from 'shared';
import { GraphVisualizer } from './GraphVisualizer';
import { GraphControls, GraphConfig, DEFAULT_CONFIG } from './GraphControls';
import { Sidebar } from './Sidebar';
import { NodeDetail } from './NodeDetail';

const LOADING_HINTS = [
  'Conectando à API do GitHub…',
  'Buscando repositórios da organização…',
  'Mapeando linguagens de cada repo…',
  'Construindo grafo bipartido…',
  'Quase lá…',
];

async function fetchGraph(): Promise<GrafoResponse> {
  const res = await fetch('/api/grafo-tecnologias');
  const text = await res.text();
  if (!text.trim()) throw new Error('Servidor retornou resposta vazia. Verifique o backend.');
  const json = JSON.parse(text);
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json as GrafoResponse;
}

function App() {
  const [data, setData]         = useState<GrafoResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [hint, setHint]         = useState(0);
  const [error, setError]       = useState<string | null>(null);
  const [retryIn, setRetryIn]   = useState<number | null>(null);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<GrafoNode | null>(null);
  const [config, setConfig]     = useState<GraphConfig>(DEFAULT_CONFIG);

  const updateConfig = useCallback((next: Partial<GraphConfig>) => {
    setConfig(c => ({ ...c, ...next }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRetryIn(null);
    try {
      const d = await fetchGraph();
      setData(d);
    } catch (err: any) {
      const msg: string = err.message ?? String(err);
      setError(msg);
      let t = 8;
      setRetryIn(t);
      const iv = setInterval(() => {
        t -= 1;
        if (t <= 0) { clearInterval(iv); setRetryIn(null); load(); }
        else setRetryIn(t);
      }, 1000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setHint(h => (h + 1) % LOADING_HINTS.length), 2200);
    return () => clearInterval(iv);
  }, [loading]);

  const highlightIds = useMemo<Set<string>>(() => {
    if (!data || !search.trim()) return new Set();
    const q = search.toLowerCase();
    const matched = data.nodes.filter(n => n.label.toLowerCase().includes(q)).map(n => n.id);
    if (!matched.length) return new Set();
    const matchedSet = new Set(matched);
    const neighbors = new Set<string>();
    for (const link of data.links) {
      const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (matchedSet.has(src)) neighbors.add(tgt);
      if (matchedSet.has(tgt)) neighbors.add(src);
    }
    return new Set([...matchedSet, ...neighbors]);
  }, [data, search]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">⬡</span>
          <h1>TechGraph</h1>
          <span className="header-sub">Mapeamento Tecnológico</span>
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-dot legend-dot-repo" />Repositório</span>
          <span className="legend-item"><span className="legend-dot legend-dot-tech" />Tecnologia</span>
        </div>
        <div className="search-bar">
          <span className="search-icon">⌕</span>
          <input
            type="search"
            placeholder="Buscar tecnologia ou repositório…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </header>

      <div className="app-body">
        {data && <Sidebar data={data} />}

        <main className="graph-area">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <p className="loading-hint">{LOADING_HINTS[hint]}</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-card">
              <span className="error-icon">⚠</span>
              <p className="error-title">Não foi possível carregar o grafo</p>
              <p className="error-detail">{error}</p>
              {retryIn !== null
                ? <p className="retry-msg">Tentando novamente em {retryIn}s…</p>
                : <button className="retry-btn" onClick={load}>Tentar novamente</button>}
            </div>
          )}

          {data && (
            <>
              <GraphVisualizer
                data={data}
                config={config}
                highlightIds={highlightIds}
                onNodeClick={setSelected}
              />
              <GraphControls config={config} onChange={updateConfig} />
            </>
          )}
        </main>

        {selected && data && (
          <NodeDetail node={selected} data={data} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
