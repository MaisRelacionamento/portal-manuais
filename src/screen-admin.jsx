// Admin — manage manuals via Google Sheet, show health stats
const { useState: useStateA, useMemo: useMemoA, useEffect: useEffectA } = React;

function AdminScreen({ data, onOpenManual }) {
  const [tab, setTab] = useStateA("manuais");
  const [search, setSearch] = useStateA("");
  const [feedbacks, setFeedbacks] = useStateA([]);

  // Carrega feedbacks do localStorage ao abrir o painel
  useEffectA(() => {
    if (tab === "feedback") {
      setFeedbacks(window.MAIS_LER_FEEDBACKS ? window.MAIS_LER_FEEDBACKS() : []);
    }
  }, [tab]);

  const list = useMemoA(() => {
    let r = [...data.manuals];
    if (search) r = r.filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.author && m.author.name.toLowerCase().includes(search.toLowerCase())));
    return r;
  }, [data, search]);

  const SHEET_URL = window.MAIS_CONFIG?.SHEET_EDIT_URL || "";

  const marcarResolvido = (idx) => {
    const lista = window.MAIS_LER_FEEDBACKS();
    lista.splice(idx, 1);
    try { localStorage.setItem("mais_feedback_v1", JSON.stringify(lista)); } catch {}
    setFeedbacks([...lista]);
  };

  function tempoRelativo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 2) return "agora mesmo";
    if (min < 60) return `há ${min} minutos`;
    const h = Math.floor(min / 60);
    if (h < 24) return `há ${h} hora${h > 1 ? "s" : ""}`;
    return `há ${Math.floor(h / 24)} dia${Math.floor(h/24) > 1 ? "s" : ""}`;
  }

  return (
    <div className="admin">
      <header className="admin-head">
        <div>
          <span className="eyebrow">GESTÃO · {data.user.permission.toUpperCase()}</span>
          <h1>Gerenciar manuais</h1>
          <p>Os manuais MAIS são cadastrados em uma <strong>planilha Google</strong> e publicados automaticamente no portal.</p>
        </div>
        <div className="admin-head-actions">
          <Button variant="primary" icon="plus" iconRight="arrow" onClick={() => window.open(SHEET_URL, "_blank")}>
            Abrir planilha
          </Button>
        </div>
      </header>

      <section className="admin-stats">
        <div className="astat">
          <span className="astat-label">Publicados</span>
          <strong>{data.stats.totalManuals}</strong>
          <span className="astat-delta astat-up">+ {data.stats.publishedThisMonth} este mês</span>
        </div>
        <div className="astat">
          <span className="astat-label">Em produção</span>
          <strong>{data.stats.soonManuals}</strong>
          <span className="astat-delta">marcados como "soon" na planilha</span>
        </div>
        <div className="astat">
          <span className="astat-label">Categorias ativas</span>
          <strong>{data.stats.activeCategories}</strong>
          <span className="astat-delta">Operação · Financeiro · Atendimento · Sistemas</span>
        </div>
        <div className="astat">
          <span className="astat-label">Última atualização</span>
          <strong className="astat-sm">{data.stats.lastUpdate}</strong>
          <span className="astat-delta astat-up">sincroniza a cada 5 min</span>
        </div>
      </section>

      <nav className="admin-tabs">
        <button className={tab === "manuais"  ? "is-active" : ""} onClick={() => setTab("manuais")}>
          Manuais no portal <span>{data.manuals.length}</span>
        </button>
        <button className={tab === "fluxo"    ? "is-active" : ""} onClick={() => setTab("fluxo")}>
          Como adicionar manual
        </button>
        <button className={tab === "feedback" ? "is-active" : ""} onClick={() => setTab("feedback")}>
          Sugestões da equipe
          {feedbacks.length > 0 && <span>{feedbacks.length}</span>}
        </button>

      </nav>

      {tab === "manuais" && (
        <section className="admin-table">
          <header className="admin-table-head">
            <div className="search search-sm">
              <Icon name="search" size={14}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título ou autor…"/>
            </div>
            <div className="admin-bulk">
              <Button variant="primary" size="sm" icon="plus" onClick={() => window.open(SHEET_URL, "_blank")}>Novo manual</Button>
            </div>
          </header>

          <table className="atable">
            <thead>
              <tr>
                <th></th>
                <th>Título</th>
                <th>Categoria</th>
                <th>Autor</th>
                <th>Atualizado</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(m => (
                <tr key={m.id}>
                  <td className="atable-emoji"><span>{m.icon}</span></td>
                  <td>
                    <div className="atable-title">
                      <div>
                        <strong>{m.title}</strong>
                        <span>{m.summary?.slice(0, 60)}{m.summary && m.summary.length > 60 ? "…" : ""}</span>
                      </div>
                    </div>
                  </td>
                  <td><CategoryTag category={m.category}/></td>
                  <td>{m.author ? m.author.name : <span className="muted">—</span>}</td>
                  <td>{m.updated || <span className="muted">—</span>}</td>
                  <td>
                    {m.status === "soon"
                      ? <span className="badge-soon">Em breve</span>
                      : m.tag
                        ? <StatusBadge kind={m.tag}/>
                        : <span className="badge-ok"><span className="ok-dot"/>Publicado</span>}
                  </td>
                  <td className="atable-act">
                    {m.status === "ready" && (
                      <button className="icon-btn icon-btn-quiet" title="Ver" onClick={() => onOpenManual(m)}><Icon name="eye" size={14}/></button>
                    )}
                    <button className="icon-btn icon-btn-quiet" title="Editar na planilha" onClick={() => window.open(SHEET_URL, "_blank")}><Icon name="edit" size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "fluxo" && <SheetFlow sheetUrl={SHEET_URL}/>}

      {tab === "feedback" && (
        <section className="admin-feedback">
          <p className="admin-empty-note">
            Sugestões enviadas anonimamente pela equipe ao acessar os manuais.
            Marque como resolvida quando incorporar a mudança no NotebookLM.
          </p>
          {feedbacks.length === 0 ? (
            <div className="empty" style={{padding:"40px 0"}}>
              <Icon name="msg" size={28}/>
              <h4>Nenhuma sugestão ainda</h4>
              <p>Quando a equipe enviar sugestões nos manuais, elas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="feedback-list">
              {feedbacks.map((f, i) => (
                <div key={i} className="feedback-row">
                  <div className="feedback-anon-icon">
                    <Icon name="user" size={16}/>
                  </div>
                  <div className="feedback-body">
                    <strong>Sugestão anônima</strong>
                    <p>{f.text}</p>
                    <span>em <strong>{f.manual}</strong> · {tempoRelativo(f.at)}</span>
                  </div>
                  <div className="feedback-act">
                    <Button variant="ghost" size="sm" icon="check" onClick={() => marcarResolvido(i)}>
                      Marcar resolvido
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}


    </div>
  );
}

function SheetFlow({ sheetUrl }) {
  const cols = [
    { name: "titulo",        req: true,  desc: "Nome curto do manual.", ex: "CTM" },
    { name: "link",          req: true,  desc: "URL do notebook no NotebookLM.", ex: "https://notebooklm.google.com/..." },
    { name: "status",        req: true,  desc: "ready (publicado) ou soon (em produção).", ex: "ready" },
    { name: "icon",          req: true,  desc: "Emoji que aparece como ícone do manual.", ex: "📋" },
    { name: "categoria",     req: false, desc: "Organiza por área: Operação, Financeiro, Atendimento, Sistemas.", ex: "Operação" },
    { name: "descricao",     req: false, desc: "Resumo curto que aparece no card.", ex: "Procedimento de Controle..." },
    { name: "autor",         req: false, desc: "Nome de quem mantém o manual.", ex: "Patrícia Lemos" },
    { name: "atualizado_em", req: false, desc: "Data da última revisão.", ex: "12 mai 2026" },
    { name: "novo",          req: false, desc: "TRUE para marcar com a tag NOVO.", ex: "TRUE" },
    { name: "minutos",       req: false, desc: "Tempo estimado de leitura.", ex: "12" },
    { name: "pdf1_nome",     req: false, desc: "Nome do 1º PDF relacionado.", ex: "Formulário CTM" },
    { name: "pdf1_link",     req: false, desc: "Link do 1º PDF (Google Drive, etc).", ex: "https://drive.google.com/..." },
    { name: "pdf2_nome",     req: false, desc: "Nome do 2º PDF relacionado.", ex: "Checklist operacional" },
    { name: "pdf2_link",     req: false, desc: "Link do 2º PDF.", ex: "https://drive.google.com/..." },
    { name: "pdf3_nome",     req: false, desc: "Nome do 3º PDF relacionado.", ex: "Template de e-mail" },
    { name: "pdf3_link",     req: false, desc: "Link do 3º PDF.", ex: "https://drive.google.com/..." },
  ];
  const steps = [
    { n: 1, title: "Abra a planilha", desc: "É a fonte oficial. Apenas pessoas com permissão de edição podem adicionar manuais." },
    { n: 2, title: "Adicione uma nova linha", desc: "Preencha as colunas obrigatórias (titulo · link · status · icon) e as opcionais." },
    { n: 3, title: "PDFs relacionados (opcional)", desc: "Preencha pdf1_nome + pdf1_link para adicionar botões de download no manual. Suporta até 3 PDFs." },
    { n: 4, title: "Salve a planilha", desc: "O portal lê a planilha a cada 5 minutos e publica o novo manual automaticamente." },
  ];

  return (
    <div className="flow">
      <div className="flow-intro">
        <h2>Como funciona</h2>
        <p>A biblioteca é montada lendo uma planilha Google publicada como CSV. Adicionar um manual é preencher uma linha; o portal sincroniza sozinho.</p>
      </div>
      <ol className="flow-steps">
        {steps.map(s => (
          <li key={s.n}>
            <span className="flow-step-num">{s.n}</span>
            <div><strong>{s.title}</strong><p>{s.desc}</p></div>
          </li>
        ))}
      </ol>
      <div className="flow-sheet-card">
        <div className="flow-sheet-card-body">
          <Icon name="folder" size={20}/>
          <div>
            <strong>Planilha oficial · Manuais Portal</strong>
            <span>Sincroniza a cada 5 minutos</span>
          </div>
        </div>
        <Button variant="primary" iconRight="arrow" onClick={() => window.open(sheetUrl, "_blank")}>Abrir planilha</Button>
      </div>
      <div className="flow-cols">
        <header>
          <h3>Colunas da planilha</h3>
          <p>Quatro são <strong>obrigatórias</strong>. As outras enriquecem o card e habilitam recursos.</p>
        </header>
        <div className="flow-table">
          <div className="flow-table-head"><span>Coluna</span><span>Descrição</span><span>Exemplo</span></div>
          {cols.map(c => (
            <div key={c.name} className="flow-table-row">
              <div className="flow-col-name">
                <span className="mono">{c.name}</span>
                {c.req && <span className="flow-req">obrigatório</span>}
              </div>
              <div className="flow-col-desc">{c.desc}</div>
              <div className="flow-col-ex"><code>{c.ex}</code></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flow-tip">
        <Icon name="sparkle" size={18}/>
        <div>
          <strong>Dica MAIS</strong>
          <p>Coloque <code>TRUE</code> na coluna <code>novo</code> para destacar um manual recém-publicado com o selo NOVO em laranja.</p>
        </div>
      </div>
    </div>
  );
}

window.AdminScreen = AdminScreen;
