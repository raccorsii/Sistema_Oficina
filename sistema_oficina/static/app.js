// Utilitários compartilhados (JavaScript puro)
async function api(url, metodo = "GET", corpo) {
  const r = await fetch(url, { method: metodo, headers: { "Content-Type": "application/json" },
    body: corpo ? JSON.stringify(corpo) : undefined, credentials: "same-origin" });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && url !== "/api/login") { location.href = "/login?expirou=1"; throw new Error(d.erro); }
  if (!r.ok) throw new Error(d.erro || "Erro na requisição.");
  return d;
}
function el(tag, texto, attrs = {}) { // usa textContent: evita XSS
  const e = document.createElement(tag); if (texto != null) e.textContent = texto;
  Object.assign(e, attrs); return e;
}
function mensagem(tipo, texto) {
  const m = document.getElementById("msg"); m.className = "msg " + tipo; m.textContent = texto;
}
function fmtData(s) { return s ? s.replace("T", " ").slice(0, 16) : ""; }
async function montarMenu() {
  const h = document.getElementById("topo");
  const { nome } = await api("/api/me");
  h.append(el("strong", "Oficina"), el("a", "Início", { href: "/principal" }), el("a", "Clientes", { href: "/clientes" }),
    el("a", "Veículos", { href: "/veiculos" }), el("a", "Agendamentos", { href: "/agendamentos" }));
  const u = el("span", "Usuário: " + nome, { className: "user" });
  const sair = el("button", "Sair", { className: "sec" });
  sair.onclick = async () => { await api("/api/logout", "POST"); location.href = "/login"; };
  h.append(u, sair);
}
