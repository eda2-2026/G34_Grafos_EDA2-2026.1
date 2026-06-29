import { GrafoNode, GrafoResponse } from 'shared';

interface Props {
  node: GrafoNode;
  data: GrafoResponse;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)}KB`;
  return `${bytes}B`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function NodeDetail({ node, data, onClose }: Props) {
  const isRepo = node.group === 'repositorio';

  const connectedNodes = data.links
    .filter(l => {
      const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return src === node.id || tgt === node.id;
    })
    .map(l => {
      const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return data.nodes.find(n => n.id === (src === node.id ? tgt : src));
    })
    .filter(Boolean) as GrafoNode[];

  const totalBytes = node.languagesInfo
    ? Object.values(node.languagesInfo).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="node-detail">
      <div className="node-detail-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className={`node-badge ${isRepo ? 'badge-repo' : 'badge-tech'}`}>
              {isRepo ? '⬡ Repositório' : '◈ Tecnologia'}
            </span>
            {node.archived && <span className="archived-badge">Arquivado</span>}
          </div>
          <h2 className="node-detail-title">{node.label}</h2>
          {node.description && <p className="node-description">{node.description}</p>}
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Fechar">✕</button>
      </div>

      <div className="node-detail-body">
        {isRepo && (
          <>
            <div className="stats-grid">
              {node.stars !== undefined && (
                <div className="stat-card">
                  <span className="stat-num">{node.stars.toLocaleString()}</span>
                  <span className="stat-label">⭐ Stars</span>
                </div>
              )}
              {node.forks !== undefined && (
                <div className="stat-card">
                  <span className="stat-num">{node.forks.toLocaleString()}</span>
                  <span className="stat-label">⑂ Forks</span>
                </div>
              )}
              {node.openIssues !== undefined && (
                <div className="stat-card">
                  <span className="stat-num">{node.openIssues.toLocaleString()}</span>
                  <span className="stat-label">● Issues</span>
                </div>
              )}
              <div className="stat-card">
                <span className="stat-num">{connectedNodes.length}</span>
                <span className="stat-label">◈ Techs</span>
              </div>
            </div>

            {node.updatedAt && (
              <div className="detail-row">
                <span className="detail-label">Atualizado</span>
                <span className="detail-value">{formatDate(node.updatedAt)}</span>
              </div>
            )}

            {node.githubUrl && (
              <a href={node.githubUrl} target="_blank" rel="noopener noreferrer" className="github-link">
                Ver no GitHub ↗
              </a>
            )}

            {node.topics && node.topics.length > 0 && (
              <div className="detail-section">
                <p className="detail-section-title">Tópicos</p>
                <div className="topics-list">
                  {node.topics.map(t => <span key={t} className="topic-tag">{t}</span>)}
                </div>
              </div>
            )}

            {node.languagesInfo && Object.keys(node.languagesInfo).length > 0 && (
              <div className="detail-section">
                <p className="detail-section-title">Linguagens</p>
                <ul className="lang-list">
                  {Object.entries(node.languagesInfo)
                    .sort(([, a], [, b]) => b - a)
                    .map(([lang, bytes]) => {
                      const pct = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0';
                      return (
                        <li key={lang} className="lang-item">
                          <div className="lang-info">
                            <span className="lang-name">{lang}</span>
                            <span className="lang-bytes">{pct}% · {formatBytes(bytes)}</span>
                          </div>
                          <div className="lang-bar-bg">
                            <div className="lang-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </>
        )}

        {!isRepo && (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-card-wide">
                <span className="stat-num">{connectedNodes.length}</span>
                <span className="stat-label">⬡ Repositórios</span>
              </div>
            </div>
            <div className="detail-section">
              <p className="detail-section-title">
                Usado em {connectedNodes.length} repositório{connectedNodes.length !== 1 ? 's' : ''}
              </p>
              <ul className="repo-list">
                {connectedNodes
                  .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
                  .map(n => (
                    <li key={n.id} className="repo-list-item">
                      <span>
                        {n.label}
                        {n.archived && <span className="archived-inline"> [arch]</span>}
                      </span>
                      {n.stars !== undefined && <span className="repo-stars">⭐ {n.stars}</span>}
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
