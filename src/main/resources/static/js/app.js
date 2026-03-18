document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api';
    const tokenKey = 'authToken';
    const userKey = 'authUser';

    const videoElement = document.getElementById('user-video');
    const btnCamera = document.getElementById('btn-camera');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const lessonList = document.getElementById('lesson-list');
    const currentSign = document.getElementById('current-sign');
    const currentCategory = document.getElementById('current-category');
    const currentDifficulty = document.getElementById('current-difficulty');
    const guideVideoWrapper = document.getElementById('guide-video-wrapper');

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnLoginOpen = document.getElementById('btn-login-open');
    const btnRegisterOpen = document.getElementById('btn-register-open');
    const btnLogout = document.getElementById('btn-logout');
    const btnAdmin = document.getElementById('btn-admin');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    let stream = null;
    let senas = [];
    let currentIndex = -1;

    function getStoredUser() {
        const raw = localStorage.getItem(userKey);
        return raw ? JSON.parse(raw) : null;
    }

    function updateAuthUI() {
        const user = getStoredUser();
        const loggedIn = Boolean(localStorage.getItem(tokenKey) && user);
        btnLoginOpen.classList.toggle('hidden', loggedIn);
        btnRegisterOpen.classList.toggle('hidden', loggedIn);
        btnLogout.classList.toggle('hidden', !loggedIn);
        btnAdmin.classList.toggle('hidden', !(loggedIn && user.rol === 'ADMIN'));
    }

    function openModal(modal) {
        modal.classList.remove('hidden');
    }

    function closeModal(modal) {
        modal.classList.add('hidden');
    }

    async function apiRequest(path, options = {}) {
        const token = localStorage.getItem(tokenKey);
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers
        });
        const hasJson = response.headers.get('content-type')?.includes('application/json');
        const data = hasJson ? await response.json() : null;

        if (!response.ok) {
            throw new Error(data?.error || `Error ${response.status}`);
        }
        return data;
    }

    function parseYouTubeEmbed(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/;
        const match = url.match(regex);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }

    function renderGuideVideo(url) {
        if (!url) {
            guideVideoWrapper.innerHTML = 'Sin video de referencia disponible.';
            return;
        }
        const youtubeEmbed = parseYouTubeEmbed(url);
        if (youtubeEmbed) {
            guideVideoWrapper.innerHTML = `<iframe class="guide-frame" src="${youtubeEmbed}" title="Video guía de seña" allowfullscreen></iframe>`;
            return;
        }
        guideVideoWrapper.innerHTML = `<video class="guide-local-video" src="${url}" controls preload="metadata"></video>`;
    }

    function renderCurrentSena() {
        if (!senas.length || currentIndex < 0) {
            currentSign.textContent = '"Sin selección"';
            currentCategory.textContent = 'Sin categoría';
            currentDifficulty.textContent = 'Dificultad: -';
            renderGuideVideo('');
            return;
        }

        const sena = senas[currentIndex];
        currentSign.textContent = `"${sena.nombre}"`;
        currentCategory.textContent = sena.categoria;
        currentDifficulty.textContent = `Dificultad: ${sena.dificultad}`;
        renderGuideVideo(sena.videoReferenciaUrl);

        const items = lessonList.querySelectorAll('li');
        items.forEach((item, idx) => item.classList.toggle('active', idx === currentIndex));
    }

    function renderLessonList() {
        lessonList.innerHTML = '';
        senas.forEach((sena, index) => {
            const li = document.createElement('li');
            li.textContent = `${sena.nombre} • ${sena.categoria}`;
            li.addEventListener('click', () => {
                currentIndex = index;
                renderCurrentSena();
            });
            lessonList.appendChild(li);
        });
        if (senas.length > 0) {
            currentIndex = 0;
            renderCurrentSena();
        } else {
            renderCurrentSena();
        }
    }

    async function cargarSenas() {
        try {
            senas = await apiRequest('/senas', { method: 'GET' });
            renderLessonList();
        } catch (err) {
            console.error(err);
            lessonList.innerHTML = '<li>No se pudieron cargar las señas.</li>';
        }
    }

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            videoElement.srcObject = stream;
            btnCamera.textContent = 'Apagar Cámara';
            btnCamera.classList.replace('secondary', 'primary');
        } catch (err) {
            console.error('Error al acceder a la cámara:', err);
            alert('Por favor, permite el acceso a la cámara para poder practicar.');
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
            stream = null;
            btnCamera.textContent = 'Activar Cámara';
            btnCamera.classList.replace('primary', 'secondary');
        }
    }

    function simulateSuccess() {
        if (stream) {
            feedbackOverlay.classList.remove('hidden');
            setTimeout(() => feedbackOverlay.classList.add('hidden'), 2000);
        }
    }

    btnCamera.addEventListener('click', () => {
        if (stream) stopCamera();
        else startCamera();
    });

    btnPrev.addEventListener('click', () => {
        if (!senas.length) return;
        currentIndex = (currentIndex - 1 + senas.length) % senas.length;
        renderCurrentSena();
    });

    btnNext.addEventListener('click', () => {
        if (!senas.length) return;
        simulateSuccess();
        currentIndex = (currentIndex + 1) % senas.length;
        renderCurrentSena();
    });

    btnLoginOpen.addEventListener('click', () => openModal(loginModal));
    btnRegisterOpen.addEventListener('click', () => openModal(registerModal));
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        updateAuthUI();
    });
    btnAdmin.addEventListener('click', () => {
        window.location.href = '/admin.html';
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(document.getElementById(btn.dataset.closeModal)));
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            localStorage.setItem(tokenKey, data.token);
            localStorage.setItem(userKey, JSON.stringify(data.usuario));
            updateAuthUI();
            closeModal(loginModal);
            alert(`Bienvenido, ${data.usuario.nombre}`);
            loginForm.reset();
        } catch (err) {
            alert(err.message);
        }
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nombre = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        try {
            await apiRequest('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ nombre, email, password })
            });
            alert('Registro exitoso. Ahora inicia sesión.');
            closeModal(registerModal);
            registerForm.reset();
        } catch (err) {
            alert(err.message);
        }
    });

    updateAuthUI();
    cargarSenas();
});
