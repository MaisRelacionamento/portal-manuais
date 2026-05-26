// ======================================================================
// Portal MAIS — Data layer
//
// Lê os manuais da planilha Google publicada como CSV.
// Para trocar a planilha de origem: edite o CSV_URL abaixo.
//
// Como publicar a planilha:
//   Arquivo > Compartilhar > Publicar na web > Folha1, CSV > Publicar
//   Copie o link gerado e cole abaixo.
// ======================================================================

window.MAIS_CONFIG = {
  // 🔧 CONFIGURAÇÃO PRINCIPAL — planilha Google publicada como CSV.
  CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJY4FsMsC4B88RFpngkJyxdu0KlOBUg0s4ffIjR6aZBzt6eYIRwmSgiECRrE_EhNwX_Lt0yMe4s_yc/pub?gid=0&single=true&output=csv",

  // 🔐 Senhas de acesso (ok para portal interno sem dados sensíveis).
  // Para trocar: edite aqui e faça commit.
  SENHA_COLABORADOR: "Mais@2026",
  SENHA_ADMIN:       "MaisAdmin@2026",
  ADMIN_USUARIO:     "admin.mais",

  // Link direto pra planilha (botão "Abrir planilha" no painel admin).
  SHEET_EDIT_URL: "https://docs.google.com/spreadsheets/d/1tJ2KWx2maRJ8lyPtfCKUAuGLW4MYbCq7U6tIQgpeoDY/edit",
};

// ----------------------------------------------------------------------
// CSV → estrutura interna
// ----------------------------------------------------------------------

const CATEGORIA_CORES = {
  "Operação":    "#F88B27",
  "Financeiro":  "#16A34A",
  "Atendimento": "#209CDA",
  "Sistemas":    "#7C3AED",
  "Pessoas":     "#EC4899",
  "Qualidade":   "#0EA5E9",
};

function montarCategorias(rows) {
  const usadas = [...new Set(rows.map(r => (r.categoria || "Outros").trim()).filter(Boolean))];
  return usadas.map(label => ({
    id: label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W+/g, ""),
    label,
    color: CATEGORIA_CORES[label] || "#64748B",
  }));
}

function parseBool(v) {
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "verdadeiro" || s === "sim" || s === "1" || s === "x";
}

function normalizarManuais(rows) {
  const categorias = montarCategorias(rows);
  const catPorLabel = (lbl) =>
    categorias.find(c => c.label === (lbl || "Outros").trim()) ||
    { id: "outros", label: "Outros", color: "#64748B" };

  const manuais = rows
    .filter(r => r.titulo && r.titulo.trim())
    .map((r, i) => {
      const cat = catPorLabel(r.categoria);
      const status = (r.status || "ready").trim().toLowerCase();
      return {
        id: "m" + String(i + 1).padStart(2, "0"),
        title: r.titulo.trim(),
        icon: (r.icon || "📄").trim(),
        link: (r.link || "").trim() || null,
        summary: (r.descricao || "").trim(),
        cat: cat.id,
        category: cat,
        tag: parseBool(r.novo) ? "NOVO" : null,
        status: status === "soon" ? "soon" : "ready",
        version: r.versao ? r.versao.trim() : null,
        updated: r.atualizado_em ? r.atualizado_em.trim() : null,
        author: r.autor && r.autor.trim() ? { name: r.autor.trim(), role: "Operações" } : null,
        reads: 0,
        minutes: r.minutos ? parseInt(r.minutos, 10) || 10 : 10,
        fav: false,
        pdf1_nome: (r.pdf1_nome || "").trim() || null,
        pdf1_link: (r.pdf1_link || "").trim() || null,
        pdf2_nome: (r.pdf2_nome || "").trim() || null,
        pdf2_link: (r.pdf2_link || "").trim() || null,
        pdf3_nome: (r.pdf3_nome || "").trim() || null,
        pdf3_link: (r.pdf3_link || "").trim() || null,
      };
    });

  return { categorias, manuais };
}

// ----------------------------------------------------------------------
// Fetch + cache
// ----------------------------------------------------------------------

const CACHE_KEY = "mais_portal_cache_v1";
const CACHE_TTL = 1 * 60 * 1000; // 1 min

async function buscarCSV(url) {
  const resp = await fetch(url, { cache: "no-store" });
  if (!resp.ok) throw new Error("Falha ao buscar CSV: " + resp.status);
  const text = await resp.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function lerCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, rows } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return rows;
  } catch { return null; }
}

function salvarCache(rows) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), rows }));
  } catch {}
}

// ----------------------------------------------------------------------
// API pública — carrega dados (usado pelo App.jsx)
// ----------------------------------------------------------------------

window.MAIS_LOAD_DATA = async function () {
  let rows = lerCache();
  if (!rows) {
    try {
      rows = await buscarCSV(window.MAIS_CONFIG.CSV_URL);
      salvarCache(rows);
    } catch (e) {
      console.warn("Erro ao carregar planilha, usando exemplo local:", e);
      rows = DADOS_EXEMPLO; // fallback (definido abaixo)
    }
  }

  const { categorias, manuais } = normalizarManuais(rows);

  const stats = {
    totalManuals: manuais.filter(m => m.status === "ready").length,
    soonManuals:  manuais.filter(m => m.status === "soon").length,
    publishedThisMonth: manuais.filter(m => m.tag === "NOVO").length,
    activeCategories: categorias.length,
    lastUpdate: manuais
      .map(m => m.updated).filter(Boolean).sort().reverse()[0] || "—",
  };

  const user = { name: "Operação MAIS", role: "Colaborador", avatar: "OM", permission: "colaborador" };

  return { categories: categorias, manuals: manuais, user, stats };
};

// ----------------------------------------------------------------------
// Dados de exemplo (fallback se a planilha estiver fora do ar)
// ----------------------------------------------------------------------
const DADOS_EXEMPLO = [
  { titulo: "CTM", link: "https://notebooklm.google.com/notebook/ee67662e-de78-4670-980b-19d3aa528cf2",
    status: "ready", icon: "📋", categoria: "Operação", descricao: "Procedimento de Controle de Transações de Mercado.",
    autor: "Patrícia Lemos", atualizado_em: "12 mai 2026", novo: "", minutos: "12" },
  { titulo: "Emissão Boleto Exchange", link: "https://notebooklm.google.com/notebook/5c7aa963-bbb1-47e5-b21b-9ac35de64fe2",
    status: "ready", icon: "💱", categoria: "Financeiro", descricao: "Passo a passo para emissão de boletos via Exchange.",
    autor: "Rafael Tinoco", atualizado_em: "08 mai 2026", novo: "TRUE", minutos: "10" },
  { titulo: "Procedimento Comunicação", link: "https://notebooklm.google.com/notebook/149ddedd-85df-480e-886f-8ee03378b3d6",
    status: "ready", icon: "🗣️", categoria: "Atendimento", descricao: "Diretrizes de comunicação com cliente.",
    autor: "Carolina Bressan", atualizado_em: "29 abr 2026", novo: "", minutos: "8" },
  { titulo: "D2B - Aguardando Posição", link: "https://notebooklm.google.com/notebook/f04cb95a-a67a-41b0-8917-b35abdafa0b8",
    status: "ready", icon: "📌", categoria: "Operação", descricao: "Como tratar registros em D2B aguardando posição.",
    autor: "Diego Aragão", atualizado_em: "02 mai 2026", novo: "", minutos: "9" },
  { titulo: "Pin Pad", link: "", status: "soon", icon: "💳", categoria: "Operação",
    descricao: "Manual de operação do Pin Pad.", autor: "", atualizado_em: "", novo: "", minutos: "7" },
  { titulo: "Middle Integração", link: "https://notebooklm.google.com/notebook/26d2ba26-6dd0-4a27-874f-40d0a8650bc1",
    status: "ready", icon: "🔗", categoria: "Sistemas", descricao: "Fluxos de integração no Middle.",
    autor: "Marina Vidal", atualizado_em: "21 abr 2026", novo: "TRUE", minutos: "15" },
  { titulo: "Baixa e Emissão Boleto D2B", link: "", status: "soon", icon: "🧾", categoria: "Financeiro",
    descricao: "Roteiro completo para baixa e emissão de boletos no D2B.", autor: "", atualizado_em: "", novo: "", minutos: "11" },
  { titulo: "Termo de Quitação", link: "https://notebooklm.google.com/notebook/0ce3d8da-ac90-4df7-ad25-9b951b53124f",
    status: "ready", icon: "📝", categoria: "Financeiro", descricao: "Modelo e procedimento para emissão de termo de quitação.",
    autor: "Rafael Tinoco", atualizado_em: "10 abr 2026", novo: "", minutos: "6" },
  { titulo: "Envio de Apuração e Recebimento de NF", link: "", status: "soon", icon: "📊", categoria: "Financeiro",
    descricao: "Processo de apuração mensal e ciclo de recebimento de nota fiscal.", autor: "", atualizado_em: "", novo: "", minutos: "14" },
  { titulo: "Prova de Pagamento AG1 e AG2", link: "", status: "soon", icon: "📑", categoria: "Financeiro",
    descricao: "Como tratar e arquivar provas de pagamento das agências.", autor: "", atualizado_em: "", novo: "", minutos: "8" },
];
