# Portal MAIS · Rotinas Operacionais

Portal interno de manuais de rotina da equipe MAIS.  
Os manuais ficam no **NotebookLM** e são cadastrados numa **planilha Google** — o portal lê o CSV publicado e monta a biblioteca automaticamente.

---

## Estrutura de arquivos

```
portal-mais/
├── index.html                  ← página principal (abre no navegador)
├── assets/
│   └── logo-mais.png           ← logotipo da MAIS
└── src/
    ├── data.js                 ← 🔧 CONFIGURAR AQUI (CSV, senhas)
    ├── app.jsx                 ← roteamento principal
    ├── ui.jsx                  ← componentes reutilizáveis
    ├── screen-login.jsx
    ├── screen-shell.jsx        ← sidebar + topbar
    ├── screen-dashboard.jsx    ← biblioteca de manuais
    ├── screen-manual.jsx       ← página do manual
    ├── screen-admin.jsx        ← painel de gestão
    └── styles/
        ├── base.css
        ├── layout.css
        ├── dashboard.css
        ├── screens.css
        └── bootstrap.css       ← splash de carregamento
```

---

## Como configurar antes de subir

Abra o arquivo **`src/data.js`** e ajuste as 3 seções:

```js
window.MAIS_CONFIG = {
  // 1. Link CSV da planilha Google publicada
  //    Planilha → Arquivo → Compartilhar → Publicar na web → Folha1, CSV → Publicar
  CSV_URL: "https://docs.google.com/spreadsheets/d/e/SEU_ID_AQUI/pub?output=csv",

  // 2. Senha de acesso para a equipe
  SENHA_COLABORADOR: "mais2026",

  // 3. Credenciais do administrador
  SENHA_ADMIN:   "admin@mais2026",
  ADMIN_USUARIO: "admin",

  // 4. Link direto para editar a planilha (botão no painel admin)
  SHEET_EDIT_URL: "https://docs.google.com/spreadsheets/d/SEU_ID/edit",
};
```

> ⚠️ **Atenção:** as senhas ficam visíveis no código. Isso é aceitável para portais internos sem informações sensíveis. Não use senhas corporativas críticas aqui.

---

## Como subir no GitHub Pages (passo a passo)

### 1. Crie o repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** (botão verde no canto superior direito)
3. Dê um nome, ex: `portal-mais`
4. Deixe como **Public** (necessário para GitHub Pages gratuito)
5. **Não** marque nenhuma opção de inicialização — clique em **"Create repository"**

### 2. Suba os arquivos

**Opção A — pelo site do GitHub (mais fácil, sem instalar nada):**

1. Na página do repositório vazio, clique em **"uploading an existing file"**
2. Arraste a pasta `portal-mais` inteira — ou selecione todos os arquivos
3. Importante: o GitHub não aceita pastas vazias. Suba assim:
   - Primeiro suba `index.html` e `.gitignore`
   - Depois crie as pastas manualmente clicando em **"Add file → Create new file"** e digitando o caminho, ex: `src/data.js` — cole o conteúdo e salve
   - Repita para cada arquivo em `src/` e `src/styles/`
   - Para o logo: **"Add file → Upload files"** → selecione `logo-mais.png` e salve como `assets/logo-mais.png`

**Opção B — pelo Git (se tiver Git instalado):**

```bash
# Na pasta portal-mais:
git init
git add .
git commit -m "Portal MAIS v2 — refatorado"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/portal-mais.git
git push -u origin main
```

### 3. Ative o GitHub Pages

1. No repositório, clique em **Settings** (aba no topo)
2. No menu lateral, clique em **Pages**
3. Em **"Source"**, selecione:
   - Branch: `main`
   - Pasta: `/ (root)`
4. Clique em **Save**
5. Aguarde ~1 minuto. A URL aparece no topo da página, no formato:  
   `https://SEU_USUARIO.github.io/portal-mais/`

---

## Como adicionar um manual

1. Abra a planilha Google configurada em `CSV_URL`
2. Adicione uma nova linha com as colunas abaixo
3. Salve — o portal sincroniza a cada 5 minutos

| Coluna | Obrigatório | Exemplo |
|--------|-------------|---------|
| `titulo` | ✅ | `CTM` |
| `link` | ✅ | `https://notebooklm.google.com/...` |
| `status` | ✅ | `ready` ou `soon` |
| `icon` | ✅ | `📋` |
| `categoria` | — | `Operação` |
| `descricao` | — | `Procedimento de controle...` |
| `autor` | — | `Patrícia Lemos` |
| `atualizado_em` | — | `12 mai 2026` |
| `novo` | — | `TRUE` |
| `minutos` | — | `12` |

**Categorias disponíveis:** Operação · Financeiro · Atendimento · Sistemas · Pessoas · Qualidade

---

## Senhas padrão

| Perfil | Usuário | Senha |
|--------|---------|-------|
| Equipe | — | `mais2026` |
| Admin | `admin` | `admin@mais2026` |

Troque em `src/data.js` antes de publicar.

---

## Dúvidas frequentes

**O portal carrega mas não mostra manuais?**  
Verifique se o `CSV_URL` em `data.js` está correto e se a planilha foi publicada como CSV público.

**Alterei a planilha mas o portal não atualizou?**  
O cache dura 5 minutos. Limpe o cache do navegador (Ctrl+Shift+R) para forçar atualização.

**Posso usar domínio próprio?**  
Sim — no GitHub Pages, vá em Settings → Pages → Custom domain e configure seu DNS.
