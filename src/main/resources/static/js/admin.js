document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api';
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('authUser') ? JSON.parse(localStorage.getItem('authUser')) : null;

    if (!token || !user || user.rol !== 'ADMIN') {
        alert('Acceso denegado. Solo administradores.');
        window.location.href = '/index.html';
        return;
    }

    const userForm = document.getElementById('user-form');
    const usersTableBody = document.getElementById('users-table-body');
    const senaForm = document.getElementById('sena-form');
    const senasTableBody = document.getElementById('senas-table-body');

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: { ...authHeaders, ...(options.headers || {}) }
        });
        const hasJson = response.headers.get('content-type')?.includes('application/json');
        const data = hasJson ? await response.json() : null;
        if (!response.ok) throw new Error(data?.error || `Error ${response.status}`);
        return data;
    }

    function resetUserForm() {
        userForm.reset();
        document.getElementById('user-id').value = '';
        document.getElementById('user-role').value = 'ESTUDIANTE';
    }

    function resetSenaForm() {
        senaForm.reset();
        document.getElementById('sena-id').value = '';
    }

    async function loadUsers() {
        const users = await request('/usuarios');
        usersTableBody.innerHTML = '';
        users.forEach((u) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${u.id}</td>
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td>${u.rol || 'ESTUDIANTE'}</td>
                <td>
                    <button class="btn secondary small" data-edit-user="${u.id}">Editar</button>
                    <button class="btn primary small" data-delete-user="${u.id}">Eliminar</button>
                </td>
            `;
            row.querySelector(`[data-edit-user="${u.id}"]`).addEventListener('click', () => {
                document.getElementById('user-id').value = u.id;
                document.getElementById('user-name').value = u.nombre;
                document.getElementById('user-email').value = u.email;
                document.getElementById('user-password').value = '';
                document.getElementById('user-role').value = (u.rol || 'ESTUDIANTE').toUpperCase();
            });
            row.querySelector(`[data-delete-user="${u.id}"]`).addEventListener('click', async () => {
                if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
                await request(`/usuarios/${u.id}`, { method: 'DELETE' });
                await loadUsers();
            });
            usersTableBody.appendChild(row);
        });
    }

    async function loadSenas() {
        const response = await fetch(`${API_BASE}/senas`);
        const senas = await response.json();
        senasTableBody.innerHTML = '';
        senas.forEach((s) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${s.id}</td>
                <td>${s.nombre}</td>
                <td>${s.categoria}</td>
                <td>${s.dificultad}</td>
                <td class="truncate">${s.videoReferenciaUrl}</td>
                <td>
                    <button class="btn secondary small" data-edit-sena="${s.id}">Editar</button>
                    <button class="btn primary small" data-delete-sena="${s.id}">Eliminar</button>
                </td>
            `;
            row.querySelector(`[data-edit-sena="${s.id}"]`).addEventListener('click', () => {
                document.getElementById('sena-id').value = s.id;
                document.getElementById('sena-name').value = s.nombre;
                document.getElementById('sena-category').value = s.categoria;
                document.getElementById('sena-difficulty').value = s.dificultad;
                document.getElementById('sena-video-url').value = s.videoReferenciaUrl;
            });
            row.querySelector(`[data-delete-sena="${s.id}"]`).addEventListener('click', async () => {
                if (!confirm('¿Seguro que deseas eliminar esta seña?')) return;
                await request(`/senas/${s.id}`, { method: 'DELETE' });
                await loadSenas();
            });
            senasTableBody.appendChild(row);
        });
    }

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('user-id').value;
        const payload = {
            nombre: document.getElementById('user-name').value.trim(),
            email: document.getElementById('user-email').value.trim(),
            password: document.getElementById('user-password').value,
            rol: document.getElementById('user-role').value
        };

        if (!id && !payload.password) {
            alert('La contraseña es obligatoria para crear un usuario.');
            return;
        }

        await request(id ? `/usuarios/${id}` : '/usuarios', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });
        resetUserForm();
        await loadUsers();
    });

    senaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('sena-id').value;
        const payload = {
            nombre: document.getElementById('sena-name').value.trim(),
            categoria: document.getElementById('sena-category').value.trim(),
            dificultad: document.getElementById('sena-difficulty').value.trim(),
            videoReferenciaUrl: document.getElementById('sena-video-url').value.trim()
        };

        await request(id ? `/senas/${id}` : '/senas', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });
        resetSenaForm();
        await loadSenas();
    });

    document.getElementById('btn-home').addEventListener('click', () => {
        window.location.href = '/index.html';
    });
    document.getElementById('btn-logout').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.href = '/index.html';
    });

    loadUsers().catch((err) => alert(err.message));
    loadSenas().catch((err) => alert(err.message));
});
