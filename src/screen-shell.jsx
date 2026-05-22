// App shell — sidebar + top bar
const { useState: useStateSh, useEffect: useEffectSh } = React;

function Sidebar({ active, onNavigate, collapsed, onToggleCollapse, isAdmin }) {
  const items = [
    { id: "home",    icon: "home",    label: "Início" },
    { id: "library", icon: "book",    label: "Biblioteca" },
    { id: "fav",     icon: "bookmark",label: "Favoritos" },
  ];
  const admin = [
    { id: "admin",   icon: "settings",label: "Painel administrador" },
    { id: "sheet",   icon: "folder",  label: "Abrir planilha" },
  ];
  return (
    <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
      <div className="sidebar-brand">
        <MaisMark size={28}/>
        {!collapsed && <span className="sidebar-brand-name">MAIS<em>Rotinas</em></span>}
      </div>

      <nav className="sidebar-nav">
        {items.map(i => (
          <button key={i.id}
            className={`sidebar-item${active === i.id ? " is-active" : ""}`}
            onClick={() => onNavigate(i.id)}>
            <Icon name={i.icon} size={18}/>
            {!collapsed && <span>{i.label}</span>}
          </button>
        ))}
        {isAdmin && !collapsed && <div className="sidebar-section">ADMINISTRADOR</div>}
        {isAdmin && admin.map(i => (
          <button key={i.id}
            className={`sidebar-item${active === i.id ? " is-active" : ""}`}
            onClick={() => onNavigate(i.id)}>
            <Icon name={i.icon} size={18}/>
            {!collapsed && <span>{i.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        {!collapsed && (
          <div className="sidebar-tip">
            <div className="sidebar-tip-icon"><Icon name="sparkle" size={14}/></div>
            <div>
              <strong>{isAdmin ? "Adicionar manual" : "Sugerir manual"}</strong>
              <span>{isAdmin ? "Edite a planilha pra publicar" : "Algo faltando? Avise a equipe."}</span>
            </div>
          </div>
        )}
        <button className="sidebar-collapse" onClick={onToggleCollapse}>
          <Icon name={collapsed ? "arrow" : "arrowL"} size={14}/>
        </button>
      </div>
    </aside>
  );
}

// Modal de busca rápida (⌘K / Ctrl+K)
function SearchModal({ manuals, onOpen, onClose }) {
  const [q, setQ] = useStateSh("");
  const [cursor, setCursor] = useStateSh(0);
  const inputRef = React.useRef(null);

  const results = q.trim().length > 0
    ? manuals.filter(m =>
        m.title.toLowerCase().includes(q.toLowerCase()) ||
        (m.summary || "").toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : [];

  // Reset cursor when results change
  useEffectSh(() => { setCursor(0); }, [results.length]);

  useEffectSh(() => {
    const handler = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor(c => Math.min(c + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor(c => Math.max(c - 1, 0));
      }
      if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        onOpen(results[cursor]);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [results, cursor]);

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-input">
          <Icon name="search" size={18}/>
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar manual, palavra-chave…"
          />
          <button className="search-modal-esc" onClick={onClose}>ESC</button>
        </div>
        {results.length > 0 && (
          <ul className="search-modal-results">
            {results.map((m, i) => (
              <li key={m.id} className={i === cursor ? "is-active" : ""}>
                <button
                  onClick={() => { onOpen(m); onClose(); }}
                  onMouseEnter={() => setCursor(i)}
                >
                  <span className="smr-icon">{m.icon}</span>
                  <div>
                    <strong>{m.title}</strong>
                    <span>{m.category.label}{m.summary ? ` · ${m.summary.slice(0,60)}…` : ""}</span>
                  </div>
                  <Icon name="arrow" size={14}/>
                </button>
              </li>
            ))}
          </ul>
        )}
        {q.trim().length > 0 && results.length === 0 && (
          <div className="search-modal-empty">Nenhum resultado para "<strong>{q}</strong>"</div>
        )}
        <div className="search-modal-hint">
          <span><kbd>↑↓</kbd> navegar</span>
          <span><kbd>Enter</kbd> abrir</span>
          <span><kbd>Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}

function TopBar({ onLogout, user, breadcrumb, isAdmin, manuals, onOpenManual }) {
  const [modalOpen, setModalOpen] = useStateSh(false);

  useEffectSh(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setModalOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          {breadcrumb && (
            <div className="breadcrumb">
              {breadcrumb.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Icon name="chevron" size={12}/>}
                  <span className={i === breadcrumb.length - 1 ? "is-current" : ""}>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <button className="topbar-search" onClick={() => setModalOpen(true)}>
          <Icon name="search" size={16}/>
          <span className="topbar-search-placeholder">Buscar manual, palavra-chave…</span>
          <kbd className="kbd">⌘K</kbd>
        </button>

        <div className="topbar-right">
          <div className={`topbar-session${isAdmin ? " is-admin" : ""}`}>
            <span className="topbar-session-dot"/>
            <div>
              <strong>{isAdmin ? "Modo administrador" : "Operação MAIS"}</strong>
              <span>{isAdmin ? "Acesso completo · edição habilitada" : "Acesso compartilhado da equipe"}</span>
            </div>
          </div>
          <button className="icon-btn icon-btn-quiet" onClick={onLogout} title="Sair"><Icon name="logout" size={16}/></button>
        </div>
      </header>

      {modalOpen && (
        <SearchModal
          manuals={manuals || []}
          onOpen={onOpenManual}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

window.Sidebar = Sidebar;
window.TopBar = TopBar;
