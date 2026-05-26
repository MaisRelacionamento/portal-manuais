// ======================================================================
// Portal MAIS — Aplicação principal
// ======================================================================

const { useState, useEffect } = React;

function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  // Sessão persistida — não pede senha ao dar F5
  const [route, setRoute] = useState(() => {
    try { return localStorage.getItem("mais_session_route") || "login"; } catch { return "login"; }
  });
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem("mais_session_role") || null; } catch { return null; }
  });
  const [openManual, setOpenManual] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mais_favs") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    window.MAIS_LOAD_DATA()
      .then(setData)
      .catch(e => { setLoadError(e.message); console.error(e); });
  }, []);

  const toggleFav = (id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem("mais_favs", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleLogin = (pwd, adminUser, adminPwd) => {
    const cfg = window.MAIS_CONFIG;
    if (adminUser != null) {
      if (adminUser === cfg.ADMIN_USUARIO && adminPwd === cfg.SENHA_ADMIN) {
        setRole("administrador"); setRoute("dashboard");
        try { localStorage.setItem("mais_session_role","administrador"); localStorage.setItem("mais_session_route","dashboard"); } catch {}
        return { ok: true };
      }
      return { ok: false, msg: "Usuário ou senha de administrador incorretos." };
    }
    if (pwd === cfg.SENHA_COLABORADOR) {
      setRole("colaborador"); setRoute("dashboard");
      try { localStorage.setItem("mais_session_role","colaborador"); localStorage.setItem("mais_session_route","dashboard"); } catch {}
      return { ok: true };
    }
    return { ok: false, msg: "Senha incorreta. Solicite ao seu coordenador." };
  };

  const handleLogout = () => {
    setRole(null); setOpenManual(null); setRoute("login");
    try { localStorage.removeItem("mais_session_role"); localStorage.removeItem("mais_session_route"); } catch {}
  };
  const isAdmin = role === "administrador";

  if (route !== "login" && data == null) {
    return (
      <div className="bootstrap-screen">
        <div className="bootstrap-spinner"/>
        <strong>Carregando manuais…</strong>
        <span>Buscando a última versão da planilha</span>
        {loadError && <p className="bootstrap-error">Erro: {loadError}</p>}
      </div>
    );
  }

  if (route === "login") return <LoginScreen onLogin={handleLogin}/>;

  // Injeta favs nos manuais
  const dataWithFavs = data ? {
    ...data,
    manuals: data.manuals.map(m => ({ ...m, fav: favs.includes(m.id) }))
  } : data;

  const navigate = (id) => {
    if (id === "library") { setRoute("dashboard"); setOpenManual(null); return; }
    if (id === "fav")     { setRoute("favs");      setOpenManual(null); return; }
    if (id === "admin")   { if (isAdmin) { setRoute("admin"); setOpenManual(null); } return; }
    if (id === "sheet")   { window.open(window.MAIS_CONFIG.SHEET_EDIT_URL, "_blank"); return; }
  };

  const openManualFn = (m) => { setOpenManual(m); setRoute("manual"); };

  let content = null;
  let breadcrumb = ["Início"];

  if (route === "dashboard") {
    breadcrumb = ["Biblioteca de manuais"];
    content = <Dashboard data={dataWithFavs} onOpenManual={openManualFn} onToggleFav={toggleFav}/>;
  } else if (route === "favs") {
    breadcrumb = ["Favoritos"];
    const favData = { ...dataWithFavs, manuals: dataWithFavs.manuals.filter(m => m.fav) };
    content = <Dashboard data={favData} onOpenManual={openManualFn} onToggleFav={toggleFav} emptyMsg="Você ainda não favoritou nenhum manual." />;
  } else if (route === "manual" && openManual) {
    const fresh = dataWithFavs.manuals.find(m => m.id === openManual.id) || openManual;
    breadcrumb = [fresh.category.label, fresh.title];
    content = <ManualView manual={fresh} onBack={() => setRoute("dashboard")} onToggleFav={toggleFav} isAdmin={isAdmin}/>;
  } else if (route === "admin") {
    if (!isAdmin) { setTimeout(() => setRoute("dashboard"), 0); return null; }
    breadcrumb = ["Painel"];
    content = <AdminScreen
      data={{ ...dataWithFavs, user: { ...dataWithFavs.user, permission: "administrador" } }}
      onOpenManual={openManualFn}/>;
  }

  const activeNav =
    route === "admin"   ? "admin"   :
    route === "favs"    ? "fav"     :
    "library";

  return (
    <div className="app">
      <Sidebar active={activeNav} onNavigate={navigate} isAdmin={isAdmin}
        collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)}/>
      <div className="app-main">
        <TopBar
          user={dataWithFavs?.user}
          breadcrumb={breadcrumb}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          manuals={dataWithFavs?.manuals || []}
          onOpenManual={openManualFn}
        />
        <main className="app-content">{content}</main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
