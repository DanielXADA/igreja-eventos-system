const API_URL = "http://localhost:3000/api";

function atualizarMenuPorRank(rank) {
  const botoesMenu = document.querySelectorAll(".nav-item");
  botoesMenu.forEach(btn => {
    const alvo = btn.getAttribute("data-section");
    btn.classList.remove("hidden");
    if (rank === "membro") {
      if (alvo !== "dashboard" && alvo !== "perfil" && alvo !== "comentarios") {
        btn.classList.add("hidden");
      }
    } else if (rank === "voluntario") {
      if (alvo !== "dashboard" && alvo !== "perfil" && alvo !== "voluntarios" && alvo !== "inscricoes") {
        btn.classList.add("hidden");
      }
    } else if (rank === "lider") {
      if (alvo === "usuarios" || alvo === "doacoes" || alvo === "relatorios") {
        btn.classList.add("hidden");
      }
    }
  });

  const name = localStorage.getItem("user_name") || "Administrador Principal";
  const email = localStorage.getItem("user_email") || "admin@igrejanova.com";

  if (document.getElementById("sidebar-user-name")) {
    document.getElementById("sidebar-user-name").innerText = name;
  }
  if (document.getElementById("sidebar-user-email")) {
    document.getElementById("sidebar-user-email").innerText = email;
  }
  if (document.getElementById("sidebar-user-rank")) {
    document.getElementById("sidebar-user-rank").innerText = rank.toUpperCase();
  }
  if (document.getElementById("profile-display-name")) {
    document.getElementById("profile-display-name").innerText = name;
  }
  if (document.getElementById("profile-display-email")) {
    document.getElementById("profile-display-email").innerText = email;
  }
  if (document.getElementById("profile-display-rank")) {
    document.getElementById("profile-display-rank").innerText = rank.toUpperCase();
  }
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll("main section").forEach(section => section.classList.add("hidden"));
    
    const nomeSecao = button.getAttribute("data-section");
    localStorage.setItem("dashboard_secao_ativa", nomeSecao);
    
    const sectionId = `sec-${nomeSecao}`;
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove("hidden");
      document.getElementById("page-title").innerText = button.innerText.trim();
    }
  });
});

function aplicarSimulacaoRank() {
  const rank = document.getElementById("select-teste-rank").value;
  localStorage.setItem("simulated_rank", rank);
  atualizarMenuPorRank(rank);
  localStorage.setItem("dashboard_secao_ativa", "dashboard");
  window.location.reload();
}

async function atualizarDashboardGeral() {
  try {
    const [resMembros, resEventos] = await Promise.all([
      fetch(`${API_URL}/usuarios`).then(r => r.json()).catch(() => []),
      fetch(`${API_URL}/eventos`).then(r => r.json()).catch(() => [])
    ]);
    document.getElementById("stat-membros").innerText = resMembros.length;
    document.getElementById("stat-eventos").innerText = resEventos.length;
    document.getElementById("stat-inscricoes").innerText = "0";
    document.getElementById("stat-voluntarios").innerText = "0";
  } catch (error) {
    console.error(error);
  }
}

const formUsuario = document.getElementById("form-usuario");
if (formUsuario) {
  formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formUsuario);
    const dados = Object.fromEntries(formData.entries());
    
    if (dados.funcao) {
      dados.tipo = dados.funcao;
      delete dados.funcao;
    }

    try {
      const resposta = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });
      
      if (resposta.ok) {
        alert("Usuário cadastrado com sucesso!");
        formUsuario.reset();
        await listarUsuarios();
      } else {
        const erroDados = await resposta.json();
        alert("Erro no banco de dados: " + (erroDados.erro || "Verifique se este e-mail já existe."));
      }
    } catch (err) {
      alert("Erro de conexão: Não foi possível alcançar o servidor backend.");
      console.error(err);
    }
  });
}

async function listarUsuarios() {
  try {
    const res = await fetch(`${API_URL}/usuarios`);
    const membros = await res.json();
    document.getElementById("usuarios-count").innerText = membros.length;
    const tbody = document.getElementById("usuarios-tbody");
    if (tbody) {
      tbody.innerHTML = membros.map(u => `
        <tr class="border-b border-gray-100">
          <td class="px-5 py-3 text-xs font-semibold text-slate-700">${u.nome}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${u.email}</td>
          <td class="px-5 py-3 text-xs text-slate-500">${u.telefone || '—'}</td>
          <td class="px-5 py-3 text-xs"><span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium uppercase text-[9px]">${u.tipo || 'membro'}</span></td>
        </tr>
      `).join("");
    }
    await atualizarDashboardGeral();
  } catch (err) {
    console.error(err);
  }
}

async function carregarMuralNoticias() {
  try {
    const resposta = await fetch(`${API_URL}/noticias`);
    const noticias = await resposta.json();
    const container = document.getElementById("news-feed-list");
    if (!container) return;
    container.innerHTML = "";
    if (noticias.length === 0) {
      container.innerHTML = `<p class="col-span-full text-xs text-slate-400 text-center py-4">Nenhum aviso no banco local.</p>`;
      return;
    }
    noticias.slice(0, 3).forEach(item => {
      container.innerHTML += `
        <div class="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
          <div>
            <h4 class="font-semibold text-slate-800 text-sm mb-2">${item.titulo}</h4>
            <p class="text-xs text-slate-500 line-clamp-2">${item.conteudo}</p>
          </div>
        </div>
      `;
    });
  } catch (erro) {
    console.error(erro);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") { lucide.createIcons(); }
  const savedRank = localStorage.getItem("simulated_rank") || "admin";
  const secaoAtiva = localStorage.getItem("dashboard_secao_ativa") || "dashboard";
  
  const seletorRank = document.getElementById("select-teste-rank");
  if (seletorRank) { seletorRank.value = savedRank; }
  
  atualizarMenuPorRank(savedRank);
  atualizarDashboardGeral();
  listarUsuarios();
  carregarMuralNoticias();
  
  const botaoAlvo = document.querySelector(`[data-section="${secaoAtiva}"]`);
  if (botaoAlvo) { botaoAlvo.click(); }

  const botaoSair = document.getElementById("btn-sair-sistema");
  if (botaoSair) {
    botaoSair.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
});