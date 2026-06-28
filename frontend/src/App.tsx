import React, { useEffect, useState } from 'react';
import { GrafoResponse } from 'shared';

function App() {
  const [data, setData] = useState<GrafoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/grafo-tecnologias')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro HTTP: ${res.status} - ${res.statusText}`);
        }
        return res.json() as Promise<GrafoResponse>;
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erro desconhecido');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>TechGraph - Mapeamento Tecnológico</h1>
        <p className="subtitle">Visualização de Grafos Bipartidos Organizacionais</p>
      </header>

      <main className="main-content">
        {loading && <p className="loading">Carregando dados da organização do GitHub...</p>}
        {error && <p className="error">Ocorreu um erro: {error}</p>}
        
        {data && (
          <div className="debug-box">
            <h2>Dados Conectados do Grafo (Modo de Depuração)</h2>
            <div className="stats">
              <span className="badge">Nós: {data.nodes.length}</span>
              <span className="badge">Links: {data.links.length}</span>
            </div>
            <pre className="json-output">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;