import { useEffect, useState, useMemo } from 'react';
import { GrafoResponse, GrafoNode } from 'shared';
import { GraphVisualizer } from './GraphVisualizer';
import { Sidebar } from './Sidebar';
import { NodeDetail } from './NodeDetail';

function App() {
  const [data, setData] = useState<GrafoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GrafoNode | null>(null);

  useEffect(() => {
    fetch('/api/grafo-tecnologias')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json() as Promise<GrafoResponse>;
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const highlightIds = useMemo<Set<string>>(() => {
    if (!data || !search.trim()) return new Set();
    const q = search.toLowerCase();
    const matched = data.nodes
      .filter((n) => n.label.toLowerCase().includes(q))
      .map((n) => n.id);
    if (matched.length === 0) return new Set();

    const matchedSet = new Set(matched);
    const neighborIds = new Set<string>();
    for (const link of data.links) {
      const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (matchedSet.has(src)) neighborIds.add(tgt);
      if (matchedSet.has(tgt)) neighborIds.add(src);
    }
    return new Set([...matchedSet, ...neighborIds]);
  }, [data, search]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <h1>TechGraph</h1>
          <span className="header-sub">Mapeamento Tecnológico de Repositórios</span>
        </div>
        <div className="search-bar">
          <input
            type="search"
            placeholder="Buscar tecnologia ou repositório..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </header>

      <div className="app-body">
        {data && <Sidebar data={data} />}

        <main className="graph-area">
          {loading && <p className="status-msg loading-msg">Carregando dados da organização...</p>}
          {error && <p className="status-msg error-msg">Erro: {error}</p>}
          {data && (
            <GraphVisualizer
              data={data}
              highlightIds={highlightIds}
              onNodeClick={setSelected}
            />
          )}
        </main>

        {selected && data && (
          <NodeDetail
            node={selected}
            data={data}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
