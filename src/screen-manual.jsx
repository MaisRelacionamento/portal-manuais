// Manual landing — "ante-sala" before opening the NotebookLM
const { useState: useStateM } = React;

// Storage helpers para feedback anônimo (localStorage)
const FEEDBACK_KEY = "mais_feedback_v1";
function lerFeedbacks() {
  try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]"); } catch { return []; }
}
function salvarFeedback(fb) {
  try {
    const lista = lerFeedbacks();
    lista.unshift(fb);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(lista.slice(0, 200)));
  } catch {}
}
window.MAIS_LER_FEEDBACKS = lerFeedbacks;

function ManualView({ manual, onBack }) {
  const [fav, setFav] = useStateM(manual.fav);
  const [copied, setCopied] = useStateM(false);
  const [fbText, setFbText] = useStateM("");
  const [fbSent, setFbSent] = useStateM(false);

  const openInNotebook = () => {
    if (manual.link) window.open(manual.link, "_blank", "noopener");
  };
  const copyLink = () => {
    if (manual.link) navigator.clipboard?.writeText(manual.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const enviarFeedback = () => {
    const txt = fbText.trim();
    if (!txt) return;
    salvarFeedback({
      manual: manual.title,
      manualId: manual.id,
      text: txt,
      at: new Date().toISOString(),
      atLabel: "agora mesmo",
    });
    setFbText("");
    setFbSent(true);
    setTimeout(() => setFbSent(false), 3000);
  };

  // PDFs relacionados — colunas pdf1_nome/pdf1_link ... pdf3_nome/pdf3_link na planilha
  const pdfs = [];
  for (let i = 1; i <= 3; i++) {
    if (manual[`pdf${i}_link`] && manual[`pdf${i}_nome`]) {
      pdfs.push({ nome: manual[`pdf${i}_nome`], link: manual[`pdf${i}_link`] });
    }
  }

  return (
    <div className="manual-view">
      {/* Left — back + info */}
      <aside className="mv-toc">
        <button className="mv-back" onClick={onBack}>
          <Icon name="arrowL" size={14}/> Voltar à biblioteca
        </button>

        <div className="mv-toc-card">
          <span className="mv-toc-eyebrow">SOBRE O MANUAL</span>
          <ul className="mv-info">
            <li><Icon name="folder" size={14}/><div><span>Categoria</span><strong>{manual.category.label}</strong></div></li>
            {manual.author && <li><Icon name="user" size={14}/><div><span>Autor</span><strong>{manual.author.name}</strong></div></li>}
            {manual.updated && <li><Icon name="clock" size={14}/><div><span>Atualizado em</span><strong>{manual.updated}</strong></div></li>}
          </ul>
        </div>

        <div className="mv-toc-tip">
          <Icon name="sparkle" size={14}/>
          <div>
            <strong>Dica</strong>
            <span>O conteúdo completo abre no NotebookLM. Login com seu e-mail corporativo Google.</span>
          </div>
        </div>
      </aside>

      {/* Center content */}
      <article className="mv-main">
        <header className="mv-head" style={{ "--cat": manual.category.color }}>
          <div className="mv-head-emoji" style={{ background: `linear-gradient(135deg, ${manual.category.color}22, ${manual.category.color}08)` }}>
            <span>{manual.icon}</span>
          </div>
          <div className="mv-head-body">
            <div className="mv-head-meta">
              <CategoryTag category={manual.category}/>
              {manual.tag && <StatusBadge kind={manual.tag}/>}
              {manual.status === "soon" && <span className="status-badge status-soon">EM BREVE</span>}
            </div>
            <h1>{manual.title}</h1>
            <p className="mv-head-summary">{manual.summary}</p>
          </div>
        </header>

        {/* Primary CTA */}
        {manual.status === "ready" ? (
          <section className="mv-launchpad">
            <div className="mv-launchpad-body">
              <div className="mv-launchpad-icon">
                <Icon name="book" size={22}/>
              </div>
              <div>
                <strong>Manual completo no NotebookLM</strong>
                <p>Conteúdo, anexos e perguntas com IA. Abre em uma nova aba.</p>
              </div>
            </div>
            <div className="mv-launchpad-actions">
              <Button variant="ghost" icon={copied ? "check" : "share"} onClick={copyLink}>
                {copied ? "Link copiado" : "Copiar link"}
              </Button>
              <Button variant="primary" iconRight="arrow" onClick={openInNotebook}>
                Abrir manual
              </Button>
            </div>
          </section>
        ) : (
          <section className="mv-soon">
            <div className="mv-soon-head">
              <Icon name="clock" size={22}/>
              <div>
                <strong>Este manual está em produção</strong>
                <p>Nossa equipe de Operações está finalizando o conteúdo no NotebookLM.</p>
              </div>
            </div>
          </section>
        )}

        {/* PDFs relacionados */}
        {pdfs.length > 0 && (
          <section className="mv-section mv-pdfs">
            <h2>Documentos relacionados</h2>
            <div className="mv-pdf-list">
              {pdfs.map((p, i) => (
                <a key={i} href={p.link} target="_blank" rel="noopener" className="mv-pdf-btn">
                  <Icon name="download" size={15}/>
                  <span>{p.nome}</span>
                  <Icon name="arrow" size={13}/>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* What's inside */}
        <section className="mv-section">
          <h2>O que você vai encontrar</h2>
          <p>{manual.summary} Este manual é mantido pela equipe de Operações e atualizado conforme mudanças no processo.</p>
          <ul className="mv-checklist">
            <li><span className="mv-check"><Icon name="check" size={12} strokeWidth={2.4}/></span>Roteiro completo passo a passo, com critérios de aceite</li>
            <li><span className="mv-check"><Icon name="check" size={12} strokeWidth={2.4}/></span>Quando escalar para coordenação e por qual canal</li>
            <li><span className="mv-check"><Icon name="check" size={12} strokeWidth={2.4}/></span>Exceções comuns e como tratá-las no sistema</li>
            <li><span className="mv-check"><Icon name="check" size={12} strokeWidth={2.4}/></span>Modelos de mensagem, prints e exemplos reais</li>
            <li><span className="mv-check"><Icon name="check" size={12} strokeWidth={2.4}/></span>Pergunte ao NotebookLM com IA sobre qualquer dúvida do conteúdo</li>
          </ul>
        </section>

        <div className="mv-callout">
          <Icon name="flag" size={16}/>
          <div>
            <strong>Como funciona</strong>
            <p>Os manuais oficiais MAIS vivem no NotebookLM — lá você lê o conteúdo completo, navega por seções e tira dúvidas com IA. Este portal é o ponto único de acesso e centraliza sugestões da equipe.</p>
          </div>
        </div>
      </article>

      {/* Right rail */}
      <aside className="mv-rail">
        <div className="mv-actions">
          <button className={`mv-action${fav ? " is-active" : ""}`} onClick={() => setFav(f => !f)}>
            <Icon name={fav ? "bookmarkF" : "bookmark"} size={16}/>
            <span>{fav ? "Salvo nos favoritos" : "Salvar nos favoritos"}</span>
          </button>
          {manual.status === "ready" && (
            <button className="mv-action" onClick={copyLink}>
              <Icon name={copied ? "check" : "share"} size={16}/>
              <span>{copied ? "Link copiado" : "Copiar link"}</span>
            </button>
          )}
        </div>

        {/* Sugestão anônima */}
        <div className="mv-suggest">
          <strong>Achou algo pra melhorar?</strong>
          <p>Sua sugestão vai direto para o painel de administração — sem identificação.</p>
          {fbSent ? (
            <div className="mv-fb-sent">
              <Icon name="check" size={14} strokeWidth={2.4}/>
              <span>Sugestão enviada!</span>
            </div>
          ) : (
            <>
              <textarea
                className="mv-fb-input"
                placeholder="Descreva o que pode melhorar…"
                value={fbText}
                onChange={e => setFbText(e.target.value)}
                rows={3}
              />
              <Button variant="primary" size="sm" icon="msg" full onClick={enviarFeedback}
                disabled={!fbText.trim()}>
                Enviar sugestão
              </Button>
            </>
          )}
        </div>

        <div className="mv-related">
          <strong>Relacionados</strong>
          <a href="#"><span className="mr-dot" style={{ background: "#F88B27" }}/>CTM — Controle de Transações</a>
          <a href="#"><span className="mr-dot" style={{ background: "#16A34A" }}/>Termo de Quitação</a>
          <a href="#"><span className="mr-dot" style={{ background: "#7C3AED" }}/>Middle Integração</a>
        </div>
      </aside>
    </div>
  );
}

window.ManualView = ManualView;
