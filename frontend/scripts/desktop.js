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
        console.error("Erro ao ler usuário", e);
    }

    if (!token) {
        window.location.href = '/'; 
        return;
    }

    const nomeUsuario = user.user_metadata?.username || user.email || 'Visitante';

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
            
            resetZIndexes();
            elmnt.style.zIndex = "10";
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

function resetZIndexes() {
    document.querySelectorAll('.aero-window').forEach(w => w.style.zIndex = "1");
}

window.toggleWindow = (id) => {
    const win = document.getElementById(id);
    if (win.style.display === 'none') {
        win.style.display = 'block';
        resetZIndexes();
        win.style.zIndex = "10";
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
    
    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Falha ao buscar');
        
        const tasks = await res.json();
        renderTasks(tasks);
        
    } catch (error) {
        console.error(error);
        list.innerHTML = '<li style="color:red">Erro ao carregar :(</li>';
    }
}

function renderTasks(tasks) {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (tasks.length === 0) {
        list.innerHTML = '<li style="opacity:0.7; text-align:center">Nenhuma missão ativa.</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <input type="checkbox" ${task.concluida ? 'checked' : ''} 
                onchange="toggleTaskStatus('${task.id}', this.checked)">
            <span style="${task.concluida ? 'text-decoration: line-through; opacity: 0.6' : ''}">
                ${task.titulo}
            </span>
        `;
        list.appendChild(li);
    });
}

window.addTask = async () => {
    const input = document.getElementById('newTaskInput');
    const titulo = input.value;
    const token = localStorage.getItem('token');

    if (!titulo) return;

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
        alert('Erro ao salvar missão');
    }
};

window.toggleTaskStatus = async (id, isChecked) => {
    const token = localStorage.getItem('token');
    
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ concluida: isChecked })
    });
    
    if(isChecked) fetchTasks();
};

window.handleEnter = (e) => {
    if (e.key === 'Enter') window.addTask();
};

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').innerText = timeString;
    setTimeout(updateClock, 10000);
}