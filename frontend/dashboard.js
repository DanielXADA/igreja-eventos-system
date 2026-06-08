const API_URL = "http://localhost:3000/api";
let eventoEditandoId = null;
let localEditandoId = null;

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

function atualizarMenuPorRank(rank) {
  const botoesMenu = document.querySelectorAll(".nav-item");
  botoesMenu.forEach((btn) => {
    const alvo = btn.getAttribute("data-section");
    btn.classList.remove("hidden");
    if (rank === "membro") {
      if (alvo !== "dashboard" && alvo !== "perfil" && alvo !== "comentarios" && alvo !== "doacoes") {
        btn.classList.add("hidden");
      }
    } else if (rank === "voluntario") {
      if (alvo !== "dashboard" && alvo !== "perfil" && alvo !== "voluntarios" && alvo !== "inscricoes") {
        btn.classList.add("hidden");
      }
    } else if (rank === "lider") {
      if (alvo === "usuarios" || alvo === "doacoes" || alvo === "relatorios" || alvo === "categorias" || alvo === "locais") {
        btn.classList.add("hidden");
      }
    }

    if (alvo === "perfil") {
      const icone = btn.querySelector("svg, i");
      const iconeHtml = icone ? icone.outerHTML : '<i data-lucide="user-check" class="nav-icon w-4 h-4 text-slate-500 flex-shrink-0"></i>';
      if (rank === "admin") {
        btn.innerHTML = `${iconeHtml} Meu Perfil / Simulador`;
      } else {
        btn.innerHTML = `${iconeHtml} Meu Perfil`;
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

  const btnCat = document.getElementById("btn-add-categoria-rapido");
  const btnLoc = document.getElementById("btn-add-local-rapido");
  if (btnCat && btnLoc) {
    if (rank === "admin" || rank === "pastor") {
      btnCat.classList.remove("hidden");
      btnLoc.classList.remove("hidden");
    } else {
      btnCat.classList.add("hidden");
      btnLoc.classList.add("hidden");
    }
  }

  const containerFormInsc = document.getElementById("container-form-inscricao");
  const containerTblInsc = document.getElementById("container-tbl-inscricao");
  const boxSelectInscUser = document.getElementById("box-select-inscricao-usuario");
  if (rank === "membro") {
    if (boxSelectInscUser) boxSelectInscUser.classList.add("hidden");
    if (containerTblInsc) containerTblInsc.classList.add("hidden");
    if (containerFormInsc) {
      containerFormInsc.classList.remove("xl:col-span-1");
      containerFormInsc.classList.add("col-span-full", "max-w-xl", "mx-auto");
    }
  } else {
    if (boxSelectInscUser) boxSelectInscUser.classList.remove("hidden");
    if (containerTblInsc) containerTblInsc.classList.remove("hidden");
    if (containerFormInsc) {
      containerFormInsc.classList.remove("col-span-full", "max-w-xl", "mx-auto");
    }
  }

  const viewDoacaoAdmin = document.getElementById("view-financeiro-admin");
  const viewDoacaoMembro = document.getElementById("view-financeiro-membro");
  if (viewDoacaoAdmin && viewDoacaoMembro) {
    if (rank === "admin" || rank === "pastor") {
      viewDoacaoAdmin.classList.remove("hidden");
      viewDoacaoMembro.classList.add("hidden");
    } else {
      viewDoacaoAdmin.classList.add("hidden");
      viewDoacaoMembro.classList.remove("hidden");
    }
  }

  const containerEnvioNotif = document.getElementById("container-envio-notificacao");
  const containerCaixaNotif = document.getElementById("container-caixa-notificacao");
  if (containerEnvioNotif && containerCaixaNotif) {
    if (rank === "admin" || rank === "pastor") {
      containerEnvioNotif.classList.remove("hidden");
      containerCaixaNotif.classList.remove("xl:col-span-3");
      containerCaixaNotif.classList.add("xl:col-span-2");
    } else {
      containerEnvioNotif.classList.add("hidden");
      containerCaixaNotif.classList.remove("xl:col-span-2");
      containerCaixaNotif.classList.add("xl:col-span-3");
    }
  }

  const nome = localStorage.getItem("user_name") || "Usuário";
  const email = localStorage.getItem("user_email") || "";
  const avatarPadrao = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
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

  const fields = {
    "input-perfil-nome": nome,
    "input-perfil-telefone": localStorage.getItem("user_phone") || "",
    "input-perfil-foto": localStorage.getItem("user_avatar") || "",
    "input-perfil-instagram": localStorage.getItem("user_insta") || "",
    "input-perfil-facebook": localStorage.getItem("user_face") || "",
    "input-perfil-youtube": localStorage.getItem("user_yt") || ""
  };
  Object.entries(fields).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el) el.value = valor;
  });
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
    if (nomeSecao === "eventos") {
      await carregarOpcoesFormEventos();
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

    if (rankExibido === "admin" || rankExibido === "pastor") {
      const respostaUsuarios = await requisicaoAutenticada(`${API_URL}/usuarios`);
      if (respostaUsuarios.ok) {
        const todosMembros = await respostaUsuarios.json();
        if (rankExibido === "admin") {
          totalMembrosExibir = todosMembros.length;
        } else {
          totalMembrosExibir = todosMembros.filter(u => u.tipo === "membro" || u.tipo === "lider" || u.tipo === "pastor").length;
        }
      }
    } else if (rankExibido === "lider") {
      totalMembrosExibir = "2";
    } else if (rankExibido === "voluntario") {
      totalMembrosExibir = "1";
    } else {
      totalMembrosExibir = "1";
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
      if (listaComentarios.length > 0) {
        const itensMarquee = [...listaComentarios, ...listaComentarios].map(c => `
          <span class="inline-block bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm font-medium">
            <span class="text-amber-500 font-bold">★ ${c.avaliacao || 5}</span> 
            "${c.mensagem}" 
            <span class="text-slate-400 font-normal">— ${c.usuario?.nome || 'Participante'}</span>
          </span>
        `).join("");
        marqueeTestemunhos.innerHTML = itensMarquee;
      } else {
        marqueeTestemunhos.innerHTML = `<span class="inline-block bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">Nenhum feedback publicado no mural paroquial ainda.</span>`;
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
            <span class="text-2xl font-bold text-slate-800 font-display">R$ ${totalArrecadado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span class="text-xs font-semibold text-slate-400">Meta R$ 15.000</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div class="bg-emerald-500 h-2.5 progress-animated rounded-full" style="width: ${porcentagemMeta}%"></div>
          </div>
          <p class="text-[11px] text-emerald-600 font-medium">${porcentagemMeta}% da meta paroquial alcançada</p>
        </div>
      `;
    }

    const containerRecentes = document.getElementById("recent-events-list");
    if (containerRecentes && Array.isArray(eventos)) {
      containerRecentes.innerHTML = eventos.slice(0, 3).map(ev => `
        <div class="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
          <div class="min-w-0 flex-1 pr-3">
            <p class="text-xs font-semibold text-slate-700 truncate">${ev.titulo}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">${new Date(ev.data).toLocaleDateString('pt-BR')}</p>
          </div>
          <span class="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium uppercase tracking-wide">${ev.status || 'Confirmado'}</span>
        </div>
      `).join("");
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
    try {
      const response = await requisicaoAutenticada(`${API_URL}/${resourceUrl}`, {
        method: "POST",
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      if (!response.ok) {
        alert("Erro no banco de dados: " + (responseData.erro || "Verifique as informações."));
        return;
      }
      alert("Cadastro realizado com sucesso.");
      form.reset();
      await listCallback();
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    }
  });
}

async function carregarSeletoresGlobais() {
  try {
    const resEvRaw = await requisicaoAutenticada(`${API_URL}/eventos`);
    const resUsRaw = await requisicaoAutenticada(`${API_URL}/usuarios`);
    const eventos = resEvRaw.ok ? await resEvRaw.json() : [];
    const usuarios = resUsRaw.ok ? await resUsRaw.json() : [];

    const idsSeletoresEventos = [
      "select-inscricao-evento",
      "select-voluntario-evento",
      "select-comentario-evento",
      "select-doacao-evento"
    ];
    idsSeletoresEventos.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) {
        sel.innerHTML = eventos.map(e => `<option value="${e._id}">${e.titulo}</option>`).join("");
      }
    });

    const idsSeletoresUsuarios = [
      "select-inscricao-usuario",
      "select-voluntario-usuario",
      "select-notificacao-usuario"
    ];
    idsSeletoresUsuarios.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) {
        sel.innerHTML = usuarios.map(u => `<option value="${u._id}">${u.nome} (${u.tipo})</option>`).join("");
      }
    });
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
    if (selectCat) selectCat.innerHTML = resCat.map(c => `<option value="${c._id}">${c.nome}</option>`).join("");
    if (selectLoc) selectLoc.innerHTML = resLoc.map(l => `<option value="${l._id}">${l.nome}</option>`).join("");
  } catch (err) {
    console.error(err);
  }
}

async function listarUsuarios() {
  const tbody = document.getElementById("usuarios-tbody");
  const contador = document.getElementById("usuarios-count");
  const rankReal = localStorage.getItem("user_rank") || "membro";
  const idLogado = localStorage.getItem("user_id");

  if (rankReal !== "admin" && rankReal !== "pastor") {
    if (contador) contador.innerText = "0";
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="px-5 py-4 text-xs text-center text-slate-400">Acesso permitido somente para administradores ou clero.</td></tr>`;
    return;
  }
  try {
    const resposta = await requisicaoAutenticada(`${API_URL}/usuarios`);
    const membros = await resposta.json();
    let membrosExibidos = rankReal === "pastor" ? membros.filter((u) => u.tipo === "membro" || u.tipo === "lider") : membros;

    if (contador) contador.innerText = membrosExibidos.length;
    if (tbody) {
      tbody.innerHTML = membrosExibidos.map((usuario) => {
        let podeDeletar = false;
        
        if (rankReal === "admin") {
          podeDeletar = usuario.email !== "admin@igrejanova.com" && usuario._id !== idLogado;
        } else if (rankReal === "pastor") {
          podeDeletar = (usuario.tipo === "membro" || usuario.tipo === "lider") && usuario._id !== idLogado;
        }

        return `
            <tr class="border-b border-gray-100 hover:bg-gray-50/50">
              <td class="px-5 py-3 text-xs font-semibold text-slate-700">${usuario.nome}</td>
              <td class="px-5 py-3 text-xs text-slate-500">${usuario.email}</td>
              <td class="px-5 py-3 text-xs text-slate-500">${usuario.telefone || "—"}</td>
              <td class="px-5 py-3 text-xs"><span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium uppercase text-[9px]">${usuario.tipo || "membro"}</span></td>
              <td class="px-5 py-3 text-center text-xs">
                ${podeDeletar ? `
                  <button onclick="deletarUsuario('${usuario._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4 inline-block"></i>
                  </button>
                ` : `
                  <span class="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Protegido</span>
                `}
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
      tbody.innerHTML = dados.map(e => `
        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${e.titulo}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${new Date(e.data).toLocaleString("pt-BR")}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${e.capacidade}</td>
          <td class="px-5 py-3 text-center text-xs whitespace-nowrap">
            <button onclick="editarEvento('${e._id}')" class="text-indigo-600 hover:text-indigo-800 p-1 rounded transition-colors mr-1.5"><i data-lucide="pencil" class="w-4 h-4 inline-block"></i></button>
            <button onclick="deletarEvento('${e._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
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
        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${c.nome}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${c.descricao || "—"}</td>
          <td class="px-5 py-3 text-center text-xs">
            <button onclick="deletarCategoria('${c._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
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
        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${l.nome}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${l.capacidade || "0"}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${l.endereco?.cidade || "—"} / ${l.endereco?.estado || "—"}</td>
          <td class="px-5 py-3 text-center text-xs whitespace-nowrap">
            <button onclick="editarLocal('${l._id}')" class="text-indigo-600 hover:text-indigo-800 p-1 rounded transition-colors mr-1.5"><i data-lucide="pencil" class="w-4 h-4 inline-block"></i></button>
            <button onclick="deletarLocal('${l._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
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
        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${m.nome}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${m.descricao || "—"}</td>
          <td class="px-5 py-3 text-center text-xs">
            <button onclick="deletarMinisterio('${m._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
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
  try {
    const res = await requisicaoAutenticada(`${API_URL}/inscricoes`);
    const dados = await res.json();
    if (tbody && Array.isArray(dados)) {
      tbody.innerHTML = dados.map(i => {
        const checkInRealizado = i.checkIn?.realizado || false;
        return `
        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${i.usuario?.nome || "Membro"}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${i.evento?.titulo || "Evento"}</td>
          <td class="px-5 py-3 text-center text-xs">
            <button onclick="alternarCheckIn('${i._id}', '${i.status}')" class="px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${checkInRealizado ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}">
              ${checkInRealizado ? '✓ Presente' : '○ Confirmar'}
            </button>
          </td>
          <td class="px-5 py-3 text-center text-xs">
            <button onclick="deletarInscricao('${i._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `}).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
    await atualizarDashboardGeral();
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
        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${v.usuario?.nome || "Voluntário"}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${v.evento?.titulo || "Evento"}</td>
          <td class="px-5 py-3 text-xs text-slate-500 font-medium">${v.funcao || "Serviço"}</td>
          <td class="px-5 py-3 text-center text-xs">
            <button onclick="deletarVoluntario('${v._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
    await atualizarDashboardGeral();
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
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">Nenhum feedback publicado ainda.</p>`;
        return;
      }
      container.innerHTML = dados.map(c => {
        const nota = c.avaliacao || 5;
        const estrelasHtml = "★".repeat(nota) + "☆".repeat(5 - nota);

        return `
        <div class="p-4 rounded-xl border border-gray-100 bg-gray-50/40 relative space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-slate-700">${c.usuario?.nome || "Participante"}</p>
              <p class="text-[10px] text-indigo-500 font-medium mt-0.5">${c.evento?.titulo || "Evento"}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-bold text-amber-400 tracking-wider">${estrelasHtml}</span>
              <button onclick="deletarComentario('${c._id}')" class="text-slate-300 hover:text-red-500 transition-colors p-0.5"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
            </div>
          </div>
          <p class="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-gray-100/60 leading-relaxed">${c.mensagem}</p>
        </div>
      `;
      }).join("");
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
        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${d.descricao || (d.evento?.titulo ? `Evento: ${d.evento.titulo}` : "Oferta Geral")}</td>
          <td class="px-5 py-3 text-xs"><span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${d.tipo === 'dinheiro' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}">${d.tipo}</span></td>
          <td class="px-5 py-3 text-xs font-mono font-bold text-slate-700">R$ ${(d.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="px-5 py-3 text-center text-xs">
            <button onclick="deletarDoacao('${d._id}')" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4 inline-block"></i></button>
          </td>
        </tr>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
    await atualizarDashboardGeral();
  } catch (err) {
    console.error(err);
  }
}

async function listarNotificacoes() {
  const container = document.getElementById("notificacoes-list-container");
  try {
    const res = await requisicaoAutenticada(`${API_URL}/noticias`);
    const dados = await res.json();
    const idLogado = localStorage.getItem("user_id");
    if (container && Array.isArray(dados)) {
      const minhasNotif = dados.filter(n => n.usuario === idLogado || (n.usuario?._id === idLogado));
      
      const contadorBadge = document.getElementById("badge-notificacao-contador");
      if (contadorBadge) {
        if (minhasNotif.length > 0) {
          contadorBadge.innerText = minhasNotif.length;
          contadorBadge.classList.remove("hidden");
        } else {
          contadorBadge.classList.add("hidden");
        }
      }

      if (minhasNotif.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-8">Sua caixa de entrada está limpa.</p>`;
        return;
      }
      container.innerHTML = minhasNotif.map(n => `
        <div class="p-4 flex items-start justify-between gap-4 bg-white hover:bg-gray-50/40 transition-colors">
          <div class="space-y-1">
            <p class="text-xs text-slate-700 font-medium leading-relaxed">${n.mensagem}</p>
            <p class="text-[9px] text-slate-400 font-mono">${new Date(n.data || n.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <button onclick="deletarNotificacao('${n._id}')" class="text-slate-300 hover:text-red-500 p-1 transition-colors"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </div>
      `).join("");
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
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
    if (!container) return;
    container.innerHTML = "";
    
    if (!dados.items || dados.items.length === 0) {
      container.innerHTML = `<p class="col-span-full text-xs text-slate-400 text-center py-4">Nenhum aviso no feed mundial disponível.</p>`;
      return;
    }
    
    dados.items.slice(0, 3).forEach((item) => {
      const textoLimpo = item.description.replace(/<[^>]*>/g, '').trim();
      const imagemUrl = item.thumbnail || (item.enclosure && item.enclosure.link) || '';
      
      container.innerHTML += `
        <div class="bg-white p-5 rounded-xl border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            ${imagemUrl ? `<img src="${imagemUrl}" alt="Notícia" class="w-full h-40 object-cover rounded-lg mb-3 shadow-sm" />` : ''}
            <span class="inline-block text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mb-2 uppercase tracking-wider">Mundial</span>
            <h4 class="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">${item.title}</h4>
            <p class="text-xs text-slate-500 line-clamp-2 mb-4">${textoLimpo}</p>
          </div>
          <a href="${item.link}" target="_blank" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-auto">
            Ler notícia completa →
          </a>
        </div>
      `;
    });
  } catch (erro) {
    console.error("Erro ao processar feed de notícias:", erro);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = obterToken();
  if (!token) {
    encerrarSessao();
    return;
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
  
  const starContainer = document.getElementById("star-rating-container");
  const hiddenAvaliacao = document.getElementById("input-comentario-avaliacao");
  if (starContainer && hiddenAvaliacao) {
    const starButtons = starContainer.querySelectorAll("button");
    
    function atualizarEstrelasVisuais(nota) {
      starButtons.forEach((btn) => {
        const valorEstrela = parseInt(btn.getAttribute("data-star"));
        const icone = btn.querySelector("svg, i");
        if (icone) {
          if (valorEstrela <= nota) {
            icone.setAttribute("class", "w-6 h-6 fill-amber-400 text-amber-400");
          } else {
            icone.setAttribute("class", "w-6 h-6 fill-transparent text-slate-300");
          }
        }
      });
    }

    starButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const notaSelected = parseInt(button.getAttribute("data-star"));
        hiddenAvaliacao.value = notaSelected;
        atualizarEstrelasVisuais(notaSelected);
      });
    });

    atualizarEstrelasVisuais(5);
  }

  const formPerfil = document.getElementById("form-perfil-atualizar");
  if (formPerfil) {
    formPerfil.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("input-perfil-nome").value.trim();
      const tel = document.getElementById("input-perfil-telefone").value.trim();
      const foto = document.getElementById("input-perfil-foto").value.trim();
      const insta = document.getElementById("input-perfil-instagram").value.trim();
      const face = document.getElementById("input-perfil-facebook").value.trim();
      const yt = document.getElementById("input-perfil-youtube").value.trim();
      
      localStorage.setItem("user_name", nome);
      localStorage.setItem("user_phone", tel);
      if (foto) localStorage.setItem("user_avatar", foto);
      localStorage.setItem("user_insta", insta);
      localStorage.setItem("user_face", face);
      localStorage.setItem("user_yt", yt);
      
      alert("Perfil paroquial atualizado com sucesso!");
      window.location.reload();
    });
  }

  configureGenericForm("form-doacao", "doacoes", listarDoacoes);
  configureGenericForm("form-notificacao", "notificacoes", listarNotificacoes);

  const formInscricao = document.getElementById("form-inscricao");
  if (formInscricao) {
    formInscricao.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rankAtual = localStorage.getItem("simulated_rank") || "membro";
      const idLogado = localStorage.getItem("user_id");
      
      let idUsuarioAlvo = document.getElementById("select-inscricao-usuario").value;
      if (rankAtual === "membro") {
        idUsuarioAlvo = idLogado;
      }

      const dados = {
        evento: document.getElementById("select-inscricao-evento").value,
        usuario: idUsuarioAlvo
      };

      try {
        const res = await requisicaoAutenticada(`${API_URL}/inscricoes`, {
          method: "POST",
          body: JSON.stringify(dados)
        });
        if (res.ok) {
          alert("Inscrição efetuada com sucesso!");
          formInscricao.reset();
          await listarInscricoes();
        } else {
          const err = await res.json();
          alert(err.erro || "Falha ao registrar inscrição.");
        }
      } catch (erro) {
        console.error(erro);
      }
    });
  }

  const inputCep = document.getElementById("input-local-cep");
  const formLocal = document.getElementById("form-local");
  const btnCancelarLocal = document.getElementById("btn-cancelar-local");

  if (btnCancelarLocal && formLocal) {
    btnCancelarLocal.addEventListener("click", () => {
      formLocal.reset();
      localEditandoId = null;
      document.getElementById("titulo-form-local").innerText = "Novo Local";
      formLocal.querySelector('button[type="submit"]').innerText = "Salvar Local";
      btnCancelarLocal.classList.add("hidden");
      if (chkSN) chkSN.checked = false;
      if (inputNumero) inputNumero.removeAttribute("readonly");
    });
  }

  if (inputCep && formLocal) {
    inputCep.addEventListener("input", async () => {
      const cep = inputCep.value.replace(/\D/g, "");
      if (cep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const dadosCep = await res.json();
          if (dadosCep.erro) {
            alert("CEP não encontrado.");
            return;
          }
          formLocal.querySelector('[name="rua"]').value = dadosCep.logradouro || "";
          formLocal.querySelector('[name="bairro"]').value = dadosCep.bairro || "";
          formLocal.querySelector('[name="cidade"]').value = dadosCep.localidade || "";
          formLocal.querySelector('[name="estado"]').value = dadosCep.uf || "";
          formLocal.querySelector('[name="numero"]').focus();
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
        let url = `${API_URL}/locais`;
        let metodo = "POST";
        if (localEditandoId) {
          url = `${API_URL}/locais/${localEditandoId}`;
          metodo = "PUT";
        }
        const resposta = await requisicaoAutenticada(url, {
          method: metodo,
          body: JSON.stringify(dadosEstruturados)
        });
        if (!resposta.ok) {
          const err = await resposta.json();
          alert("Erro operacional: " + (err.erro || "Verifique os dados."));
          return;
        }
        alert(localEditandoId ? "Local atualizado com sucesso." : "Local cadastrado com sucesso.");
        formLocal.reset();
        localEditandoId = null;
        document.getElementById("titulo-form-local").innerText = "Novo Local";
        formLocal.querySelector('button[type="submit"]').innerText = "Salvar Local";
        btnCancelarLocal?.classList.add("hidden");
        await listarLocais();
      } catch (erro) {
        console.error(erro);
      }
    });

    const chkSN = document.getElementById("chk-local-sn");
    const inputNumero = document.getElementById("input-local-numero");
      if (chkSN && inputNumero) {
        chkSN.addEventListener("change", () => {
          if (chkSN.checked) {
            inputNumero.value = "S/N";
          inputNumero.setAttribute("readonly", true);
          inputNumero.className = "form-input w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-slate-400 font-bold";
        } else {
          inputNumero.value = "";
         inputNumero.removeAttribute("readonly");
         inputNumero.className = "form-input w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white text-slate-700";
         inputNumero.focus();
        }
      });
    }
  }

  const formEvento = document.getElementById("form-evento");
  if (formEvento) {
    formEvento.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const formData = new FormData(formEvento);
      const dados = Object.fromEntries(formData.entries());
      try {
        let url = `${API_URL}/eventos`;
        let metodo = "POST";
        if (eventoEditandoId) {
          url = `${API_URL}/eventos/${eventoEditandoId}`;
          metodo = "PUT";
        }
        const resposta = await requisicaoAutenticada(url, {
          method: metodo,
          body: JSON.stringify(dados)
        });
        const respostaDados = await resposta.json();
        if (!resposta.ok) {
          alert("Erro operacional: " + (respostaDados.erro || "Verifique os dados."));
          return;
        }
        alert(eventoEditandoId ? "Evento atualizado com sucesso." : "Evento cadastrado com sucesso.");
        formEvento.reset();
        eventoEditandoId = null;
        formEvento.querySelector('button[type="submit"]').innerText = "Cadastrar Evento";
        await listarEventos();
      } catch (erro) {
        console.error(erro);
      }
    });
  }

  await carregarSeletoresGlobais();
  await carregarOpcoesFormEventos();
  await atualizarDashboardGeral();
  await listarUsuarios();
  await listarEventos();
  await listarCategorias();
  await listarLocais();
  await listarMinisterios();
  await listarInscricoes();
  await listarVoluntarios();
  await listarComentarios();
  await listarDoacoes();
  await listarNotificacoes();
  await carregarMuralNoticias();

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
      if (sidebarContainer.classList.contains("w-64")) {
        sidebarContainer.classList.remove("w-64");
        sidebarContainer.classList.add("w-0", "overflow-hidden");
      } else {
        sidebarContainer.classList.remove("w-0", "overflow-hidden");
        sidebarContainer.classList.add("w-64");
      }
    });
  }
});