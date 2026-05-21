// Dashboard / Biblioteca
const { useState: useStateD, useMemo: useMemoD } = React;

function Dashboard({ data, onOpenManual, onToggleFav, emptyMsg }) {
  const [activeCat, setActiveCat] = useStateD("all");
  const [sort, setSort] = useStateD("recentes");
  const { manuals, categories, stats } = data;

  const filtered = useMemoD(() => {
    let r = [...manuals];
    if (activeCat !== "all") r = r.filter(m => m.cat === activeCat);
    if (sort === "alfabetica") r.sort((a, b) => a.title.localeCompare(b.title));
    else /* recentes */        r.sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
    return r;
  }, [manuals, activeCat, sort]);

  return (
    <div className="dash">
      {/* HERO — sem campo de busca duplicado */}
      <section className="dash-hero">
        <div>
          <span className="eyebrow">PORTAL · <em>Operação MAIS</em></span>
          <h1>Manuais de rotina<br/>da operação MAIS</h1>
          <p>Tudo que sua equipe precisa pra rodar o dia. Conteúdo oficial mantido no NotebookLM, organizado e buscável aqui no portal.</p>
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
          <div className="kpi">
            <span className="kpi-label">Última atualização</span>
            <strong className="kpi-value kpi-value-sm">{stats.lastUpdate || "—"}</strong>
            <span className="kpi-delta kpi-delta-muted">{stats.activeCategories} categori{stats.activeCategories === 1 ? "a ativa" : "as ativas"}</span>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="dash-toolbar">
        <div className="cat-chips">
          <button className={`chip${activeCat === "all" ? " is-active" : ""}`} onClick={() => setActiveCat("all")}>
            Todos <span className="chip-count">{manuals.length}</span>
          </button>
          {categories.map(c => {
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
