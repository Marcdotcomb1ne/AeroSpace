const API_URL = '/api/auth';

window.toggleForms = () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const title = document.getElementById('welcomeText');
    const avatar = document.getElementById('avatarImg');

    if (loginForm.classList.contains('active')) {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        title.innerText = "Novo Usuário";
        avatar.src = "https://img.icons8.com/fluency/96/add-user-male.png";
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        title.innerText = "AeroSpace";
        avatar.src = "https://img.icons8.com/fluency/96/user-male-circle.png";
    }
    clearFeedback();
};

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    showFeedback('Conectando...', 'white');

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.session.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/desktop'; // Vai para o Desktop
        } else {
            showFeedback(data.error || 'Senha incorreta.', '#ff6b6b');
        }
    } catch (error) {
        showFeedback('Erro de conexão.', '#ff6b6b');
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    showFeedback('Criando usuário...', 'white');

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            showFeedback('Conta criada! Faça login.', '#55efc4');
            setTimeout(() => {
                toggleForms(); // Volta pra tela de login
            }, 1500);
        } else {
            showFeedback(data.error || 'Erro ao criar conta.', '#ff6b6b');
        }
    } catch (error) {
        showFeedback('Erro de conexão.', '#ff6b6b');
    }
});

function showFeedback(msg, color) {
    const feed = document.getElementById('feedback');
    feed.innerText = msg;
    feed.style.color = color;
}

function clearFeedback() {
    document.getElementById('feedback').innerText = '';
}