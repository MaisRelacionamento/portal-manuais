// Dashboard / Biblioteca — 3 layout variations: cards, list, editorial
const { useState: useStateD, useMemo: useMemoD } = React;

function Dashboard({ data, onOpenManual, variant = "cards" }) {
  const [search, setSearch] = useStateD("");
  const [activeCat, setActiveCat] = useStateD("all");
  const [sort, setSort] = useStateD("recentes");
  const [showOnly, setShowOnly] = useStateD("all"); // all | fav
  const { manuals, categories, stats } = data;

  const filtered = useMemoD(() => {
    let r = [...manuals];
    if (activeCat !== "all") r = r.filter(m => m.cat === activeCat);
    if (showOnly === "fav") r = r.filter(m => m.fav);
    if (search) r = r.filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.summary || "").toLowerCase().includes(search.toLowerCase()));
    if (sort === "alfabetica") r.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "lidos")  r.sort((a, b) => b.reads - a.reads);
    else /* recentes */         r.sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0));
    return r;
  }, [manuals, activeCat, showOnly, search, sort]);

  const featured = manuals.find(m => m.tag === "NOVO") || manuals[0];

  return (
    <div className="dash">
      {/* HERO */}
      <section className="dash-hero">
        <div>
          <span className="eyebrow">PORTAL · <em>Operação MAIS</em></span>
          <h1>Manuais de rotina<br/>da operação MAIS</h1>
          <p>Tudo que sua equipe precisa pra rodar o dia. Conteúdo oficial mantido no NotebookLM, organizado e buscável aqui no portal.</p>
          <div className="dash-hero-actions">
            <SearchInput value={search} onChange={setSearch} size="lg"/>
          </div>
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
            <strong className="kpi-value kpi-value-sm">{stats.lastUpdate}</strong>
            <span className="kpi-delta kpi-delta-muted">{stats.activeCategories} categorias ativas</span>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="dash-toolbar">
        <div className="cat-chips">
          <button className={`chip${activeCat === "all" ? " is-active" : ""}`} onClick={() => setActiveCat("all")}>
            Todos <span className="chip-count">{manuals.length}</span>
          </button>
          {categories.map(c => (
            <button key={c.id} className={`chip${activeCat === c.id ? " is-active" : ""}`}
              onClick={() => setActiveCat(c.id)} style={{ "--cat": c.color }}>
              <span className="chip-dot"/>
              {c.label} <span className="chip-count">{manuals.filter(m => m.cat === c.id).length}</span>
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="seg">
            <button className={showOnly === "all" ? "is-active" : ""} onClick={() => setShowOnly("all")}>Todos</button>
            <button className={showOnly === "fav" ? "is-active" : ""} onClick={() => setShowOnly("fav")}>Favoritos</button>
          </div>
          <div className="sort-btn">
            <Icon name="sort" size={14}/>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recentes">Recentes / Novos</option>
              <option value="alfabetica">A → Z</option>
              <option value="lidos">Mais acessados</option>
            </select>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      {variant === "cards"     && <CardsGrid    list={filtered} onOpen={onOpenManual}/>}
      {variant === "list"      && <ListLayout   list={filtered} onOpen={onOpenManual}/>}
      {variant === "editorial" && <EditorialGrid list={filtered} featured={featured} categories={categories} onOpen={onOpenManual}/>}

      {filtered.length === 0 && (
        <div className="empty">
          <Icon name="search" size={28}/>
          <h4>Nada encontrado</h4>
          <p>Tente outra palavra-chave ou limpe os filtros.</p>
        </div>
      )}
    </div>
  );
}

// ---------- Variant A: Cards grid ----------
function CardsGrid({ list, onOpen }) {
  // Ready first, soon at the end — auto-sort regardless of incoming order
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
                  <>
                    <div className="mcm mcm-soon">
                      <Icon name="clock" size={13}/>
                      <span>Em breve no portal</span>
                    </div>
                    <div className="mcm mcm-right">
                      <span className="muted">aguardando</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mcm"><Icon name="clock" size={13}/><span>{m.minutes} min</span></div>
                    <div className="mcm"><Icon name="eye" size={13}/><span>{m.reads.toLocaleString("pt-BR")}</span></div>
                    <div className="mcm mcm-right"><span className="muted">{m.updated}</span></div>
                  </>
                )}
              </footer>
            </div>
            {!soon && (
              <button className={`manual-card-fav${m.fav ? " is-fav" : ""}`}
                onClick={(e) => { e.stopPropagation(); m.fav = !m.fav; e.currentTarget.classList.toggle("is-fav"); }}>
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

// ---------- Variant B: List (dense, for power users) ----------
function ListLayout({ list, onOpen }) {
  return (
    <div className="list-table">
      <header className="list-head">
        <span className="lh-title">Manual</span>
        <span className="lh-cat">Categoria</span>
        <span className="lh-author">Autor</span>
        <span className="lh-meta">Tempo · Versão</span>
        <span className="lh-prog">Progresso</span>
        <span className="lh-act"/>
      </header>
      {list.map(m => (
        <div key={m.id} className="list-row" onClick={() => onOpen(m)}>
          <div className="lr-title">
            <div className="lr-title-icon" style={{ background: `${m.category.color}1f`, color: m.category.color }}>
              <Icon name="book" size={16}/>
            </div>
            <div>
              <div className="lr-title-row">
                <strong>{m.title}</strong>
                {m.tag && <StatusBadge kind={m.tag}/>}
                {m.fav && <Icon name="bookmarkF" size={12} className="lr-fav"/>}
              </div>
              <p>{m.summary}</p>
            </div>
          </div>
          <div className="lr-cat"><CategoryTag category={m.category}/></div>
          <div className="lr-author">
            <Avatar name={m.author.name} size={22}/>
            <div>
              <strong>{m.author.name}</strong>
              <span>{m.author.role}</span>
            </div>
          </div>
          <div className="lr-meta">
            <span><Icon name="clock" size={12}/> {m.minutes} min</span>
            <span className="muted">{m.version} · {m.updated}</span>
          </div>
          <div className="lr-prog">
            {m.progress === 100
              ? <span className="badge-done"><Icon name="check" size={12} strokeWidth={2.4}/> Concluído</span>
              : m.progress > 0
                ? <div className="lr-prog-bar"><Progress value={m.progress} color={m.category.color} height={4}/><span>{m.progress}%</span></div>
                : <span className="muted">Não iniciado</span>
            }
          </div>
          <div className="lr-act">
            <button className="icon-btn icon-btn-quiet" title="Favoritar" onClick={e => e.stopPropagation()}>
              <Icon name={m.fav ? "bookmarkF" : "bookmark"} size={14}/>
            </button>
            <Button variant="ghost" size="sm" iconRight="arrow">Abrir</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Variant C: Editorial (featured + categories) ----------
function EditorialGrid({ list, featured, categories, onOpen }) {
  const byCat = categories.map(c => ({ ...c, items: list.filter(m => m.cat === c.id) })).filter(c => c.items.length);
  return (
    <div className="editorial">
      <article className="featured" onClick={() => onOpen(featured)} style={{ "--cat": featured.category.color }}>
        <div className="featured-thumb">
          <ManualThumb manual={featured} height={360} big/>
        </div>
        <div className="featured-body">
          <div className="featured-meta">
            <StatusBadge kind={featured.tag || "ATUALIZADO"}/>
            <CategoryTag category={featured.category}/>
          </div>
          <h2>{featured.title}</h2>
          <p>{featured.summary}</p>
          <div className="featured-foot">
            <div className="featured-author">
              <Avatar name={featured.author.name} size={36}/>
              <div>
                <strong>{featured.author.name}</strong>
                <span>{featured.author.role} · {featured.updated}</span>
              </div>
            </div>
            <Button variant="primary" iconRight="arrow">Ler agora</Button>
          </div>
        </div>
      </article>

      {byCat.map(c => (
        <section key={c.id} className="ed-section">
          <header className="ed-section-head">
            <h3 style={{ "--cat": c.color }}><span className="ed-dot"/>{c.label}</h3>
            <span>{c.items.length} manuais</span>
          </header>
          <div className="ed-row">
            {c.items.slice(0, 4).map(m => (
              <button key={m.id} className="ed-card" onClick={() => onOpen(m)}>
                <ManualThumb manual={m} height={84}/>
                <div className="ed-card-body">
                  <strong>{m.title}</strong>
                  <div className="ed-card-meta">
                    <span><Icon name="clock" size={11}/> {m.minutes} min</span>
                    <span>·</span>
                    <span>{m.version}</span>
                  </div>
                </div>
                {m.fav && <Icon name="bookmarkF" size={14} className="ed-card-fav"/>}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

window.Dashboard = Dashboard;
