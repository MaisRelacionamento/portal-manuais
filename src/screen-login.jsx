// Login — single shared password for the team + separate admin gate
const { useState: useStateL } = React;

function LoginScreen({ onLogin }) {
  const [pwd, setPwd] = useStateL("");
  const [showPwd, setShowPwd] = useStateL(false);
  const [adminMode, setAdminMode] = useStateL(false);
  const [adminUser, setAdminUser] = useStateL("");
  const [adminPwd, setAdminPwd] = useStateL("");
  const [error, setError] = useStateL(null);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    const res = adminMode
      ? onLogin(null, adminUser, adminPwd)
      : onLogin(pwd);
    if (res && !res.ok) setError(res.msg);
  };

  return (
    <div className="login">
      <aside className="login-brand">
        <div className="login-brand-grain"/>
        <div className="login-brand-inner">
          <div className="login-brand-top">
            <div className="login-brand-logo">
              <MaisMark size={44}/>
              <div className="login-brand-wordmark">
                <strong>MAIS</strong>
                <em>SOLUÇÕES E RELACIONAMENTO</em>
              </div>
            </div>
            <span className="login-brand-eyebrow">PORTAL DE ROTINAS</span>
          </div>

          <div className="login-brand-hero">
            <h1>Tudo que sua<br/>operação precisa,<br/><em>num só lugar.</em></h1>
            <p>Manuais oficiais, rotinas atualizadas e respostas rápidas para o dia a dia da operação.</p>
            <p className="login-slogan">Juntos somos <em>MAIS!</em></p>
          </div>

          <div className="login-brand-foot">
            <div className="lb-stat"><strong>+ 10</strong><span>manuais ativos</span></div>
            <div className="lb-stat"><strong>NotebookLM</strong><span>conteúdo oficial</span></div>
            <div className="lb-stat"><strong>24/7</strong><span>acesso interno</span></div>
          </div>
        </div>
        <div className="login-brand-shape login-brand-shape-1"/>
        <div className="login-brand-shape login-brand-shape-2"/>
        <div className="login-brand-shape login-brand-shape-3"/>
      </aside>

      <main className="login-form-wrap">
        <div className="login-form">
          <header className="login-form-head">
            <h2>{adminMode ? "Acesso administrador" : "Acessar portal"}</h2>
            <p>
              {adminMode
                ? "Apenas administradores podem editar a planilha e configurar o portal."
                : "Insira a senha compartilhada da operação MAIS para acessar os manuais."}
            </p>
          </header>

          <form onSubmit={submit}>
            {adminMode && (
              <label className="field">
                <span className="field-label">Usuário administrador</span>
                <div className="field-input">
                  <Icon name="user" size={16}/>
                  <input value={adminUser} onChange={e => setAdminUser(e.target.value)}
                    type="text" autoComplete="username" placeholder="admin"/>
                </div>
              </label>
            )}

            <label className="field">
              <span className="field-label">{adminMode ? "Senha de administrador" : "Senha do portal"}</span>
              <div className="field-input">
                <Icon name="settings" size={16}/>
                <input value={adminMode ? adminPwd : pwd}
                       onChange={e => adminMode ? setAdminPwd(e.target.value) : setPwd(e.target.value)}
                       type={showPwd ? "text" : "password"}
                       autoComplete="current-password" placeholder="••••••••"/>
                <button type="button" className="field-toggle" onClick={() => setShowPwd(s => !s)}>
                  <Icon name="eye" size={16}/>
                </button>
              </div>
            </label>

            {error && <div className="field-error"><Icon name="flag" size={14}/> {error}</div>}

            <Button variant="primary" size="lg" iconRight="arrow" full type="submit">
              {adminMode ? "Entrar como administrador" : "Entrar no portal"}
            </Button>
          </form>

          <div className="login-divider"><span>ou</span></div>

          <button className="login-switch" onClick={() => { setAdminMode(a => !a); setError(null); }}>
            {adminMode
              ? <><Icon name="arrowL" size={14}/> Voltar ao acesso da equipe</>
              : <><Icon name="settings" size={14}/> Sou administrador</>
            }
          </button>

          <footer className="login-form-foot">
            <span>Não tem a senha?</span>
            <a href="#">Solicite ao seu coordenador</a>
          </footer>
        </div>

        <div className="login-meta">
          <span>v1.0 · 2026</span>
          <span>·</span>
          <a href="#">Suporte interno</a>
          <span>·</span>
          <a href="#">Política de uso</a>
        </div>
      </main>
    </div>
  );
}

window.LoginScreen = LoginScreen;
