const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const togglePasswordIcon = document.getElementById("togglePassword");

  if (togglePasswordIcon && passwordInput) {
    togglePasswordIcon.addEventListener("click", () => {
      const isPassword = passwordInput.getAttribute("type") === "password";

      passwordInput.setAttribute(
        "type",
        isPassword ? "text" : "password"
      );

      togglePasswordIcon.classList.toggle("fa-eye");
      togglePasswordIcon.classList.toggle("fa-eye-slash");
    });
  }
});

function alternarTelas(mostrarCadastro) {
  const areaLogin = document.getElementById("area-login");
  const areaCadastro = document.getElementById("area-cadastro");

  if (areaLogin) {
    areaLogin.style.display = mostrarCadastro ? "none" : "block";
  }

  if (areaCadastro) {
    areaCadastro.style.display = mostrarCadastro ? "block" : "none";
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value;

  if (!email || !senha) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        senha
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert("Erro no login: " + (dados.erro || "Credenciais inválidas."));
      return;
    }

    if (!dados.token || !dados.usuario) {
      alert("Resposta de autenticação inválida.");
      return;
    }

    localStorage.setItem("token", dados.token);
    localStorage.setItem("user_id", dados.usuario._id);
    localStorage.setItem(
      "user_name",
      dados.usuario.nome || "Usuário"
    );
    localStorage.setItem(
      "user_email",
      dados.usuario.email || email
    );
    localStorage.setItem(
      "user_rank",
      dados.usuario.tipo || "membro"
    );
    localStorage.setItem(
      "dashboard_secao_ativa",
      "dashboard"
    );

    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível conectar ao servidor backend.");
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const nome = document.getElementById("reg-nome").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const senha = document.getElementById("reg-senha").value;
  const telefone = document.getElementById("reg-telefone").value.trim();

  if (!nome || !email || !senha) {
    alert("Preencha nome, e-mail e senha.");
    return;
  }

  if (senha.length < 6) {
    alert("A senha precisa ter no mínimo 6 caracteres.");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        telefone,
        origem: "publico"
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(
        "Erro ao cadastrar: " +
        (dados.erro || "Não foi possível realizar o cadastro.")
      );
      return;
    }

    alert("Cadastro paroquial realizado com sucesso. Faça seu login.");
    alternarTelas(false);
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível conectar ao servidor backend.");
  }
}

function handleForgotPassword() {
  alert(
    "Você será redirecionado para a página de recuperação de senha pastoral."
  );
}