const API_URL = "http://localhost:3000/api";

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
      ...obterCabecalhosAutenticados(
        opcoes.body !== undefined
      ),
      ...(opcoes.headers || {})
    }
  });

  if (resposta.status === 401) {
    encerrarSessao();
    throw new Error("Sessão inválida ou expirada.");
  }

  return resposta;
}

function atualizarMenuPorRank(rank) {
  const botoesMenu = document.querySelectorAll(".nav-item");

  botoesMenu.forEach((btn) => {
    const alvo = btn.getAttribute("data-section");

    btn.classList.remove("hidden");

    if (rank === "membro") {
      if (
        alvo !== "dashboard" &&
        alvo !== "perfil" &&
        alvo !== "comentarios"
      ) {
        btn.classList.add("hidden");
      }
    } else if (rank === "voluntario") {
      if (
        alvo !== "dashboard" &&
        alvo !== "perfil" &&
        alvo !== "voluntarios" &&
        alvo !== "inscricoes"
      ) {
        btn.classList.add("hidden");
      }
    } else if (rank === "lider") {
      if (
        alvo === "usuarios" ||
        alvo === "doacoes" ||
        alvo === "relatorios"
      ) {
        btn.classList.add("hidden");
      }
    }
  });

  const nome =
    localStorage.getItem("user_name") || "Usuário";

  const email =
    localStorage.getItem("user_email") || "";

  const elementos = {
    "sidebar-user-name": nome,
    "sidebar-user-email": email,
    "sidebar-user-rank": rank.toUpperCase(),
    "profile-display-name": nome,
    "profile-display-email": email,
    "profile-display-rank": rank.toUpperCase()
  };

  Object.entries(elementos).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.innerText = valor;
    }
  });
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((botao) => {
      botao.classList.remove("active");
    });

    button.classList.add("active");

    document.querySelectorAll("main section").forEach((section) => {
      section.classList.add("hidden");
    });

    const nomeSecao = button.getAttribute("data-section");

    localStorage.setItem(
      "dashboard_secao_ativa",
      nomeSecao
    );

    const targetSection = document.getElementById(
      `sec-${nomeSecao}`
    );

    if (targetSection) {
      targetSection.classList.remove("hidden");

      const titulo = document.getElementById("page-title");

      if (titulo) {
        titulo.innerText = button.innerText.trim();
      }
    }
  });
});

function aplicarSimulacaoRank() {
  const seletor = document.getElementById("select-teste-rank");

  if (!seletor) {
    return;
  }

  const rank = seletor.value;

  localStorage.setItem("simulated_rank", rank);
  atualizarMenuPorRank(rank);

  localStorage.setItem(
    "dashboard_secao_ativa",
    "dashboard"
  );

  window.location.reload();
}

async function atualizarDashboardGeral() {
  try {
    const rankReal =
      localStorage.getItem("user_rank") || "membro";

    let membros = [];

    if (rankReal === "admin") {
      const respostaUsuarios = await requisicaoAutenticada(
        `${API_URL}/usuarios`
      );

      if (respostaUsuarios.ok) {
        membros = await respostaUsuarios.json();
      }
    }

    const respostaEventos = await fetch(
      `${API_URL}/eventos`
    );

    const eventos = respostaEventos.ok
      ? await respostaEventos.json()
      : [];

    const statMembros = document.getElementById("stat-membros");
    const statEventos = document.getElementById("stat-eventos");
    const statInscricoes = document.getElementById(
      "stat-inscricoes"
    );
    const statVoluntarios = document.getElementById(
      "stat-voluntarios"
    );

    if (statMembros) {
      statMembros.innerText =
        rankReal === "admin" ? membros.length : "—";
    }

    if (statEventos) {
      statEventos.innerText = Array.isArray(eventos)
        ? eventos.length
        : 0;
    }

    if (statInscricoes) {
      statInscricoes.innerText = "0";
    }

    if (statVoluntarios) {
      statVoluntarios.innerText = "0";
    }
  } catch (erro) {
    console.error(erro);
  }
}

const formUsuario = document.getElementById("form-usuario");

if (formUsuario) {
  formUsuario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const formData = new FormData(formUsuario);
    const dados = Object.fromEntries(formData.entries());

    if (dados.funcao) {
      dados.tipo = dados.funcao;
      delete dados.funcao;
    }

    try {
      const resposta = await fetch(
        `${API_URL}/usuarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dados)
        }
      );

      const respostaDados = await resposta.json();

      if (!resposta.ok) {
        alert(
          "Erro no banco de dados: " +
          (
            respostaDados.erro ||
            "Verifique se este e-mail já existe."
          )
        );
        return;
      }

      alert("Usuário cadastrado com sucesso.");

      formUsuario.reset();

      await listarUsuarios();
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro de conexão: não foi possível alcançar o servidor backend."
      );
    }
  });
}

async function listarUsuarios() {
  const tbody = document.getElementById("usuarios-tbody");
  const contador = document.getElementById("usuarios-count");

  const rankReal =
    localStorage.getItem("user_rank") || "membro";

  if (rankReal !== "admin") {
    if (contador) {
      contador.innerText = "0";
    }

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="px-5 py-4 text-xs text-center text-slate-400">
            Acesso permitido somente para administradores.
          </td>
        </tr>
      `;
    }

    return;
  }

  try {
    const resposta = await requisicaoAutenticada(
      `${API_URL}/usuarios`
    );

    const membros = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        membros.erro || "Não foi possível listar usuários."
      );
    }

    if (contador) {
      contador.innerText = membros.length;
    }

    if (tbody) {
      tbody.innerHTML = membros
        .map(
          (usuario) => `
            <tr class="border-b border-gray-100">
              <td class="px-5 py-3 text-xs font-semibold text-slate-700">
                ${usuario.nome}
              </td>

              <td class="px-5 py-3 text-xs text-slate-500">
                ${usuario.email}
              </td>

              <td class="px-5 py-3 text-xs text-slate-500">
                ${usuario.telefone || "—"}
              </td>

              <td class="px-5 py-3 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium uppercase text-[9px]">
                  ${usuario.tipo || "membro"}
                </span>
              </td>
            </tr>
          `
        )
        .join("");
    }
  } catch (erro) {
    console.error(erro);

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="px-5 py-4 text-xs text-center text-red-500">
            Não foi possível carregar os usuários.
          </td>
        </tr>
      `;
    }
  }
}

async function carregarMuralNoticias() {
  try {
    const resposta = await fetch(`${API_URL}/noticias`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar as notícias.");
    }

    const noticias = await resposta.json();

    const container = document.getElementById(
      "news-feed-list"
    );

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!Array.isArray(noticias) || noticias.length === 0) {
      container.innerHTML = `
        <p class="col-span-full text-xs text-slate-400 text-center py-4">
          Nenhum aviso no banco local.
        </p>
      `;

      return;
    }

    noticias.slice(0, 3).forEach((item) => {
      container.innerHTML += `
        <div class="bg-white p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
          <div>
            <h4 class="font-semibold text-slate-800 text-sm mb-2">
              ${item.titulo}
            </h4>

            <p class="text-xs text-slate-500 line-clamp-2">
              ${item.conteudo}
            </p>
          </div>
        </div>
      `;
    });
  } catch (erro) {
    console.error(erro);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = obterToken();

  if (!token) {
    encerrarSessao();
    return;
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  const rankReal =
    localStorage.getItem("user_rank") || "membro";

  const rankExibido =
    localStorage.getItem("simulated_rank") || rankReal;

  const secaoAtiva =
    localStorage.getItem("dashboard_secao_ativa") ||
    "dashboard";

  const seletorRank = document.getElementById(
    "select-teste-rank"
  );

  if (seletorRank) {
    seletorRank.value = rankExibido;
  }

  atualizarMenuPorRank(rankExibido);

  await atualizarDashboardGeral();
  await listarUsuarios();
  await carregarMuralNoticias();

  const botaoAlvo = document.querySelector(
    `[data-section="${secaoAtiva}"]`
  );

  if (
    botaoAlvo &&
    !botaoAlvo.classList.contains("hidden")
  ) {
    botaoAlvo.click();
  } else {
    const botaoDashboard = document.querySelector(
      '[data-section="dashboard"]'
    );

    if (botaoDashboard) {
      botaoDashboard.click();
    }
  }

  const botaoSair = document.getElementById(
    "btn-sair-sistema"
  );

  if (botaoSair) {
    botaoSair.addEventListener("click", encerrarSessao);
  }
});