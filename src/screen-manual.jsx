// Manual landing — "ante-sala" before opening the NotebookLM
const { useState: useStateM } = React;

function ManualView({ manual, onBack }) {
  const [fav, setFav] = useStateM(manual.fav);
  const [copied, setCopied] = useStateM(false);

  const openInNotebook = () => {
    if (manual.link) window.open(manual.link, "_blank", "noopener");
  };
  const copyLink = () => {
    if (manual.link) navigator.clipboard?.writeText(manual.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="manual-view">
      {/* Left — back + TOC-like info */}
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
            <li><Icon name="eye" size={14}/><div><span>Leituras</span><strong>{manual.reads.toLocaleString("pt-BR")}</strong></div></li>
            <li><Icon name="dot" size={14}/><div><span>Tempo estimado</span><strong>{manual.minutes} min</strong></div></li>
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

        {/* Primary CTA — the launchpad */}
        {manual.status === "ready" ? (
          <section className="mv-launchpad">
            <div className="mv-launchpad-body">
              <div className="mv-launchpad-icon">
                <Icon name="book" size={22}/>
              </div>
              <div>
                <strong>Manual completo no NotebookLM</strong>
                <p>Conteúdo, anexos e perguntas com IA. Abre em uma nova aba — você continua aqui pra marcar progresso e comentar.</p>
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
                <p>Nossa equipe de Operações está finalizando o conteúdo no NotebookLM. Você será avisado quando estiver disponível.</p>
              </div>
            </div>
            <div className="mv-soon-actions">
              <Button variant="ghost" icon="bell">Me avisar quando publicar</Button>
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
            <p>Os manuais oficiais MAIS vivem no NotebookLM (Google) — lá você lê o conteúdo completo, navega por seções, faz buscas e tira dúvidas com IA. Este portal é o ponto único de acesso, mantém sua progressão e centraliza comentários da equipe.</p>
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
            <>
              <button className="mv-action" onClick={copyLink}>
                <Icon name={copied ? "check" : "share"} size={16}/>
                <span>{copied ? "Link copiado" : "Copiar link"}</span>
              </button>
              <button className="mv-action" onClick={openInNotebook}>
                <Icon name="download" size={16}/><span>Abrir como PDF</span>
              </button>
              <button className="mv-action"><Icon name="print" size={16}/><span>Imprimir</span></button>
            </>
          )}
        </div>

        <div className="mv-suggest">
          <strong>Achou algo pra melhorar?</strong>
          <p>Os manuais são mantidos pela equipe de Operações. Sua sugestão chega direto pra quem cuida deste material.</p>
          <Button variant="primary" size="sm" icon="msg" full>Sugerir melhoria</Button>
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
