// ======================================================================
// Portal MAIS — Aplicação principal
// ======================================================================

const { useState, useEffect } = React;

function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [route, setRoute] = useState("login");
  const [role, setRole] = useState(null); // null | "colaborador" | "administrador"
  const [openManual, setOpenManual] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Carrega a planilha ao iniciar o portal
  useEffect(() => {
    window.MAIS_LOAD_DATA()
      .then(setData)
      .catch(e => { setLoadError(e.message); console.error(e); });
  }, []);

  const handleLogin = (pwd, adminUser, adminPwd) => {
    const cfg = window.MAIS_CONFIG;
    if (adminUser != null) {
      // Modo admin
      if (adminUser === cfg.ADMIN_USUARIO && adminPwd === cfg.SENHA_ADMIN) {
        setRole("administrador");
        setRoute("dashboard");
        return { ok: true };
      }
      return { ok: false, msg: "Usuário ou senha de administrador incorretos." };
    }
    if (pwd === cfg.SENHA_COLABORADOR) {
      setRole("colaborador");
      setRoute("dashboard");
      return { ok: true };
    }
    return { ok: false, msg: "Senha incorreta. Solicite ao seu coordenador." };
  };

  const handleLogout = () => {
    setRole(null); setOpenManual(null); setRoute("login");
  };

  const isAdmin = role === "administrador";

  // ------- LOADING / ERROR STATES -------
  if (route === "login" && data == null) {
    // Login pode aparecer mesmo sem dados carregados ainda
  }

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

  if (route === "login") {
    return <LoginScreen onLogin={handleLogin}/>;
  }

  // ------- LOGGED-IN ROUTES -------
  const navigate = (id) => {
    if (id === "home" || id === "library" || id === "fav") setRoute("dashboard");
    else if (id === "admin") { if (isAdmin) setRoute("admin"); }
    else if (id === "sheet") { window.open(window.MAIS_CONFIG.SHEET_EDIT_URL, "_blank"); return; }
    setOpenManual(null);
  };

  let content = null;
  let breadcrumb = ["Início"];

  if (route === "dashboard") {
    breadcrumb = ["Início", "Biblioteca de manuais"];
    content = <Dashboard data={data}
      onOpenManual={(m) => { setOpenManual(m); setRoute("manual"); }}/>;
  } else if (route === "manual" && openManual) {
    breadcrumb = ["Biblioteca", openManual.category.label, openManual.title];
    content = <ManualView manual={openManual} onBack={() => setRoute("dashboard")}/>;
  } else if (route === "admin") {
    if (!isAdmin) { setTimeout(() => setRoute("dashboard"), 0); return null; }
    breadcrumb = ["Administrador", "Painel"];
    content = <AdminScreen
      data={{ ...data, user: { ...data.user, permission: "administrador" } }}
      onOpenManual={(m) => { setOpenManual(m); setRoute("manual"); }}/>;
  }

  const activeNav =
    route === "admin" ? "admin" :
    route === "manual" ? "library" :
    "library";

  return (
    <div className="app">
      <Sidebar active={activeNav} onNavigate={navigate} isAdmin={isAdmin}
        collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)}/>
      <div className="app-main">
        <TopBar user={data.user} breadcrumb={breadcrumb} isAdmin={isAdmin} onLogout={handleLogout}/>
        <main className="app-content">{content}</main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
