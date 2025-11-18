const API_URL = '/api/tasks';
const PROFILE_URL = '/api/profile';
const COMMUNITY_URL = '/api/community';

let currentCuratedType = 'links';
let chatInterval;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateClock();
    setupDragAndDrop();
    loadProfile();
    fetchTasks();
    
    chatInterval = setInterval(() => {
        if (document.getElementById('comunidadeWindow').style.display !== 'none') {
            loadChatMessages();
        }
    }, 5000);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    let user = {};
    
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
        console.error("Erro ao ler dados do usuário", e);
    }

    if (!token) {
        window.location.href = '/';
        return;
    }

    const nomeUsuario = user.user_metadata?.username || user.email || 'Viajante Aero';
    const display = document.getElementById('usernameDisplay');
    if(display) display.innerText = nomeUsuario;
}

async function loadProfile() {
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(PROFILE_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const profile = await res.json();
            
            // Aplicar wallpaper
            if (profile.wallpaper_url) {
                document.getElementById('desktop-area').style.background = `url('${profile.wallpaper_url}') no-repeat center center fixed`;
                document.getElementById('desktop-area').style.backgroundSize = 'cover';
            }
            
            // Aplicar avatar
            if (profile.avatar_url === "https://i.imgur.com/default-avatar.png") {
                document.getElementById('profileAvatar').src = "/assets/imgs/profile.png";
                document.getElementById('desktopAvatar').src = "/assets/imgs/profile.png";
            } else if (profile.avatar_url) {
                document.getElementById('profileAvatar').src = profile.avatar_url;
                document.getElementById('desktopAvatar').src = profile.avatar_url;
            }

            // Aplicar mood
            if (profile.mood && profile.mood_text) {
                const moodEmojis = {
                    'chill': '😊',
                    'sad': '😢',
                    'hyper': '🤩',
                    'retro': '🌈',
                    'cyber': '🤖',
                    'zen': '🧘'
                };
                document.getElementById('moodIcon').innerText = moodEmojis[profile.mood] || '😊';
                document.getElementById('moodText').innerText = profile.mood_text;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

window.changeWallpaper = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target.result;
        
        // Aplicar localmente
        document.getElementById('desktop-area').style.background = `url('${dataUrl}') no-repeat center center fixed`;
        document.getElementById('desktop-area').style.backgroundSize = 'cover';
        
        // Salvar no backend
        const token = localStorage.getItem('token');
        try {
            await fetch(PROFILE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ wallpaper_url: dataUrl })
            });
        } catch (error) {
            console.error('Erro ao salvar wallpaper:', error);
        }
    };
    reader.readAsDataURL(file);
};

window.changeAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            const dataUrl = event.target.result;
            
            // Aplicar localmente
            document.getElementById('profileAvatar').src = dataUrl;
            document.getElementById('desktopAvatar').src = dataUrl;
            
            // Salvar no backend
            const token = localStorage.getItem('token');
            try {
                await fetch(PROFILE_URL, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ avatar_url: dataUrl })
                });
            } catch (error) {
                console.error('Erro ao salvar avatar:', error);
            }
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

// SISTEMA DE HUMOR
window.setMood = async (mood, emoji, text) => {
    document.getElementById('moodIcon').innerText = emoji;
    document.getElementById('moodText').innerText = text;
    toggleWindow('moodSelector');
    
    const token = localStorage.getItem('token');
    try {
        await fetch(PROFILE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mood, mood_text: text })
        });
    } catch (error) {
        console.error('Erro ao salvar mood:', error);
    }
};

// SISTEMA DE CURADORIA
window.switchCuratedTab = (tipo) => {
    currentCuratedType = tipo;
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadCuratedItems(tipo);
};

async function loadCuratedItems(tipo = 'links') {
    const token = localStorage.getItem('token');
    const container = document.getElementById('curatedContent');
    
    try {
        const res = await fetch(`${PROFILE_URL}/curated?tipo=${tipo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const items = await res.json();
            renderCuratedItems(items);
        }
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
    }
}

function renderCuratedItems(items) {
    const container = document.getElementById('curatedContent');
    container.innerHTML = '';
    
    if (items.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 30px; color: #666;">Nada aqui ainda... Adicione algo!</div>';
        return;
    }
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'curated-item';
        div.onclick = () => {
            if (item.url) window.open(item.url, '_blank');
        };
        
        const imgSrc = item.imagem_url || getDefaultImage(item.tipo);
        
        div.innerHTML = `
            ${imgSrc ? `<img src="${imgSrc}" alt="${item.titulo}">` : ''}
            <div class="title">${item.titulo}</div>
            ${item.descricao ? `<div class="desc">${item.descricao}</div>` : ''}
            <button class="delete-btn" onclick="deleteCuratedItem('${item.id}', event)">×</button>
        `;
        
        container.appendChild(div);
    });
}

function getDefaultImage(tipo) {
    const defaults = {
        'links': 'https://img.icons8.com/fluency/96/link.png',
        'fotos': 'https://img.icons8.com/fluency/96/image.png',
        'filmes': 'https://img.icons8.com/fluency/96/movie.png'
    };
    return defaults[tipo] || defaults['links'];
}

window.addCuratedItem = async () => {
    const titulo = document.getElementById('curatedTitle').value;
    const url = document.getElementById('curatedUrl').value;
    
    if (!titulo.trim()) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${PROFILE_URL}/curated`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tipo: currentCuratedType,
                titulo,
                url,
                descricao: '',
                imagem_url: ''
            })
        });
        
        if (res.ok) {
            document.getElementById('curatedTitle').value = '';
            document.getElementById('curatedUrl').value = '';
            loadCuratedItems(currentCuratedType);
        }
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
    }
};

window.deleteCuratedItem = async (id, event) => {
    event.stopPropagation();
    
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${PROFILE_URL}/curated/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            loadCuratedItems(currentCuratedType);
        }
    } catch (error) {
        console.error('Erro ao deletar item:', error);
    }
};

// SISTEMA DE COMUNIDADE/CHAT
async function loadChatMessages() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('chatMessages');
    
    try {
        const res = await fetch(COMMUNITY_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const messages = await res.json();
            renderChatMessages(messages);
        }
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}

function renderChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUsername = user.user_metadata?.username || user.email?.split('@')[0];
    
    container.innerHTML = '';
    
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = `chat-message ${msg.username === currentUsername ? 'own' : ''}`;
        
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        div.innerHTML = `
            <div class="username">${msg.username}</div>
            <div class="text">${msg.mensagem}</div>
            <div class="time">${time}</div>
        `;
        
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}

window.sendMessage = async () => {
    const input = document.getElementById('chatInput');
    const mensagem = input.value.trim();
    
    if (!mensagem) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(COMMUNITY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mensagem })
        });
        
        if (res.ok) {
            input.value = '';
            loadChatMessages();
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
    }
};

window.handleChatEnter = (e) => {
    if (e.key === 'Enter') sendMessage();
};

// DRAG AND DROP
function setupDragAndDrop() {
    const windows = document.querySelectorAll('.aero-window');
    
    windows.forEach(elmnt => {
        const header = elmnt.querySelector('.window-header');
        if (!header) return;

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            toggleWindowZIndex(elmnt);
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    });
}

function toggleWindowZIndex(activeWindow) {
    document.querySelectorAll('.aero-window').forEach(w => w.style.zIndex = "1");
    if(activeWindow) activeWindow.style.zIndex = "10";
}

window.toggleWindow = (id) => {
    const win = document.getElementById(id);
    if (win.style.display === 'none' || win.style.display === '') {
        win.style.display = 'block';
        toggleWindowZIndex(win);
        
        if (id === 'curatoriaWindow') {
            loadCuratedItems(currentCuratedType);
        } else if (id === 'comunidadeWindow') {
            loadChatMessages();
        }
    } else {
        win.style.display = 'none';
    }
};

window.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearInterval(chatInterval);
    window.location.href = '/';
};

async function fetchTasks() {
    const token = localStorage.getItem('token');
    const list = document.getElementById('taskList');
    
    if (!list.hasChildNodes()) {
        list.innerHTML = '<li class="task-msg">Carregando missões...</li>';
    }

    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Falha ao buscar');
        
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (error) {
        console.error(error);
        list.innerHTML = '<li class="task-msg" style="color: #a00;">Erro de conexão.</li>';
    }
}

function renderTasks(tasks) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (tasks.length === 0) {
        list.innerHTML = '<li class="task-msg">Nada pendente. Aproveite a brisa! 🍃</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        const spanId = `text-${task.id}`;
        
        li.innerHTML = `
            <input type="checkbox" 
                ${task.concluida ? 'checked' : ''} 
                onclick="toggleTaskStatus('${task.id}', '${spanId}', this)">
            <span id="${spanId}" class="task-text ${task.concluida ? 'completed' : ''}">
                ${task.titulo}
            </span>
        `;
        list.appendChild(li);
    });
}

window.toggleTaskStatus = async (taskId, spanId, checkboxElement) => {
    const token = localStorage.getItem('token');
    const isChecked = checkboxElement.checked;
    const textSpan = document.getElementById(spanId);

    if (isChecked) {
        textSpan.classList.add('completed');
    } else {
        textSpan.classList.remove('completed');
    }

    try {
        const res = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ concluida: isChecked })
        });

        if (!res.ok) throw new Error('Falha no servidor');
    } catch (error) {
        console.error("Erro ao salvar status:", error);
        checkboxElement.checked = !isChecked;
        if (isChecked) textSpan.classList.remove('completed');
        else textSpan.classList.add('completed');
        alert('Não foi possível salvar. Verifique sua conexão.');
    }
};

window.addTask = async () => {
    const input = document.getElementById('newTaskInput');
    const titulo = input.value;
    const token = localStorage.getItem('token');

    if (!titulo.trim()) return;
    input.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ titulo })
        });

        if (res.ok) {
            input.value = '';
            fetchTasks();
        }
    } catch (error) {
        alert('Erro ao criar missão.');
    } finally {
        input.disabled = false;
        input.focus();
    }
};

window.handleEnter = (e) => {
    if (e.key === 'Enter') window.addTask();
};

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = timeString;
    setTimeout(updateClock, 10000);
}