document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.getElementById('togglePassword');
    if (togglePasswordIcon && passwordInput) {
        togglePasswordIcon.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            togglePasswordIcon.classList.toggle('fa-eye');
            togglePasswordIcon.classList.toggle('fa-eye-slash');
        });
    }
});

function alternarTelas(mostrarCadastro) {
    document.getElementById("area-login").style.display = mostrarCadastro ? "none" : "block";
    document.getElementById("area-cadastro").style.display = mostrarCadastro ? "block" : "none";
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (email === "" || password === "") {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    try {
        const resposta = await fetch("http://localhost:3000/api/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha: password })
        });
        if (resposta.ok) {
            const dados = await resposta.json();
            localStorage.setItem("user_name", dados.nome || "Administrador");
            localStorage.setItem("user_email", dados.email || email);
            localStorage.setItem("simulated_rank", dados.tipo || "membro");
            localStorage.setItem("dashboard_secao_ativa", "dashboard");
            window.location.href = "dashboard.html";
        } else {
            const erro = await resposta.json();
            alert("Erro no login: " + erro.erro);
        }
    } catch (erro) {
        alert("Não foi possível conectar ao servidor backend.");
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const nome = document.getElementById("reg-nome").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const senha = document.getElementById("reg-senha").value;
    const telefone = document.getElementById("reg-telefone").value.trim();
    if (senha.length < 6) {
        alert("A senha precisa ter no mínimo 6 caracteres.");
        return;
    }
    try {
        const resposta = await fetch("http://localhost:3000/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha, telefone, origem: "publico" })
        });
        if (resposta.ok) {
            alert("Cadastro paroquial realizado com sucesso! Faça seu login.");
            alternarTelas(false);
        } else {
            const erro = await resposta.json();
            alert("Erro ao cadastrar: " + erro.erro);
        }
    } catch (erro) {
        alert("Não foi possível conectar ao servidor backend.");
    }
}

function handleForgotPassword() {
    alert("Você será redirecionado para a página de recuperação de senha pastoral.");
}