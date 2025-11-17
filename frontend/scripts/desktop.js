const API_URL = '/api/tasks'; 

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateClock();
    setupDragAndDrop();
    
    fetchTasks();
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
    } else {
        win.style.display = 'none';
    }
};

window.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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