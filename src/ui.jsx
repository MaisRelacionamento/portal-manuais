// Shared UI primitives for the MAIS portal.
// Exports to window so other Babel scripts can use them.
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Icons (stroke-based, premium feel) ----------
const Icon = ({ name, size = 18, className = "", strokeWidth = 1.6 }) => {
  const paths = {
    search:    <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    book:      <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></>,
    bookmark:  <><path d="M6 4h12v17l-6-4-6 4V4Z"/></>,
    bookmarkF: <><path d="M6 4h12v17l-6-4-6 4V4Z" fill="currentColor"/></>,
    clock:     <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check:     <><path d="m5 12 4 4 10-10"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    arrow:     <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    arrowL:    <><path d="M19 12H5M11 5l-7 7 7 7"/></>,
    filter:    <><path d="M4 5h16M7 12h10M10 19h4"/></>,
    grid:      <><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></>,
    list:      <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    bell:      <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 10H3c0-3 3-3 3-10Z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    download:  <><path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14"/></>,
    print:     <><path d="M7 8V3h10v5M7 18H4v-8h16v8h-3M7 14h10v7H7z"/></>,
    share:     <><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8 11 8-4M8 13l8 4"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    spark:     <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/></>,
    heart:     <><path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6 5c2 0 3.5 1 4.5 2.5L12 9l1.5-1.5C14.5 6 16 5 18 5c3 0 5 3.5 3.5 7-2.5 4.5-9.5 9-9.5 9Z"/></>,
    msg:       <><path d="M21 12a8 8 0 0 1-8 8H4l1.5-3A8 8 0 1 1 21 12Z"/></>,
    eye:       <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    edit:      <><path d="M14 4l6 6-11 11H3v-6L14 4Z"/></>,
    trash:     <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></>,
    sort:      <><path d="M8 4v16m0 0-3-3m3 3 3-3M16 20V4m0 0-3 3m3-3 3 3"/></>,
    close:     <><path d="M6 6l12 12M18 6 6 18"/></>,
    chevron:   <><path d="m9 6 6 6-6 6"/></>,
    chevronD:  <><path d="m6 9 6 6 6-6"/></>,
    home:      <><path d="M3 12 12 4l9 8M5 10v10h14V10"/></>,
    folder:    <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></>,
    flag:      <><path d="M5 4v17M5 4h11l-2 4 2 4H5"/></>,
    dot:       <><circle cx="12" cy="12" r="3" fill="currentColor"/></>,
    sparkle:   <><path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z"/></>,
    logout:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
      strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
};

// ---------- Logo ----------
const MaisLogo = ({ height = 32, mono = false }) => (
  <img src="assets/logo-mais.png" alt="MAIS Soluções e Relacionamento"
    style={{ height, width: "auto", display: "block",
      filter: mono ? "grayscale(1) brightness(.4)" : "none" }} />
);

// Just the icon (3 people) — drawn as SVG to scale crisply
const MaisMark = ({ size = 28 }) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 64 50" fill="none">
    <circle cx="14" cy="11" r="7" fill="#C7C424"/>
    <path d="M2 36c0-7 5.4-12 12-12s12 5 12 12v8H2v-8Z" fill="#C7C424"/>
    <circle cx="32" cy="8" r="7.5" fill="#F88B27"/>
    <path d="M19 35c0-7.2 5.8-13 13-13s13 5.8 13 13v9H19v-9Z" fill="#F88B27"/>
    <circle cx="50" cy="11" r="7" fill="#209CDA"/>
    <path d="M38 36c0-7 5.4-12 12-12s12 5 12 12v8H38v-8Z" fill="#209CDA"/>
  </svg>
);

// ---------- Button ----------
const Button = ({ variant = "primary", size = "md", icon, iconRight, children, onClick, full, disabled, type = "button" }) => {
  const cls = `btn btn-${variant} btn-${size}${full ? " btn-full" : ""}`;
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type={type}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16}/>}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 14 : 16}/>}
    </button>
  );
};

// ---------- Tag / Pill ----------
const CategoryTag = ({ category, dot = true, size = "sm" }) => (
  <span className={`cat-tag cat-tag-${size}`} style={{ "--cat": category.color }}>
    {dot && <span className="cat-tag-dot"/>}
    {category.label}
  </span>
);

const StatusBadge = ({ kind }) => {
  if (!kind) return null;
  const map = {
    NOVO:       { bg: "rgba(32,156,218,.12)",  fg: "#0B6A99", label: "NOVO" },
    ATUALIZADO: { bg: "rgba(248,139,39,.14)",  fg: "#B85F0A", label: "ATUALIZADO" },
  };
  const s = map[kind];
  return <span className="status-badge" style={{ background: s.bg, color: s.fg }}>{s.label}</span>;
};

// ---------- Avatar ----------
const Avatar = ({ name, size = 32, color }) => {
  const initials = name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  const palette = ["#F88B27", "#209CDA", "#C7C424", "#7C3AED", "#16A34A", "#EC4899"];
  const c = color || palette[name.charCodeAt(0) % palette.length];
  return (
    <span className="avatar" style={{
      width: size, height: size, background: c,
      fontSize: size * 0.42, lineHeight: `${size}px`
    }}>{initials}</span>
  );
};

// ---------- Progress ----------
const Progress = ({ value, color = "#F88B27", height = 4 }) => (
  <div className="progress" style={{ height }}>
    <div className="progress-bar" style={{ width: `${value}%`, background: color }}/>
  </div>
);

// ---------- ProgressRing ----------
const ProgressRing = ({ value, size = 36, stroke = 3, color = "#F88B27" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring">
      <circle cx={size/2} cy={size/2} r={r} stroke="#E2E8F0" strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={c - (value/100)*c}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
};

// ---------- Card thumbnail — emoji-led hero (matches CSV `icon` column) ----------
const ManualThumb = ({ manual, height = 120, big = false }) => {
  const c = manual.category.color;
  const isSoon = manual.status === "soon";
  return (
    <div className={`thumb${isSoon ? " thumb-soon" : ""}`}
      style={{ height, background: `linear-gradient(135deg, ${c}1F 0%, ${c}08 60%, transparent 100%)` }}>
      <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"
        style={{ position:"absolute", inset:0 }}>
        <defs>
          <pattern id={`p-${manual.id}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 14L14 0" stroke={c} strokeOpacity="0.14" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="200" height="120" fill={`url(#p-${manual.id})`}/>
        <circle cx="172" cy="22" r="50" fill={c} fillOpacity="0.08"/>
      </svg>
      <div className="thumb-emoji" style={{ fontSize: big ? 56 : 40 }}>{manual.icon}</div>
      <div className="thumb-mark" style={{ color: c }}>
        <span className="thumb-mono">{manual.id.toUpperCase()}</span>
        {big && <span className="thumb-cat">{manual.category.label}</span>}
      </div>
      {manual.tag && <div className="thumb-tag"><StatusBadge kind={manual.tag}/></div>}
      {isSoon && <div className="thumb-soon-strip"><span>EM BREVE</span></div>}
    </div>
  );
};

// ---------- Input ----------
const SearchInput = ({ value, onChange, placeholder = "Buscar manuais, palavras-chave…", size = "md", autoFocus }) => (
  <div className={`search search-${size}`}>
    <Icon name="search" size={size === "lg" ? 20 : 16}/>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}/>
    {value && <button className="search-clear" onClick={() => onChange("")}><Icon name="close" size={14}/></button>}
  </div>
);

// Expose to other Babel scripts
Object.assign(window, {
  Icon, MaisLogo, MaisMark, Button, CategoryTag, StatusBadge,
  Avatar, Progress, ProgressRing, ManualThumb, SearchInput,
});
