// App shell — sidebar + top bar, shared across all logged-in screens
const { useState: useStateSh } = React;

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

function TopBar({ onSearch, onLogout, user, breadcrumb, isAdmin }) {
  const [q, setQ] = useStateSh("");
  return (
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

      <div className="topbar-search">
        <Icon name="search" size={16}/>
        <input
          value={q}
          onChange={e => { setQ(e.target.value); onSearch && onSearch(e.target.value); }}
          placeholder="Buscar manual, palavra-chave…"
        />
        <kbd className="kbd">⌘K</kbd>
      </div>

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
  );
}

window.Sidebar = Sidebar;
window.TopBar = TopBar;
