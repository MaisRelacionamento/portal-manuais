// Admin — manage manuals via Google Sheet, show health stats
const { useState: useStateA, useMemo: useMemoA } = React;

function AdminScreen({ data, onOpenManual }) {
  const [tab, setTab] = useStateA("manuais");
  const [search, setSearch] = useStateA("");

  const list = useMemoA(() => {
    let r = [...data.manuals];
    if (search) r = r.filter(m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.author && m.author.name.toLowerCase().includes(search.toLowerCase())));
    return r;
  }, [data, search]);

  const SHEET_URL = window.MAIS_CONFIG?.SHEET_EDIT_URL || "https://docs.google.com/spreadsheets/d/1.../edit";

  return (
    <div className="admin">
      <header className="admin-head">
        <div>
          <span className="eyebrow">GESTÃO · {data.user.permission.toUpperCase()}</span>
          <h1>Gerenciar manuais</h1>
          <p>Os manuais MAIS são cadastrados em uma <strong>planilha Google</strong> e publicados automaticamente no portal. Sem mexer em código.</p>
        </div>
        <div className="admin-head-actions">
          <Button variant="ghost" icon="download">Exportar relatório</Button>
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
          <span className="astat-delta">marcados como “soon” na planilha</span>
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
        <button className={tab === "manuais" ? "is-active" : ""} onClick={() => setTab("manuais")}>Manuais no portal <span>{data.manuals.length}</span></button>
        <button className={tab === "fluxo" ? "is-active" : ""} onClick={() => setTab("fluxo")}>Como adicionar manual</button>
        <button className={tab === "feedback" ? "is-active" : ""} onClick={() => setTab("feedback")}>Feedback dos times <span>7</span></button>
        <button className={tab === "auditoria" ? "is-active" : ""} onClick={() => setTab("auditoria")}>Auditoria</button>
      </nav>

      {tab === "manuais" && (
        <section className="admin-table">
          <header className="admin-table-head">
            <div className="search search-sm">
              <Icon name="search" size={14}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título ou autor…"/>
            </div>
            <div className="admin-bulk">
              <Button variant="ghost" size="sm" icon="filter">Filtros</Button>
              <Button variant="ghost" size="sm" icon="sort">Ordenar</Button>
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
                <th>Leituras</th>
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
                  <td className="atable-num">{m.status === "ready" ? m.reads.toLocaleString("pt-BR") : "—"}</td>
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
          <p className="admin-empty-note">Reúne sugestões, dúvidas e correções enviadas pelos leitores. Marque como tratada quando incorporar ao NotebookLM.</p>
          <div className="feedback-list">
            {[
              { manual: "Procedimento Comunicação", user: "Camila Soares", text: "Faltou citar o template para envio em final de semana.", at: "há 3 horas" },
              { manual: "CTM", user: "Henrique Lopes", text: "A seção 4.2 ficou ambígua sobre o prazo de tabulação.", at: "ontem" },
              { manual: "Middle Integração", user: "Beatriz Almeida", text: "Acrescentar exemplo do payload de retorno na falha 503.", at: "ontem" },
            ].map((f, i) => (
              <div key={i} className="feedback-row">
                <Avatar name={f.user} size={32}/>
                <div className="feedback-body">
                  <strong>{f.user}</strong>
                  <p>{f.text}</p>
                  <span>em <a href="#">{f.manual}</a> · {f.at}</span>
                </div>
                <div className="feedback-act">
                  <Button variant="ghost" size="sm">Abrir no NotebookLM</Button>
                  <Button variant="ghost" size="sm" icon="check">Marcar resolvido</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "auditoria" && (
        <section className="admin-audit">
          <div className="audit-row"><span className="audit-time">14:22</span><strong>Patrícia Lemos</strong> publicou <a href="#">CTM</a> via planilha</div>
          <div className="audit-row"><span className="audit-time">11:08</span><strong>Rafael Tinoco</strong> atualizou link de <a href="#">Emissão Boleto Exchange</a></div>
          <div className="audit-row"><span className="audit-time">09:45</span><strong>Diego Aragão</strong> alterou status de <a href="#">D2B</a> para <em>ready</em></div>
          <div className="audit-row"><span className="audit-time">ontem</span><strong>Marina Vidal</strong> adicionou <a href="#">Middle Integração</a> à planilha</div>
          <div className="audit-row"><span className="audit-time">ontem</span><strong>Carolina Bressan</strong> revisou descrição de <a href="#">Procedimento Comunicação</a></div>
        </section>
      )}
    </div>
  );
}

// ---------- "Como adicionar manual" — visual guide of the sheet workflow ----------
function SheetFlow({ sheetUrl }) {
  const cols = [
    { name: "titulo",        req: true,  desc: "Nome curto do manual, exatamente como aparecerá no card.", ex: "CTM" },
    { name: "link",          req: true,  desc: "URL do notebook no NotebookLM. Deixe em branco se ainda não foi criado.", ex: "https://notebooklm.google.com/..." },
    { name: "status",        req: true,  desc: "ready (publicado) ou soon (em produção).", ex: "ready" },
    { name: "icon",          req: true,  desc: "Emoji que aparece como ícone do manual.", ex: "📋" },
    { name: "categoria",     req: false, desc: "Organiza por área. Pode ser: Operação, Financeiro, Atendimento, Sistemas.", ex: "Operação" },
    { name: "descricao",     req: false, desc: "Resumo curto que aparece no card e na tela do manual.", ex: "Procedimento de Controle de Transações..." },
    { name: "autor",         req: false, desc: "Nome de quem mantém o manual.", ex: "Patrícia Lemos" },
    { name: "atualizado_em", req: false, desc: "Data da última revisão, formato livre.", ex: "12 mai 2026" },
    { name: "novo",          req: false, desc: "TRUE para marcar com a tag NOVO no card por 30 dias.", ex: "TRUE" },
    { name: "minutos",       req: false, desc: "Tempo estimado de leitura (número inteiro).", ex: "12" },
  ];
  const steps = [
    { n: 1, title: "Abra a planilha", desc: "É a fonte oficial. Apenas pessoas com permissão de edição podem adicionar manuais." },
    { n: 2, title: "Adicione uma nova linha", desc: "Preencha as colunas obrigatórias (titulo · link · status · icon) e as opcionais que quiser." },
    { n: 3, title: "Salve a planilha", desc: "O portal lê a planilha a cada 5 minutos e publica o novo manual automaticamente. Não é necessário commit no GitHub." },
    { n: 4, title: "Pronto", desc: "O manual aparece no portal com o ícone, descrição e link configurados." },
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
            <div>
              <strong>{s.title}</strong>
              <p>{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flow-sheet-card">
        <div className="flow-sheet-card-body">
          <Icon name="folder" size={20}/>
          <div>
            <strong>Planilha oficial · Manuais Portal</strong>
            <span>Última sincronização há 4 minutos · 10 linhas</span>
          </div>
        </div>
        <Button variant="primary" iconRight="arrow" onClick={() => window.open(sheetUrl, "_blank")}>Abrir planilha</Button>
      </div>

      <div className="flow-cols">
        <header>
          <h3>Colunas da planilha</h3>
          <p>Quatro são <strong>obrigatórias</strong>. As outras enriquecem o card e habilitam filtros — recomendamos preencher.</p>
        </header>
        <div className="flow-table">
          <div className="flow-table-head">
            <span>Coluna</span><span>Descrição</span><span>Exemplo</span>
          </div>
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
          <p>Quer destacar um manual recém-publicado? Coloque <code>TRUE</code> na coluna <code>novo</code> — o card ganha automaticamente o selo NOVO em laranja.</p>
        </div>
      </div>
    </div>
  );
}

window.AdminScreen = AdminScreen;
