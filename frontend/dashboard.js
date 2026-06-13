const API_URL = "http://127.0.0.1:3000/api";
let eventoEditandoId = null;
let localEditandoId = null;
let mapaGlobal = null;
let marcadorGlobal = null;

const avatarPadrao = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%230c3b5e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>";

function obterToken() {
  return localStorage.getItem("token");
}

function obterCabecalhosAutenticados(incluirJson = false) {
  const token = obterToken();
  const headers = {
    Authorization: `Bearer ${token}`
  };
  if (incluirJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

function encerrarSessao() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_rank");
  localStorage.removeItem("simulated_rank");
  localStorage.removeItem("dashboard_secao_ativa");
  localStorage.removeItem("user_avatar");
  localStorage.removeItem("user_phone");
  localStorage.removeItem("user_cpf");
  localStorage.removeItem("user_nascimento");
  localStorage.removeItem("user_genero");
  localStorage.removeItem("user_insta");
  localStorage.removeItem("user_face");
  localStorage.removeItem("user_yt");
  window.location.href = "index.html";
}

async function requisicaoAutenticada(url, opcoes = {}) {
  const token = obterToken();
  if (!token) {
    encerrarSessao();
    throw new Error("Usuário não autenticado.");
  }
  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      ...obterCabecalhosAutenticados(opcoes.body !== undefined),
      ...(opcoes.headers || {})
    }
  });
  if (resposta.status === 401) {
    encerrarSessao();
    throw new Error("Sessão inválida ou expirada.");
  }
  return resposta;
}

function irParaSecaoRapido(secao) {
  const botao = document.querySelector(`[data-section="${secao}"]`);
  if (botao) {
    botao.click();
  }
}
window.irParaSecaoRapido = irParaSecaoRapido;

function converterArquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.readAsDataURL(arquivo);
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = erro => reject(erro);
  });
}

function maskDateField(e) {
  let v = e.target.value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
  else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, "$1/$2");
  e.target.value = v;
}
window.maskDateField = maskDateField;

function formatarDataParaExibicao(iso) {
  if (!iso) return "—";
  if (iso.includes("/")) return iso;
  const d = new Date(iso);
  if (isNaN(d)) {
    const partes = iso.split("-");
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return iso;
  }
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

function maskPhoneField(e) {
  let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
  e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
}
window.maskPhoneField = maskPhoneField;

function maskCPFField(e) {
  let v = e.target.value.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  e.target.value = v;
}
window.maskCPFField = maskCPFField;

function inicializarMapaParoquial(lat = -1.4558, lng = -48.4902) {
  const container = document.getElementById("mapa-local-container");
  if (!container || typeof L === "undefined") return;
  if (!mapaGlobal) {
    mapaGlobal = L.map("mapa-local-container").setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaGlobal);
    marcadorGlobal = L.marker([lat, lng]).addTo(mapaGlobal);
  } else {
    mapaGlobal.setView([lat, lng], 15);
    marcadorGlobal.setLatLng([lat, lng]);
  }
}

function toggleModoEdicaoPerfil(editMode = true) {
  const viewContainer = document.getElementById("profile-view-container");
  const editContainer = document.getElementById("profile-edit-container");
  if (viewContainer && editContainer) {
    if (editMode) {
      viewContainer.classList.add("hidden");
      editContainer.classList.remove("hidden");
    } else {
      viewContainer.classList.remove("hidden");
      editContainer.classList.add("hidden");
    }
  }
}
window.toggleModoEdicaoPerfil = toggleModoEdicaoPerfil;

function atualizarMenuPorRank(rank) {
  const botoesMenu = document.querySelectorAll(".nav-item");
  botoesMenu.forEach((btn) => {
    const alvo = btn.getAttribute("data-section");
    btn.classList.remove("hidden");
    if (rank === "membro") {
      if (alvo !== "dashboard" && alvo !== "perfil" && alvo !== "comentarios" && alvo !== "doacoes" && alvo !== "inscricoes") {
        btn.classList.add("hidden");
      }
    } else if (rank === "voluntario") {
      if (alvo !== "dashboard" && alvo !== "perfil" && alvo !== "voluntarios" && alvo !== "inscricoes") {
        btn.classList.add("hidden");
      }
    } else if (rank === "lider") {
      if (alvo === "doacoes" || alvo === "relatorios" || alvo === "categorias" || alvo === "locais") {
        btn.classList.add("hidden");
      }
    }
  });

  const rankReal = localStorage.getItem("user_rank") || "membro";
  const optionAdmin = document.getElementById("option-funcao-admin");
  if (optionAdmin) {
    if (rankReal === "pastor") {
      optionAdmin.classList.add("hidden");
      optionAdmin.disabled = true;
    } else {
      optionAdmin.classList.remove("hidden");
      optionAdmin.disabled = false;
    }
  }

  const cardSimulador = document.getElementById("card-simulador");
  if (cardSimulador) {
    if (rankReal === "admin") {
      cardSimulador.classList.remove("hidden");
    } else {
      cardSimulador.classList.add("hidden");
    }
  }

  const nome = localStorage.getItem("user_name") || "Usuário";
  const email = localStorage.getItem("user_email") || "";
  const avatarUrl = localStorage.getItem("user_avatar") || avatarPadrao;

  const sidebarAvatar = document.getElementById("sidebar-user-avatar");
  const previewAvatar = document.getElementById("profile-avatar-preview");
  if (sidebarAvatar) sidebarAvatar.src = avatarUrl;
  if (previewAvatar) previewAvatar.src = avatarUrl;

  const elementos = {
    "sidebar-user-name": nome,
    "sidebar-user-email": email,
    "sidebar-user-rank": rank.toUpperCase()
  };

  Object.entries(elementos).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.innerText = valor;
    }
  });

  const nascimentoLimpo = formatarDataParaExibicao(localStorage.getItem("user_nascimento"));
  
  const viewElements = {
    "view-perfil-nome": nome,
    "view-perfil-rank": rank.toUpperCase(),
    "view-perfil-cpf": localStorage.getItem("user_cpf") || "—",
    "view-perfil-email": email,
    "view-perfil-telefone": localStorage.getItem("user_phone") || "—",
    "view-perfil-nascimento": nascimentoLimpo,
    "view-perfil-genero": localStorage.getItem("user_genero") || "—"
  };
  Object.entries(viewElements).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
  });
  
  const imgView = document.getElementById("view-perfil-foto");
  if (imgView) imgView.src = avatarUrl;

  const fields = {
    "input-perfil-nome": nome,
    "input-perfil-cpf": localStorage.getItem("user_cpf") || "",
    "input-perfil-telefone": localStorage.getItem("user_phone") || "",
    "input-perfil-nascimento": nascimentoLimpo === "—" ? "" : nascimentoLimpo,
    "input-perfil-genero": localStorage.getItem("user_genero") || "Masculino",
    "input-perfil-foto": localStorage.getItem("user_avatar") || "",
    "input-perfil-instagram": localStorage.getItem("user_insta") || "",
    "input-perfil-facebook": localStorage.getItem("user_face") || "",
    "input-perfil-youtube": localStorage.getItem("user_yt") || ""
  };
  Object.entries(fields).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el) el.value = valor;
  });

  const viewRedes = document.getElementById("view-perfil-redes");
  const instaUrl = localStorage.getItem("user_insta") || "";
  const faceUrl = localStorage.getItem("user_face") || "";
  const ytUrl = localStorage.getItem("user_yt") || "";

  if (viewRedes) {
    if (instaUrl || faceUrl || ytUrl) {
      viewRedes.classList.remove("hidden");
      const lInsta = document.getElementById("link-perfil-insta");
      const lFace = document.getElementById("link-perfil-face");
      const lYt = document.getElementById("link-perfil-yt");
      if (lInsta) {
        if (instaUrl) {
          lInsta.classList.remove("hidden");
          lInsta.href = instaUrl.startsWith("@") ? `https://instagram.com/${instaUrl.replace("@", "")}` : instaUrl;
        } else {
          lInsta.classList.add("hidden");
        }
      }
      if (lFace) {
        if (faceUrl) {
          lFace.classList.remove("hidden");
          lFace.href = faceUrl;
        } else {
          lFace.classList.add("hidden");
        }
      }
      if (lYt) {
        if (ytUrl) {
          lYt.classList.remove("hidden");
          lYt.href = ytUrl;
        } else {
          lYt.classList.add("hidden");
        }
      }
    } else {
      viewRedes.classList.add("hidden");
    }
  }

  const viewFinAdmin = document.getElementById("view-financeiro-admin");
  const viewFinMembro = document.getElementById("view-financeiro-membro");
  if (viewFinAdmin && viewFinMembro) {
    if (rank === "admin" || rank === "pastor") {
      viewFinAdmin.classList.remove("hidden");
      viewFinMembro.classList.add("hidden");
    } else {
      viewFinAdmin.classList.add("hidden");
      viewFinMembro.classList.remove("hidden");
    }
  }

  const containerEnvioNotif = document.getElementById("container-envio-notificacao");
  const containerListNotif = document.getElementById("notificacoes-list-container");
  if (containerEnvioNotif && containerListNotif) {
    if (rank === "admin" || rank === "pastor" || rank === "lider") {
      containerEnvioNotif.classList.remove("hidden");
      containerListNotif.className = "layout-card-mural xl:col-span-2 !p-0 overflow-hidden self-start bg-white divide-y divide-slate-100";
    } else {
      containerEnvioNotif.classList.add("hidden");
      containerListNotif.className = "layout-card-mural xl:col-span-3 !p-0 overflow-hidden self-start bg-white divide-y divide-slate-100";
    }
  }

  const containerFormInscricao = document.getElementById("container-form-inscricao");
  const containerTblInscricao = document.getElementById("container-tbl-inscricao");
  if (containerFormInscricao && containerTblInscricao) {
    if (rank === "membro") {
      containerFormInscricao.classList.remove("hidden");
      containerTblInscricao.className = "layout-card-mural xl:col-span-2 !p-0 overflow-hidden self-start";
      const boxSelectUser = document.getElementById("box-select-inscricao-usuario");
      if (boxSelectUser) boxSelectUser.classList.add("hidden");
    } else {
      if (rank === "voluntario") {
        containerFormInscricao.classList.add("hidden");
        containerTblInscricao.className = "layout-card-mural xl:col-span-3 !p-0 overflow-hidden self-start";
      } else {
        containerFormInscricao.classList.remove("hidden");
        containerTblInscricao.className = "layout-card-mural xl:col-span-2 !p-0 overflow-hidden self-start";
        const boxSelectUser = document.getElementById("box-select-inscricao-usuario");
        if (boxSelectUser) boxSelectUser.classList.remove("hidden");
      }
    }
  }
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll(".nav-item").forEach((botao) => {
      botao.classList.remove("active");
    });
    button.classList.add("active");
    document.querySelectorAll("main section").forEach((section) => {
      section.classList.add("hidden");
    });
    const nomeSecao = button.getAttribute("data-section");
    localStorage.setItem("dashboard_secao_ativa", nomeSecao);
    const targetSection = document.getElementById(`sec-${nomeSecao}`);
    if (targetSection) {
      targetSection.classList.remove("hidden");
      const titulo = document.getElementById("page-title");
      if (titulo) {
        titulo.innerText = button.innerText.trim();
      }
    }
    if (nomeSecao === "dashboard") {
      await atualizarDashboardGeral();
    }
    if (nomeSecao === "usuarios") {
      await listarUsuarios();
    }
    if (nomeSecao === "eventos") {
      await carregarOpcoesFormEventos();
      await listarEventos();
    }
    if (nomeSecao === "categorias") {
      await listarCategorias();
    }
    if (nomeSecao === "locais") {
      await listarLocais();
    }
    if (nomeSecao === "ministerios") {
      await listarMinisterios();
    }
    if (nomeSecao === "inscricoes") {
      await listarInscricoes();
    }
    if (nomeSecao === "voluntarios") {
      await listarVoluntarios();
    }
    if (nomeSecao === "comentarios") {
      await listarComentarios();
    }
    if (nomeSecao === "doacoes") {
      await listarDoacoes();
    }
    if (nomeSecao === "notificacoes") {
      await listarNotificacoes();
    }
    if (nomeSecao === "relatorios") {
      await gerarRelatoriosAvancados();
    }
          

  });
});

function aplicarSimulacaoRank() {
  const seletor = document.getElementById("select-teste-rank");
  if (!seletor) return;
  const rank = seletor.value;
  localStorage.setItem("simulated_rank", rank);
  atualizarMenuPorRank(rank);
  localStorage.setItem("dashboard_secao_ativa", "dashboard");
  window.location.reload();
}

async function deletarRecurso(recurso, id, callback) {
  if (!confirm("Deseja realmente excluir permanentemente este registro?")) return;
  try {
    const resposta = await requisicaoAutenticada(`${API_URL}/${recurso}/${id}`, {
      method: "DELETE"
    });
    if (resposta.ok) {
      alert("Registro removido com sucesso.");
      await callback();
      try { await carregarSeletoresGlobais(); } catch(e) {}
      try { await atualizarDashboardGeral(); } catch(e) {}
    } else {
      const err = await resposta.json();
      alert("Erro ao remover: " + (err.erro || "Ação não permitida."));
    }
  } catch (erro) {
    console.error(erro);
  }
}

async function deletarUsuario(id) { await deletarRecurso("usuarios", id, listarUsuarios); }
async function deletarEvento(id) { await deletarRecurso("eventos", id, listarEventos); }
async function deletarCategoria(id) { await deletarRecurso("categorias", id, listarCategorias); }
async function deletarLocal(id) { await deletarRecurso("locais", id, listarLocais); }
async function deletarMinisterio(id) { await deletarRecurso("ministerios", id, listarMinisterios); }
async function deletarInscricao(id) { await deletarRecurso("inscricoes", id, listarInscricoes); }
async function deletarVoluntario(id) { await deletarRecurso("voluntarios", id, listarVoluntarios); }
async function deletarComentario(id) { await deletarRecurso("comentarios", id, listarComentarios); }
async function deletarDoacao(id) { await deletarRecurso("doacoes", id, listarDoacoes); }
async function deletarNotificacao(id) { await deletarRecurso("notificacoes", id, listarNotificacoes); }

window.deletarUsuario = deletarUsuario;
window.deletarEvento = deletarEvento;
window.deletarCategoria = deletarCategoria;
window.deletarLocal = deletarLocal;
window.deletarMinisterio = deletarMinisterio;
window.deletarInscricao = deletarInscricao;
window.deletarVoluntario = deletarVoluntario;
window.deletarComentario = deletarComentario;
window.deletarDoacao = deletarDoacao;
window.deletarNotificacao = deletarNotificacao;

async function alternarCheckIn(id, statusAtual) {
  try {
    const novoStatus = statusAtual === "confirmado" ? "pendente" : "confirmado";
    const body = { status: novoStatus, checkIn: { realizado: novoStatus === "confirmado", data: novoStatus === "confirmado" ? new Date() : null } };
    const res = await requisicaoAutenticada(`${API_URL}/inscricoes/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });
    if (res.ok) {
      await listarInscricoes();
    }
  } catch (err) {
    console.error(err);
  }
}
window.alternarCheckIn = alternarCheckIn;

async function editarEvento(id) {
  try {
    const res = await requisicaoAutenticada(`${API_URL}/eventos/${id}`);
    const e = await res.json();
    if (!res.ok) return;
    const form = document.getElementById("form-evento");
    if (!form) return;
    form.querySelector('[name="titulo"]').value = e.titulo;
    form.querySelector('[name="descricao"]').value = e.descricao || "";
    form.querySelector('[name="categoria"]').value = e.categoria;
    form.querySelector('[name="local"]').value = e.local;
    if (e.data) {
      form.querySelector('[name="data"]').value = new Date(e.data).toISOString().slice(0, 16);
    }
    form.querySelector('[name="capacidade"]').value = e.capacidade;
    eventoEditandoId = id;
    form.querySelector('button[type="submit"]').innerText = "Atualizar Evento";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
  }
}
window.editarEvento = editarEvento;

async function editarLocal(id) {
  try {
    const res = await requisicaoAutenticada(`${API_URL}/locais/${id}`);
    const l = await res.json();
    if (!res.ok) return;
    const form = document.getElementById("form-local");
    if (!form) return;
    form.querySelector('[name="nome"]').value = l.nome;
    form.querySelector('[name="capacidade"]').value = l.capacidade;
    form.querySelector('[name="cep"]').value = l.endereco?.cep || "";
    form.querySelector('[name="rua"]').value = l.endereco?.rua || "";
    form.querySelector('[name="numero"]').value = l.endereco?.numero || "";
    form.querySelector('[name="bairro"]').value = l.endereco?.bairro || "";
    form.querySelector('[name="cidade"]').value = l.endereco?.cidade || "";
    form.querySelector('[name="estado"]').value = l.endereco?.estado || "";
    localEditandoId = id;
    document.getElementById("titulo-form-local").innerText = "Editar Local";
    form.querySelector('button[type="submit"]').innerText = "Atualizar Local";
    document.getElementById("btn-cancelar-local")?.classList.remove("hidden");
    
    if (l.endereco?.cidade && l.endereco?.estado) {
      const qStr = `${l.endereco.rua || ''} ${l.endereco.bairro || ''} ${l.endereco.cidade} ${l.endereco.estado}`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(qStr)}`)
        .then(r => r.json())
        .then(d => { if (d && d.length > 0) inicializarMapaParoquial(parseFloat(d[0].lat), parseFloat(d[0].lon)); });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
  }
}
window.editarLocal = editarLocal;

async function atualizarDashboardGeral() {
  try {
    const rankReal = localStorage.getItem("user_rank") || "membro";
    const rankExibido = localStorage.getItem("simulated_rank") || rankReal;
    let totalMembrosExibir = "—";

    const respostaUsuarios = await requisicaoAutenticada(`${API_URL}/usuarios`);
    if (respostaUsuarios.ok) {
      const todosMembros = await respostaUsuarios.json();
      if (Array.isArray(todosMembros)) {
        if (rankExibido === "admin") {
          totalMembrosExibir = todosMembros.length;
        } else if (rankExibido === "pastor" || rankExibido === "lider") {
          totalMembrosExibir = todosMembros.filter(u => u.tipo !== "admin").length;
        } else {
          totalMembrosExibir = todosMembros.filter(u => u.tipo === "membro").length;
        }
      }
    }

    const respostaEventos = await requisicaoAutenticada(`${API_URL}/eventos`);
    const eventos = respostaEventos.ok ? await respostaEventos.json() : [];
    
    const respostaInscricoes = await requisicaoAutenticada(`${API_URL}/inscricoes`);
    const inscricoes = respostaInscricoes.ok ? await respostaInscricoes.json() : [];

    const respostaVoluntarios = await requisicaoAutenticada(`${API_URL}/voluntarios`);
    const voluntarios = respostaVoluntarios.ok ? await respostaVoluntarios.json() : [];

    const respostaDoacoes = await requisicaoAutenticada(`${API_URL}/doacoes`);
    const doacoes = respostaDoacoes.ok ? await respostaDoacoes.json() : [];

    const respostaComentarios = await requisicaoAutenticada(`${API_URL}/comentarios`);
    const marqueeTestemunhos = document.getElementById("dashboard-testimonies-marquee");
    if (marqueeTestemunhos && respostaComentarios.ok) {
      const listaComentarios = await respostaComentarios.json();
      if (Array.isArray(listaComentarios) && listaComentarios.length > 0) {
        marqueeTestemunhos.innerHTML = [...listaComentarios, ...listaComentarios].map(c => `
          <span class="inline-block bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm font-medium mx-2">
            <span class="text-amber-500 font-bold">★ ${c.avaliacao || 5}</span> 
            "${c.mensagem}" 
            <span class="text-slate-400 font-normal">— ${c.usuario?.nome || 'Fiel'}</span>
          </span>
        `).join("");
      } else {
        marqueeTestemunhos.innerHTML = `<span class="inline-block bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">Nenhum testemunho publicado no mural ainda.</span>`;
      }
    }

    const totalArrecadado = Array.isArray(doacoes) ? doacoes.reduce((acc, curr) => acc + (curr.valor || 0), 0) : 0;
    const metaFinanceira = 15000;
    const porcentagemMeta = Math.min(Math.round((totalArrecadado / metaFinanceira) * 100), 100);

    const boxProgresso = document.getElementById("donation-progress-content");
    if (boxProgresso) {
      boxProgresso.innerHTML = `
        <div class="space-y-2">
          <div class="flex items-baseline justify-between">
            <span class="text-xl font-bold text-slate-800 font-display">R$ ${totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span class="text-xs font-semibold text-slate-400">Meta R$ 15.000</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2">
            <div class="bg-emerald-500 h-2 progress-animated rounded-full" style="width: ${porcentagemMeta}%"></div>
          </div>
          <p class="text-[11px] text-emerald-600 font-medium">${porcentagemMeta}% da meta alcançada</p>
        </div>
      `;
    }

    const containerRecentes = document.getElementById("recent-events-list");
    if (containerRecentes) {
      if (Array.isArray(eventos) && eventos.length > 0) {
        containerRecentes.innerHTML = eventos.slice(0, 3).map(ev => `
          <div class="flex items-center justify-between p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
            <div class="min-w-0 flex-1 pr-3">
              <p class="text-xs font-semibold text-slate-700 truncate">${ev.titulo}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">${new Date(ev.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <span class="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold uppercase">${ev.status || 'Confirmado'}</span>
          </div>
        `).join("");
      } else {
        containerRecentes.innerHTML = `<p class="text-xs text-slate-400 py-2 text-center">Nenhum evento agendado.</p>`;
      }
    }

    const statMembros = document.getElementById("stat-membros");
    const statEventos = document.getElementById("stat-eventos");
    const statInscricoes = document.getElementById("stat-inscricoes");
    const statVoluntarios = document.getElementById("stat-voluntarios");
    if (statMembros) statMembros.innerText = totalMembrosExibir;
    if (statEventos) statEventos.innerText = Array.isArray(eventos) ? eventos.length : 0;
    if (statInscricoes) statInscricoes.innerText = Array.isArray(inscricoes) ? inscricoes.length : 0;
    if (statVoluntarios) statVoluntarios.innerText = Array.isArray(voluntarios) ? voluntarios.length : 0;
  } catch (erro) {
    console.error(erro);
  }
}

function configureGenericForm(formId, resourceUrl, listCallback) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data.funcao && formId === "form-usuario") {
      data.tipo = data.funcao;
      delete data.funcao;
    }

    if (formId === "form-comentario") {
      data.usuario = localStorage.getItem("user_id");
    }

    try {
      const response = await requisicaoAutenticada(`${API_URL}/${resourceUrl}`, {
        method: "POST",
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      if (!response.ok) {
        alert("Erro: " + (responseData.erro || "Verifique os dados."));
        return;
      }
      alert("Salvo com sucesso.");
      form.reset();
      await listCallback();
      try { await carregarSeletoresGlobais(); } catch(e) {}
      try { await atualizarDashboardGeral(); } catch(e) {}
    } catch (error) {
      console.error(error);
    }
  });
}

async function carregarSeletoresGlobais() {
  try {
    const resEvRaw = await requisicaoAutenticada(`${API_URL}/eventos`);
    const resUsRaw = await requisicaoAutenticada(`${API_URL}/usuarios`);
    const eventos = resEvRaw.ok ? await resEvRaw.json() : [];
    const usuarios = resUsRaw.ok ? await resUsRaw.json() : [];
    
    const agora = new Date();
    const eventosFuturos = eventos.filter(e => new Date(e.data) >= agora);
    
    const idsSeletoresEventos = ["select-inscricao-evento", "select-voluntario-evento", "select-comentario-evento", "select-doacao-evento"];
    
    idsSeletoresEventos.forEach(id => {
      const sel = document.getElementById(id);
      if (sel && Array.isArray(eventos)) {
        const listaFiltrada = (id === "select-inscricao-evento") ? eventosFuturos : eventos;
        sel.innerHTML = listaFiltrada.map(e => `<option value="${e._id}">${e.titulo}</option>`).join("");
      }
    });

    const selInscricaoUser = document.getElementById("select-inscricao-usuario");
    if (selInscricaoUser && Array.isArray(usuarios)) selInscricaoUser.innerHTML = usuarios.filter(u => u.tipo !== "admin" && u.tipo !== "pastor").map(u => `<option value="${u._id}">${u.nome} (${u.tipo})</option>`).join("");

    const selVoluntarioUser = document.getElementById("select-voluntario-usuario");
    if (selVoluntarioUser && Array.isArray(usuarios)) selVoluntarioUser.innerHTML = usuarios.filter(u => u.tipo !== "admin" && u.tipo !== "pastor").map(u => `<option value="${u._id}">${u.nome} (${u.tipo})</option>`).join("");

    const selNotif = document.getElementById("select-notificacao-usuario");
    if (selNotif && Array.isArray(usuarios)) {
      let optionsHtml = `
        <option value="todos">📢 Disparar para Todos da Paróquia</option>
        <option value="membros">👥 Disparar apenas para Membros</option>
        <option value="lideres">💼 Disparar apenas para Líderes</option>
        <option value="pastores">⛪ Disparar apenas para o Clero / Pastores</option>
      `;
      usuarios.forEach(u => {
        optionsHtml += `<option value="${u._id}">${u.nome} (${u.tipo.toUpperCase()})</option>`;
      });
      selNotif.innerHTML = optionsHtml;
    }
  } catch (err) {
    console.error(err);
  }
}

async function carregarOpcoesFormEventos() {
  try {
    const resCatRaw = await requisicaoAutenticada(`${API_URL}/categorias`);
    const resLocRaw = await requisicaoAutenticada(`${API_URL}/locais`);
    const resCat = resCatRaw.ok ? await resCatRaw.json() : [];
    const resLoc = resLocRaw.ok ? await resLocRaw.json() : [];
    const selectCat = document.getElementById("select-evento-categoria");
    const selectLoc = document.getElementById("select-evento-local");
    if (selectCat && Array.isArray(resCat)) selectCat.innerHTML = resCat.map(c => `<option value="${c._id}">${c.nome}</option>`).join("");
    if (selectLoc && Array.isArray(resLoc)) selectLoc.innerHTML = resLoc.map(l => `<option value="${l._id}">${l.nome}</option>`).join("");
  } catch (err) {
    console.error(err);
  }
}

async function listarUsuarios() {
  const tbody = document.getElementById("usuarios-tbody");
  const contador = document.getElementById("usuarios-count");
  const rankReal = localStorage.getItem("user_rank") || "membro";
  const rankExibido = localStorage.getItem("simulated_rank") || rankReal;
  const idLogado = localStorage.getItem("user_id");

  if (rankExibido !== "admin" && rankExibido !== "pastor" && rankExibido !== "lider") {
    if (contador) contador.innerText = "0";
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-400">Restrito.</td></tr>`;
    return;
  }
  try {
    const resposta = await requisicaoAutenticada(`${API_URL}/usuarios`);
    const membros = await resposta.json();
    if (!Array.isArray(membros)) return;
    
    let membrosExibidos = membros;
    if (rankExibido === "pastor" || rankExibido === "lider") {
      membrosExibidos = membros.filter(u => u.tipo !== "admin");
    }

    if (contador) contador.innerText = membrosExibidos.length;
    if (tbody) {
      tbody.innerHTML = membrosExibidos.map((usuario) => {
        let podeDeletar = usuario.email !== "admin@igrejanova.com" && usuario._id !== idLogado;
        const fotoFinal = usuario.avatar || avatarPadrao;
        return `
            <tr class="hover:bg-slate-50">
              <td class="flex items-center gap-3 font-semibold text-slate-700">
                <img src="${fotoFinal}" class="w-7 h-7 rounded-full object-cover border border-slate-200">
                <span>${usuario.nome}</span>
              </td>
              <td>${usuario.email}</td>
              <td>${usuario.telefone || "—"}</td>
              <td><span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold uppercase text-[9px]">${usuario.tipo || "membro"}</span></td>
              <td class="text-center">
                ${podeDeletar ? `<button onclick="deletarUsuario('${usuario._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>` : `<span class="text-slate-300 text-[10px] font-bold">Ativo</span>`}
              </td>
            </tr>
          `;
      }).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (erro) {
    console.error(erro);
  }
}

async function listarEventos() {
  const tbody = document.getElementById("eventos-tbody");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/eventos`);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      const agora = new Date();
      
      const rankReal = localStorage.getItem("user_rank") || "membro";
      const rankExibido = localStorage.getItem("simulated_rank") || rankReal;

      tbody.innerHTML = dados.map(e => {
        const dataEvento = new Date(e.data);
        const jaPassou = dataEvento < agora; 

        const classeLinha = jaPassou ? "opacity-50 bg-slate-50/50" : "hover:bg-slate-50";
        
        const podeEditar = (rankExibido === "admin") || !jaPassou;
        
        return `
          <tr class="${classeLinha}">
            <td class="font-semibold text-slate-700">
              ${e.titulo} ${jaPassou ? '<span class="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full ml-2 font-bold uppercase">Encerrado</span>' : ''}
            </td>
            <td>${new Date(e.data).toLocaleString("pt-BR")}</td>
            <td>${e.capacidade}</td>
            <td class="text-center whitespace-nowrap">
              ${podeEditar ? `<button onclick="editarEvento('${e._id}')" class="text-indigo-600 hover:text-indigo-800 mr-2"><i data-lucide="pencil" class="w-4 h-4 inline-block"></i></button>` : ''}
              <button onclick="deletarEvento('${e._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
            </td>
          </tr>
        `;
      }).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarCategorias() {
  const tbody = document.getElementById("categorias-tbody");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/categorias`);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      tbody.innerHTML = dados.map(c => `
        <tr class="hover:bg-slate-50">
          <td class="font-semibold text-slate-700">${c.nome}</td>
          <td>${c.descricao || "—"}</td>
          <td class="text-center">
            <button onclick="deletarCategoria('${c._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarLocais() {
  const tbody = document.getElementById("locais-tbody");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/locais`);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      tbody.innerHTML = dados.map(l => `
        <tr class="hover:bg-slate-50">
          <td class="font-semibold text-slate-700">${l.nome}</td>
          <td>${l.capacidade || "0"}</td>
          <td>${l.endereco?.cidade || "—"} / ${l.endereco?.estado || "—"}</td>
          <td class="text-center whitespace-nowrap">
            <button onclick="editarLocal('${l._id}')" class="text-indigo-600 hover:text-indigo-800 mr-2"><i data-lucide="pencil" class="w-4 h-4 inline-block"></i></button>
            <button onclick="deletarLocal('${l._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarMinisterios() {
  const tbody = document.getElementById("ministerios-tbody");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/ministerios`);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      tbody.innerHTML = dados.map(m => `
        <tr class="hover:bg-slate-50">
          <td class="font-semibold text-slate-700">${m.nome}</td>
          <td>${m.descricao || "—"}</td>
          <td class="text-center">
            <button onclick="deletarMinisterio('${m._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarInscricoes() {
  const tbody = document.getElementById("inscricoes-tbody");
  const rankReal = localStorage.getItem("user_rank") || "membro";
  const rankExibido = localStorage.getItem("simulated_rank") || rankReal;
  
  try {
    let url = `${API_URL}/inscricoes`;
    if (rankExibido === "membro") {
      url = `${API_URL}/inscricoes/minhas`;
    }
    
    const res = await requisicaoAutenticada(url);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      tbody.innerHTML = dados.map(i => {
        const checked = i.checkIn?.realizado || false;
        const nomeUsuario = i.usuario?.nome || localStorage.getItem("user_name");
        const tituloEvento = i.evento?.titulo || "Evento Selecionado";
        return `
        <tr class="hover:bg-slate-50">
          <td class="font-semibold text-slate-700">${nomeUsuario}</td>
          <td>${tituloEvento}</td>
          <td class="text-center">
            <button onclick="alternarCheckIn('${i._id}', '${i.status}')" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${checked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
              ${checked ? '✓ Presente' : '○ Confirmar'}
            </button>
          </td>
          <td class="text-center">
            <button onclick="deletarInscricao('${i._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `}).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarVoluntarios() {
  const tbody = document.getElementById("voluntarios-tbody");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/voluntarios`);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      tbody.innerHTML = dados.map(v => `
        <tr class="hover:bg-slate-50">
          <td class="font-semibold text-slate-700">${v.usuario?.nome || "Voluntário"}</td>
          <td>${v.evento?.titulo || "Evento"}</td>
          <td class="font-medium text-slate-600">${v.funcao || "Serviço"}</td>
          <td class="text-center">
            <button onclick="deletarVoluntario('${v._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarComentarios() {
  const container = document.getElementById("comentarios-mural-container");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/comentarios`);
    const dados = await res.json();
    if (container && Array.isArray(dados)) {
      if (dados.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Nenhum testemunho publicado.</p>`;
        return;
      }
      container.innerHTML = dados.map(c => `
        <div class="layout-card-feedback-item p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-700">${c.usuario?.nome || "Participante"}</p>
              <p class="text-[10px] text-indigo-600 font-bold mt-0.5">${c.evento?.titulo || "Evento"}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-amber-500">★ ${c.avaliacao || 5}</span>
              <button onclick="deletarComentario('${c._id}')" class="text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
            </div>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">${c.mensagem}</p>
        </div>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarDoacoes() {
  const tbody = document.getElementById("doacoes-tbody");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/doacoes`);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      tbody.innerHTML = dados.map(d => `
        <tr class="hover:bg-slate-50">
          <td class="font-semibold text-slate-700">${d.descricao || "Oferta Geral"}</td>
          <td><span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${d.tipo === 'dinheiro' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}">${d.tipo}</span></td>
          <td class="font-mono font-bold text-slate-700">R$ ${(d.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="text-center">
            <button onclick="deletarDoacao('${d._id}')" class="text-red-500 hover:text-red-700"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function listarNotificacoes() {
  const container = document.getElementById("notificacoes-list-container");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/notificacoes`);
    if (!res.ok) return;
    const dados = await res.json();
    const idLogado = localStorage.getItem("user_id");
    
    if (container && Array.isArray(dados)) {
      const minhasNotif = dados.filter(n => n.usuario === idLogado || (n.usuario?._id === idLogado));
      
      const vistas = JSON.parse(localStorage.getItem("notificacoes_vistas") || "[]");
      const naoLidas = minhasNotif.filter(n => !vistas.includes(n._id));
      
      const contadorBadge = document.getElementById("badge-notificacao-contador");
      if (contadorBadge) {
        if (naoLidas.length > 0) {
          contadorBadge.innerText = naoLidas.length;
          contadorBadge.classList.remove("hidden");
        } else {
          contadorBadge.classList.add("hidden");
        }
      }
      
      if (minhasNotif.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Sua caixa de entrada está limpa.</p>`;
        return;
      }
      
      container.innerHTML = minhasNotif.map(n => {
        const isNew = !vistas.includes(n._id);
        return `
        <div class="p-4 flex items-start justify-between gap-4 bg-white hover:bg-slate-50 transition-colors relative">
          <div class="space-y-0.5 flex gap-3 items-start">
            ${isNew ? `<span class="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>` : `<span class="w-2 h-2 mt-1.5 flex-shrink-0"></span>`}
            <div>
              <p class="text-xs text-slate-700 font-medium">${n.mensagem}</p>
              <p class="text-[9px] text-slate-400 font-mono">${new Date(n.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          </div>
          <button onclick="deletarNotificacao('${n._id}')" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
      `}).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

async function marcarTodasNotificacoesComoLidas() {
  try {
    const res = await requisicaoAutenticada(`${API_URL}/notificacoes`);
    if (!res.ok) return;
    const dados = await res.json();
    const idLogado = localStorage.getItem("user_id");
    const minhasNotif = dados.filter(n => n.usuario === idLogado || (n.usuario?._id === idLogado));
    
    const vistas = JSON.parse(localStorage.getItem("notificacoes_vistas") || "[]");
    minhasNotif.forEach(n => {
      if (!vistas.includes(n._id)) {
        vistas.push(n._id);
      }
    });
    
    localStorage.setItem("notificacoes_vistas", JSON.stringify(vistas));
    await listarNotificacoes();
  } catch (err) {
    console.error(err);
  }
}

async function carregarMuralNoticias() {
  try {
    const rssUrl = "https://www.vaticannews.va/en.rss.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const resposta = await fetch(apiUrl);
    const dados = await resposta.json();
    const container = document.getElementById("news-feed-list");
    if (!container || !dados.items) return;
    container.innerHTML = dados.items.slice(0, 3).map((item) => {
      const textoLimpo = item.description.replace(/<[^>]*>/g, '').trim();
      const imagemUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || '';
      return `
        <div class="bg-white p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            ${imagemUrl ? `<img src="${imagemUrl}" class="w-full h-32 object-cover rounded-lg mb-2 shadow-sm" />` : ''}
            <h4 class="font-bold text-slate-800 text-xs line-clamp-2 mb-1">${item.title}</h4>
            <p class="text-[11px] text-slate-500 line-clamp-2 mb-3">${textoLimpo}</p>
          </div>
          <a href="${item.link}" target="_blank" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-auto">Ler mais →</a>
        </div>
      `;
    }).join("");
  } catch (erro) {
    console.error(erro);
  }
}

async function gerarRelatoriosAvancados() {
  const section = document.getElementById("sec-relatorios");
  if (!section) return;

  try {
    const resPart = await requisicaoAutenticada(`${API_URL}/relatorios/participantes`);
    const resSat = await requisicaoAutenticada(`${API_URL}/relatorios/satisfacao`);
    const resEng = await requisicaoAutenticada(`${API_URL}/relatorios/engajamento`);

    const participantes = resPart.ok ? await resPart.json() : [];
    const satisfacao = resSat.ok ? await resSat.json() : [];
    const engajamento = resEng.ok ? await resEng.json() : [];

    section.innerHTML = `
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        <div class="layout-card-mural !p-6 bg-white rounded-2xl border border-slate-200">
          <div class="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
            <i data-lucide="users" class="text-indigo-600 w-5 h-5"></i>
            <h3 class="font-display font-bold text-brand-blue text-base">Inscritos por Encontro Paroquial</h3>
          </div>
          <div class="space-y-4 max-h-64 overflow-y-auto pr-1">
            ${Array.isArray(participantes) && participantes.length > 0 ? participantes.map(p => `
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p class="text-xs font-bold text-slate-700">${p.titulo}</p>
                  <p class="text-[10px] text-slate-400 font-mono mt-0.5">${new Date(p.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <span class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">${p.totalInscritos} Fiéis</span>
              </div>
            `).join("") : `<p class="text-xs text-slate-400 py-4 text-center">Nenhum dado analítico gerado ainda.</p>`}
          </div>
        </div>

        <div class="layout-card-mural !p-6 bg-white rounded-2xl border border-slate-200">
          <div class="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
            <i data-lucide="star" class="text-amber-500 w-5 h-5"></i>
            <h3 class="font-display font-bold text-brand-blue text-base">Média de Satisfação por Categoria</h3>
          </div>
          <div class="space-y-4 max-h-64 overflow-y-auto pr-1">
            ${Array.isArray(satisfacao) && satisfacao.length > 0 ? satisfacao.map(s => `
              <div class="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex justify-between items-center">
                  <p class="text-xs font-bold text-slate-700">${s.categoria}</p>
                  <span class="text-xs font-bold text-amber-600 flex items-center gap-1">★ ${s.mediaNota}</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full">
                  <div class="bg-amber-400 h-1.5 rounded-full" style="width: ${(s.mediaNota / 5) * 100}%"></div>
                </div>
                <p class="text-[9px] text-slate-400 font-semibold">${s.totalAvaliacoes} avaliações computadas</p>
              </div>
            `).join("") : `<p class="text-xs text-slate-400 py-4 text-center">Nenhum testemunho avaliado ainda.</p>`}
          </div>
        </div>

        <div class="layout-card-mural xl:col-span-2 !p-6 bg-white rounded-2xl border border-slate-200">
          <div class="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
            <i data-lucide="message-square" class="text-emerald-600 w-5 h-5"></i>
            <h3 class="font-display font-bold text-brand-blue text-base">Eventos de Maior Engajamento Coletivo</h3>
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
            ${Array.isArray(engajamento) && engajamento.length > 0 ? engajamento.map(e => `
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p class="text-xs font-bold text-slate-700">${e.titulo}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">${new Date(e.data).toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="text-right">
                  <span class="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">${e.totalComentarios} Comentários</span>
                </div>
              </div>
            `).join("") : `<p class="text-xs text-slate-400 py-4 text-center">Nenhum comentário registrado nos eventos.</p>`}
          </div>
        </div>

      </div>
    `;
    if (typeof lucide !== "undefined") lucide.createIcons();
  } catch (err) {
    console.error(err);
    section.innerHTML = `<p class="text-xs text-red-500 py-4 text-center">Falha ao processar pipelines analíticos do banco.</p>`;
  }
}

(async () => {
  const token = obterToken();
  if (!token) {
    encerrarSessao();
    return;
  }

  if (typeof L !== "undefined") {
    inicializarMapaParoquial();
  } else {
    const lcss = document.createElement("link");
    lcss.rel = "stylesheet";
    lcss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(lcss);
    const ljs = document.createElement("script");
    ljs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    ljs.onload = () => { inicializarMapaParoquial(); };
    document.head.appendChild(ljs);
  }

  if (typeof lucide !== "undefined") lucide.createIcons();

  const rankReal = localStorage.getItem("user_rank") || "membro";
  const rankExibido = localStorage.getItem("simulated_rank") || rankReal;
  const secaoAtiva = localStorage.getItem("dashboard_secao_ativa") || "dashboard";
  
  const seletorRank = document.getElementById("select-teste-rank");
  if (seletorRank) seletorRank.value = rankExibido;
  
  atualizarMenuPorRank(rankExibido);

  configureGenericForm("form-usuario", "usuarios", listarUsuarios);
  configureGenericForm("form-categoria", "categorias", listarCategorias);
  configureGenericForm("form-ministerio", "ministerios", listarMinisterios);
  configureGenericForm("form-voluntario", "voluntarios", listarVoluntarios);
  configureGenericForm("form-comentario", "comentarios", listarComentarios);
  configureGenericForm("form-doacao", "doacoes", listarDoacoes);

  const formNotifSubmit = document.getElementById("form-notificacao");
  if (formNotifSubmit) {
    formNotifSubmit.addEventListener("submit", async (event) => {
      event.preventDefault();
      const targetUser = document.getElementById("select-notificacao-usuario").value;
      const msgText = formNotifSubmit.querySelector('[name="mensagem"]').value.trim();

      try {
        const resUsers = await requisicaoAutenticada(`${API_URL}/usuarios`);
        const listaUsuariosCompleta = await resUsers.json();
        let IDsDestinatarios = [];

        if (targetUser === "todos") {
          IDsDestinatarios = listaUsuariosCompleta.map(u => u._id);
        } else if (targetUser === "membros") {
          IDsDestinatarios = listaUsuariosCompleta.filter(u => u.tipo === "membro").map(u => u._id);
        } else if (targetUser === "lideres") {
          IDsDestinatarios = listaUsuariosCompleta.filter(u => u.tipo === "lider").map(u => u._id);
        } else if (targetUser === "pastores") {
          IDsDestinatarios = listaUsuariosCompleta.filter(u => u.tipo === "pastor").map(u => u._id);
        } else {
          IDsDestinatarios = [targetUser];
        }

        for (const currentID of IDsDestinatarios) {
          await requisicaoAutenticada(`${API_URL}/notificacoes`, {
            method: "POST",
            body: JSON.stringify({ usuario: currentID, mensagem: msgText })
          });
        }

        alert("Alertas transmitidos com sucesso!");
        formNotifSubmit.reset();
        await listarNotificacoes();
      } catch (err) {
        console.error(err);
      }
    });
  }

  const starContainer = document.getElementById("star-rating-container");
  const hiddenAvaliacao = document.getElementById("input-comentario-avaliacao");
  if (starContainer && hiddenAvaliacao) {
    const starButtons = starContainer.querySelectorAll("button");
    starButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const notaSelected = parseInt(button.getAttribute("data-star"));
        hiddenAvaliacao.value = notaSelected;
        starButtons.forEach(b => {
          const v = parseInt(b.getAttribute("data-star"));
          const ico = b.querySelector("svg, i");
          if (ico) ico.setAttribute("class", v <= notaSelected ? "w-5 h-5 fill-amber-400 text-amber-400" : "w-5 h-5 fill-transparent text-slate-300");
        });
      });
    });
  }

  const formPerfil = document.getElementById("form-perfil-atualizar");
  if (formPerfil) {
    formPerfil.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("input-perfil-nome").value.trim();
      const cpf = document.getElementById("input-perfil-cpf").value.trim();
      const tel = document.getElementById("input-perfil-telefone").value.trim();
      const nasc = document.getElementById("input-perfil-nascimento").value.trim();
      const gen = document.getElementById("input-perfil-genero").value;
      let foto = document.getElementById("input-perfil-foto").value.trim();
      
      const insta = document.getElementById("input-perfil-instagram")?.value.trim() || "";
      const face = document.getElementById("input-perfil-facebook")?.value.trim() || "";
      const yt = document.getElementById("input-perfil-youtube")?.value.trim() || "";

      let dataFormatada = nasc;
      if (nasc && nasc.includes("/")) {
        const partes = nasc.split("/");
        if (partes.length === 3) {
          dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
      }

      const fileInput = document.getElementById("input-perfil-arquivo-upload");
      if (fileInput && fileInput.files.length > 0) {
        foto = await converterArquivoParaBase64(fileInput.files[0]);
      }

      try {
        const userId = localStorage.getItem("user_id");
        const res = await requisicaoAutenticada(`${API_URL}/usuarios/${userId}`, {
          method: "PUT",
          body: JSON.stringify({ 
            nome, 
            telefone: tel, 
            cpf, 
            dataNascimento: dataFormatada, 
            genero: gen, 
            avatar: foto,
            instagram: insta,
            facebook: face,
            youtube: yt
          })
        });
        if (res.ok) {
          localStorage.setItem("user_name", nome);
          localStorage.setItem("user_phone", tel);
          localStorage.setItem("user_cpf", cpf);
          localStorage.setItem("user_nascimento", dataFormatada);
          localStorage.setItem("user_genero", gen);
          localStorage.setItem("user_avatar", foto);
          localStorage.setItem("user_insta", insta);
          localStorage.setItem("user_face", face);
          localStorage.setItem("user_yt", yt);
          alert("Perfil updated!");
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  const formInscricao = document.getElementById("form-inscricao");
  if (formInscricao) {
    formInscricao.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rankAtual = localStorage.getItem("simulated_rank") || "membro";
      const idLogado = localStorage.getItem("user_id");
      let idUsuarioAlvo = rankAtual === "membro" ? idLogado : document.getElementById("select-inscricao-usuario").value;

      try {
        const res = await requisicaoAutenticada(`${API_URL}/inscricoes`, {
          method: "POST",
          body: JSON.stringify({ evento: document.getElementById("select-inscricao-evento").value, usuario: idUsuarioAlvo })
        });
        if (res.ok) {
          alert("Inscrição efetuada com sucesso!");
          formInscricao.reset();
          await listarInscricoes();
        } else {
          const err = await res.json();
          alert(err.erro || "Falha ao inscrever.");
        }
      } catch (erro) {
        console.error(erro);
      }
    });
  }

  const inputCep = document.getElementById("input-local-cep");
  const formLocal = document.getElementById("form-local");
  const btnCancelarLocal = document.getElementById("btn-cancelar-local");
  const chkSN = document.getElementById("chk-local-sn");
  const inputNumero = document.getElementById("input-local-numero");

  if (chkSN && inputNumero) {
    chkSN.addEventListener("change", () => {
      if (chkSN.checked) {
        inputNumero.value = "S/N";
        inputNumero.setAttribute("readonly", true);
        inputNumero.style.backgroundColor = "#f1f5f9";
      } else {
        inputNumero.value = "";
        inputNumero.removeAttribute("readonly");
        inputNumero.style.backgroundColor = "transparent";
        inputNumero.focus();
      }
    });
  }

  if (btnCancelarLocal && formLocal) {
    btnCancelarLocal.addEventListener("click", () => {
      formLocal.reset();
      localEditandoId = null;
      document.getElementById("titulo-form-local").innerText = "Novo Local";
      formLocal.querySelector('button[type="submit"]').innerText = "Salvar Local";
      btnCancelarLocal.classList.add("hidden");
    });
  }

  if (inputCep && formLocal) {
    inputCep.addEventListener("input", async () => {
      const cep = inputCep.value.replace(/\D/g, "");
      if (cep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const dadosCep = await res.json();
          if (!dadosCep.erro) {
            formLocal.querySelector('[name="rua"]').value = dadosCep.logradouro || "";
            formLocal.querySelector('[name="bairro"]').value = dadosCep.bairro || "";
            formLocal.querySelector('[name="cidade"]').value = dadosCep.localidade || "";
            formLocal.querySelector('[name="estado"]').value = dadosCep.uf || "";
            
            const strBusca = `${dadosCep.logradouro || ''} ${dadosCep.localidade} ${dadosCep.uf}`;
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(strBusca)}`)
              .then(r => r.json())
              .then(d => { if (d && d.length > 0) inicializarMapaParoquial(parseFloat(d[0].lat), parseFloat(d[0].lon)); });
          }
        } catch (err) {
          console.error(err);
        }
      }
    });

    formLocal.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const formData = new FormData(formLocal);
      const dadosEstruturados = {
        nome: formData.get("nome"),
        capacidade: Number(formData.get("capacidade")),
        endereco: {
          cep: formData.get("cep"),
          rua: formData.get("rua"),
          numero: formData.get("numero"),
          bairro: formData.get("bairro"),
          cidade: formData.get("cidade"),
          estado: formData.get("estado")
         }
      };

      try {
        let url = localEditandoId ? `${API_URL}/locais/${localEditandoId}` : `${API_URL}/locais`;
        let metodo = localEditandoId ? "PUT" : "POST";
        const resposta = await requisicaoAutenticada(url, { method: metodo, body: JSON.stringify(dadosEstruturados) });
        if (resposta.ok) {
          alert("Local gravado com sucesso.");
          formLocal.reset();
          localEditandoId = null;
          document.getElementById("titulo-form-local").innerText = "Novo Local";
          btnCancelarLocal?.classList.add("hidden");
          await listarLocais();
          try { await carregarSeletoresGlobais(); } catch(e) {}
          try { await atualizarDashboardGeral(); } catch(e) {}
        }
      } catch (erro) {
        console.error(erro);
      }
    });
  }

  const formEvento = document.getElementById("form-evento");
  if (formEvento) {
    formEvento.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const formData = new FormData(formEvento);
      const dados = Object.fromEntries(formData.entries());

      const fileInp = document.getElementById("input-evento-imagem-upload");
      if (fileInp && fileInp.files.length > 0) {
        const base64Img = await converterArquivoParaBase64(fileInp.files[0]);
        dados.imagens = [base64Img];
      }

      try {
        let url = eventoEditandoId ? `${API_URL}/eventos/${eventoEditandoId}` : `${API_URL}/eventos`;
        let metodo = eventoEditandoId ? "PUT" : "POST";
        const resposta = await requisicaoAutenticada(url, { method: metodo, body: JSON.stringify(dados) });
        if (resposta.ok) {
          alert("Evento gravado com sucesso.");
          formEvento.reset();
          eventoEditandoId = null;
          formEvento.querySelector('button[type="submit"]').innerText = "Salvar Evento";
          await listarEventos();
          try { await carregarSeletoresGlobais(); } catch(e) {}
          try { await atualizarDashboardGeral(); } catch(e) {}
        }
      } catch (erro) {
        console.error(erro);
      }
    });
  }

  const btnSino = document.getElementById("btn-sino-notificacao");
  if (btnSino) {
    btnSino.addEventListener("click", async () => {
      irParaSecaoRapido("notificacoes");
      await marcarTodasNotificacoesComoLidas();
    });
  }

  try { await carregarSeletoresGlobais(); } catch(e) { console.error(e); }
  try { await carregarOpcoesFormEventos(); } catch(e) { console.error(e); }
  try { await atualizarDashboardGeral(); } catch(e) { console.error(e); }
  try { await listarUsuarios(); } catch(e) { console.error(e); }
  try { await listarEventos(); } catch(e) { console.error(e); }
  try { await listarCategorias(); } catch(e) { console.error(e); }
  try { await listarLocais(); } catch(e) { console.error(e); }
  try { await listarMinisterios(); } catch(e) { console.error(e); }
  try { await listarInscricoes(); } catch(e) { console.error(e); }
  try { await listarVoluntarios(); } catch(e) { console.error(e); }
  try { await listarComentarios(); } catch(e) { console.error(e); }
  try { await listarDoacoes(); } catch(e) { console.error(e); }
  try { await listarNotificacoes(); } catch(e) { console.error(e); }
  try { await carregarMuralNoticias(); } catch(e) { console.error(e); }

  const botaoAlvo = document.querySelector(`[data-section="${secaoAtiva}"]`);
  if (botaoAlvo && !botaoAlvo.classList.contains("hidden")) {
    botaoAlvo.click();
  } else {
    const botaoDashboard = document.querySelector('[data-section="dashboard"]');
    if (botaoDashboard) botaoDashboard.click();
  }

  const botaoSair = document.getElementById("btn-sair-sistema");
  if (botaoSair) botaoSair.addEventListener("click", encerrarSessao);

  const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
  const sidebarContainer = document.getElementById("sidebar-container");
  if (btnToggleSidebar && sidebarContainer) {
    btnToggleSidebar.addEventListener("click", () => {
      if (sidebarContainer.style.width === "0px" || sidebarContainer.classList.contains("w-0")) {
        sidebarContainer.style.width = "280px";
        sidebarContainer.classList.remove("w-0", "overflow-hidden");
      } else {
        sidebarContainer.style.width = "0px";
        sidebarContainer.classList.add("w-0", "overflow-hidden");
      }
    });
  }


})();