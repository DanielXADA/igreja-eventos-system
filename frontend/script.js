document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePasswordIcon = document.getElementById('togglePassword');

    togglePasswordIcon.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        togglePasswordIcon.classList.toggle('fa-eye');
        togglePasswordIcon.classList.toggle('fa-eye-slash');
    });
});

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (email === "" || password === "") {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (password.length < 6) {
        alert('A senha deve conter pelo menos 6 caracteres.');
        return;
    }

    console.log('Dados enviados:', { email, password });
    
    window.location.href = "dashboard.html";
}

function handleForgotPassword() {
    alert("Você será redirecionado para a página de recuperação de senha pastoral.");
}

function handleRegisterRedirect() {
    alert("Redirecionando para o formulário de cadastro de novos paroquianos.");
}