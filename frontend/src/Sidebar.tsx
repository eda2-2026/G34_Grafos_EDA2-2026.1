import { GrafoResponse } from 'shared';

interface Props {
  data: GrafoResponse;
}

export function Sidebar({ data }: Props) {
  const techRanking = data.nodes
    .filter(n => n.group === 'tecnologia')
    .map(n => ({
      label: n.label,
      count: data.links.filter(l =>
        l.target === n.id || (l.target as any)?.id === n.id
      ).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const maxCount = techRanking[0]?.count ?? 1;
  const repoCount  = data.nodes.filter(n => n.group === 'repositorio').length;
  const techCount  = data.nodes.filter(n => n.group === 'tecnologia').length;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <p className="sidebar-title">Métricas</p>
        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-num">{repoCount}</span>
            <span className="metric-label">Repos</span>
          </div>
          <div className="metric-card">
            <span className="metric-num">{techCount}</span>
            <span className="metric-label">Techs</span>
          </div>
          <div className="metric-card metric-card-wide">
            <span className="metric-num">{data.links.length}</span>
            <span className="metric-label">Conexões</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">Top Tecnologias</p>
        <ol className="ranking-list">
          {techRanking.map((item, i) => (
            <li key={item.label} className="ranking-item">
              <span className="rank-num">{i + 1}</span>
              <div className="rank-body">
                <div className="rank-top">
                  <span className="rank-label">{item.label}</span>
                  <span className="rank-count">{item.count}</span>
                </div>
                <div className="rank-bar-track">
                  <div
                    className="rank-bar-fill"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
