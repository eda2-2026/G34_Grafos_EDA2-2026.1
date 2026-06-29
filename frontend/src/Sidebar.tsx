import { GrafoResponse } from 'shared';

interface Props {
  data: GrafoResponse;
}

export function Sidebar({ data }: Props) {
  const techRanking = data.nodes
    .filter((n) => n.group === 'tecnologia')
    .map((n) => ({
      label: n.label,
      count: data.links.filter(
        (l) => l.target === n.id || (l.target as any)?.id === n.id
      ).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const repoCount = data.nodes.filter((n) => n.group === 'repositorio').length;
  const techCount = data.nodes.filter((n) => n.group === 'tecnologia').length;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Métricas</h3>
        <div className="metric-row">
          <span className="metric-label">Repositórios</span>
          <span className="metric-value">{repoCount}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Tecnologias</span>
          <span className="metric-value">{techCount}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Conexões</span>
          <span className="metric-value">{data.links.length}</span>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">Top Tecnologias</h3>
        <ol className="ranking-list">
          {techRanking.map((item, i) => (
            <li key={item.label} className="ranking-item">
              <span className="rank-num">{i + 1}</span>
              <span className="rank-label">{item.label}</span>
              <span className="rank-count">{item.count}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
