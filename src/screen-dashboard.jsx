// S1 — KPI "Última Atualização" destaca por 24h quando há manuais NOVOS
const SEEN_KEY = "mais_novidades_seen_v1";
function KpiNovidadeCard({ stats }) {
  const hasNew = stats.publishedThisMonth > 0;
  const [isHighlighted, setIsHighlighted] = React.useState(() => {
    if (!hasNew) return false;
    try {
      const seen = localStorage.getItem(SEEN_KEY);
      if (!seen) return true;
      const diff = Date.now() - parseInt(seen, 10);
      return diff < 24 * 60 * 60 * 1000; // 24h
    } catch { return false; }
  });

  React.useEffect(() => {
    if (hasNew) {
      try {
        if (!localStorage.getItem(SEEN_KEY)) {
          localStorage.setItem(SEEN_KEY, Date.now().toString());
        }
      } catch {}
    }
  }, []);

  return (
    <div className={`kpi${isHighlighted ? " kpi-highlight" : ""}`}>
      <span className="kpi-label">Última atualização</span>
      <strong className="kpi-value kpi-value-sm">{stats.lastUpdate || "—"}</strong>
      <span className={isHighlighted ? "kpi-delta" : "kpi-delta kpi-delta-muted"}>
        {isHighlighted ? "🟠 Novidades disponíveis!" : `${stats.activeCategories} ${stats.activeCategories === 1 ? "categoria ativa" : "categorias ativas"}`}
      </span>
    </div>
  );
}

// Dashboard / Biblioteca
const { useState: useStateD, useMemo: useMemoD } = React;

function Dashboard({ data, onOpenManual, onToggleFav, emptyMsg }) {
  const [activeCat, setActiveCat] = useStateD("all");
  const [sort, setSort] = useStateD("recentes");
  const { manuals, categories, stats } = data;

  const filtered = useMemoD(() => {
    let r = [...manuals];
    if (activeCat !== "all") r = r.filter(m => m.cat === activeCat);
    // Always: ready items first sorted A-Z, soon items last sorted A-Z
    r.sort((a, b) => {
      if (a.status === "soon" && b.status !== "soon") return 1;
      if (a.status !== "soon" && b.status === "soon") return -1;
      if (sort === "recentes") {
        // NEW tagged first among ready
        if (a.status !== "soon" && b.status !== "soon") {
          if (a.tag && !b.tag) return -1;
          if (!a.tag && b.tag) return 1;
        }
      }
      return a.title.localeCompare(b.title, "pt-BR");
    });
    return r;
  }, [manuals, activeCat, sort]);

  return (
    <div className="dash">
      {/* HERO — sem campo de busca duplicado */}
      <section className="dash-hero">
        <div>
          <div className="dash-welcome">Seja bem-vindo(a) ao Portal <span>MAIS</span> 👋</div>
          <span className="eyebrow">PORTAL · <em>Operação MAIS</em></span>
          <h1>Central de rotinas MAIS</h1>
          <p>Consulte os manuais oficiais da operação — conteúdo oficial, organizado e atualizado no NotebookLM.</p>
        </div>
        <div className="dash-hero-side">
          <div className="kpi">
            <span className="kpi-label">Publicados</span>
            <strong className="kpi-value">{stats.totalManuals}</strong>
            <span className="kpi-delta">+ {stats.publishedThisMonth} novos este mês</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Em produção</span>
            <strong className="kpi-value">{stats.soonManuals}</strong>
            <span className="kpi-delta kpi-delta-muted">aguardando publicação</span>
          </div>
          <KpiNovidadeCard stats={stats}/>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="dash-toolbar">
        <div className="cat-chips">
          <button className={`chip${activeCat === "all" ? " is-active" : ""}`} onClick={() => setActiveCat("all")}>
            Todos <span className="chip-count">{manuals.length}</span>
          </button>
          {[...categories].sort((a,b) => a.label.localeCompare(b.label)).map(c => {
            const count = manuals.filter(m => m.cat === c.id).length;
            return (
              <button key={c.id} className={`chip${activeCat === c.id ? " is-active" : ""}`}
                onClick={() => setActiveCat(c.id)} style={{ "--cat": c.color }}>
                <span className="chip-dot"/>
                {c.label} <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="toolbar-right">
          <div className="sort-btn">
            <Icon name="sort" size={14}/>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recentes">Recentes / Novos</option>
              <option value="alfabetica">A → Z</option>
            </select>
          </div>
        </div>
      </section>

      {/* GRID */}
      <CardsGrid list={filtered} onOpen={onOpenManual} onToggleFav={onToggleFav}/>

      {filtered.length === 0 && (
        <div className="empty">
          <Icon name="bookmark" size={28}/>
          <h4>Nenhum manual aqui</h4>
          <p>{emptyMsg || "Tente outro filtro."}</p>
        </div>
      )}
    </div>
  );
}

function CardsGrid({ list, onOpen, onToggleFav }) {
  const sorted = [...list].sort((a, b) => (a.status === "soon" ? 1 : 0) - (b.status === "soon" ? 1 : 0));
  return (
    <div className="cards-grid">
      {sorted.map(m => {
        const soon = m.status === "soon";
        return (
          <article key={m.id} className={`manual-card${soon ? " is-soon" : ""}`}
            onClick={() => !soon && onOpen(m)}>
            <ManualThumb manual={m} height={132} big/>
            <div className="manual-card-body">
              <CategoryTag category={m.category}/>
              <h4>{m.title}</h4>
              <p>{m.summary}</p>
              <footer className="manual-card-foot">
                {soon ? (
                  <div className="mcm mcm-soon">
                    <Icon name="clock" size={13}/>
                    <span>Em breve no portal</span>
                  </div>
                ) : (
                  <>
                    {m.updated && <div className="mcm mcm-right"><span className="muted">{m.updated}</span></div>}
                  </>
                )}
              </footer>
            </div>
            {!soon && (
              <button className={`manual-card-fav${m.fav ? " is-fav" : ""}`}
                onClick={(e) => { e.stopPropagation(); onToggleFav && onToggleFav(m.id); }}>
                <Icon name={m.fav ? "bookmarkF" : "bookmark"} size={16}/>
              </button>
            )}
            {!soon && (
              <div className="manual-card-launch">
                <Icon name="arrow" size={14}/>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

window.Dashboard = Dashboard;
