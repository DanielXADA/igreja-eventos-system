// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.getElementById('togglePassword');

    // Funcionalidade de Mostrar/Ocultar a Senha
    togglePasswordIcon.addEventListener('click', () => {
        // Altera o tipo do input
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        // Altera o ícone do olho
        togglePasswordIcon.classList.toggle('fa-eye');
        togglePasswordIcon.classList.toggle('fa-eye-slash');
    });
});

// Manipulação do envio do formulário de login
function handleLogin(event) {
    event.preventDefault(); // Impede o recarregamento automático da página

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const messageBox = document.getElementById('messageBox');

    // Limpa mensagens anteriores
    messageBox.className = 'message-box';
    messageBox.style.display = 'none';

    // Validação Simples Local (Substitua por sua integração com o Back-end)
    if (email === "" || password === "") {
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('A senha deve conter pelo menos 6 caracteres.', 'error');
        return;
    }

    // Simulação de Sucesso no Login
    showMessage('Autenticando... Seja bem-vindo!', 'success');
    
    // Aqui você faria a requisição fetch/axios para sua API
    console.log('Dados enviados:', { email, password });
    
    /* Exemplo de fluxo posterior:
    setTimeout(() => {
        window.location.href = '/dashboard-eventos.html';
    }, 1500); 
    */
}

// Função auxiliar para exibir mensagens de aviso
function showMessage(text, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = text;
    messageBox.classList.add(type);
}

// Funções de clique para fluxos alternativos (Simulação)
function handleForgotPassword() {
    alert("Você será redirecionado para a página de recuperação de senha pastoral.");
}

function handleRegisterRedirect() {
    alert("Redirecionando para o formulário de cadastro de novos paroquianos.");
}