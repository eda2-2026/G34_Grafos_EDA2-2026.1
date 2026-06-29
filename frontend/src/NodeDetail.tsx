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

export function NodeDetail({ node, data, onClose }: Props) {
  const isRepo = node.group === 'repositorio';

  const connectedNodes = data.links
    .filter((l) => {
      const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
      return src === node.id || tgt === node.id;
    })
    .map((l) => {
      const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
      const otherId = src === node.id ? tgt : src;
      return data.nodes.find((n) => n.id === otherId);
    })
    .filter(Boolean) as GrafoNode[];

  const totalBytes = node.languagesInfo
    ? Object.values(node.languagesInfo).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="node-detail">
      <div className="node-detail-header">
        <div>
          <span className={`node-badge ${isRepo ? 'badge-repo' : 'badge-tech'}`}>
            {isRepo ? 'Repositório' : 'Tecnologia'}
          </span>
          <h2 className="node-detail-title">{node.label}</h2>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Fechar">✕</button>
      </div>

      <div className="node-detail-body">
        {isRepo && (
          <>
            {node.stars !== undefined && (
              <div className="detail-row">
                <span className="detail-label">⭐ Estrelas</span>
                <span className="detail-value">{node.stars}</span>
              </div>
            )}
            {node.languagesInfo && Object.keys(node.languagesInfo).length > 0 && (
              <div className="detail-section">
                <h4 className="detail-section-title">Linguagens</h4>
                <ul className="lang-list">
                  {Object.entries(node.languagesInfo)
                    .sort(([, a], [, b]) => b - a)
                    .map(([lang, bytes]) => {
                      const pct = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0';
                      return (
                        <li key={lang} className="lang-item">
                          <div className="lang-info">
                            <span className="lang-name">{lang}</span>
                            <span className="lang-bytes">{formatBytes(bytes)}</span>
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
          <div className="detail-section">
            <h4 className="detail-section-title">
              Repositórios que usam {node.label} ({connectedNodes.length})
            </h4>
            <ul className="repo-list">
              {connectedNodes.map((n) => (
                <li key={n.id} className="repo-list-item">
                  {n.label}
                  {n.stars !== undefined && (
                    <span className="repo-stars">⭐ {n.stars}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
