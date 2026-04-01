document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api';
    const tokenKey = 'authToken';
    const userKey = 'authUser';
    const SUCCESS_AUTO_ADVANCE_MS = 1900;

    const scoreDisplay = document.getElementById('score-display');
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

    const btnArMode = document.getElementById('btn-ar-mode');
    const btnCloseAr = document.getElementById('btn-close-ar');
    const arModal = document.getElementById('ar-modal');
    const arVideoEl = document.getElementById('ar-video');
    const arCanvas = document.getElementById('ar-canvas');
    const arStatus = document.getElementById('ar-status');
    const arCheckmark = document.getElementById('ar-checkmark');
    const arSignLabel = document.getElementById('ar-sign-label');
    const btnArNext = document.getElementById('btn-ar-next');
    const arGuideWrapper = document.getElementById('ar-guide-wrapper');
    const arProgressFill = document.getElementById('ar-progress-fill');

    const mainVideoContainer = videoElement.closest('.video-container');
    const arModalInner = arVideoEl.closest('.ar-modal-inner');
    const HAND_CONNECTIONS = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20]
    ];

    let senas = [];
    let currentIndex = -1;
    let mainStreamActive = false;
    let arStreamActive = false;
    let mainStreamImage = null;
    let arStreamImage = null;
    let visionSocket = null;
    let currentPracticeSessionId = null;
    let successTimeout = null;
    let ghostHandAR = null;

    class GhostHandAR {
        constructor({ canvas, streamElement, container }) {
            this.canvas = canvas;
            this.streamElement = streamElement;
            this.container = container;
            this.renderer = null;
            this.scene = null;
            this.camera = null;
            this.jointMeshes = [];
            this.lineGeometry = null;
            this.linePositions = null;
            this.lineSegments = null;
            this.active = false;
            this.rafId = null;
            this.lastLandmarks = null;
            this.lastLandmarksAt = 0;
            this.fadeTimeoutMs = 700;
            this.resizeObserver = null;
        }

        init() {
            if (!window.THREE || !this.canvas) return false;
            if (this.renderer) return true;

            const initialWidth = Math.max(1, Math.floor(this.container?.clientWidth || 1));
            const initialHeight = Math.max(1, Math.floor(this.container?.clientHeight || 1));
            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(0, initialWidth, 0, initialHeight, -100, 100);
            this.camera.position.set(0, 0, 10);
            this.camera.lookAt(0, 0, 0);

            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true
            });
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.renderer.setClearColor(0x000000, 0);
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;

            const pointGeometry = new THREE.SphereGeometry(5, 16, 16);
            const pointMaterial = new THREE.MeshBasicMaterial({
                color: 0x7dd3fc,
                transparent: true,
                opacity: 0.95
            });

            for (let i = 0; i < 21; i += 1) {
                const joint = new THREE.Mesh(pointGeometry, pointMaterial);
                joint.visible = false;
                this.jointMeshes.push(joint);
                this.scene.add(joint);
            }

            this.linePositions = new Float32Array(HAND_CONNECTIONS.length * 2 * 3);
            this.lineGeometry = new THREE.BufferGeometry();
            this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x22d3ee,
                transparent: true,
                opacity: 0.9
            });
            this.lineSegments = new THREE.LineSegments(this.lineGeometry, lineMaterial);
            this.lineSegments.visible = false;
            this.scene.add(this.lineSegments);

            this.resize();
            this.resizeObserver = new ResizeObserver(() => this.resize());
            this.resizeObserver.observe(this.container);
            return true;
        }

        start() {
            if (!this.init()) return;
            this.active = true;
            this.canvas.classList.remove('hidden');
            this.resize();
            this.renderLoop();
        }

        stop() {
            this.active = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            this.lastLandmarks = null;
            this.lastLandmarksAt = 0;
            this.hideHand();
            if (this.canvas) this.canvas.classList.add('hidden');
            if (this.renderer) this.renderer.render(this.scene, this.camera);
        }

        resize() {
            if (!this.renderer || !this.container || !this.camera) return;
            const width = Math.max(1, Math.floor(this.container.clientWidth));
            const height = Math.max(1, Math.floor(this.container.clientHeight));
            this.renderer.setSize(width, height, false);
            this.camera.left = 0;
            this.camera.right = width;
            this.camera.top = 0;
            this.camera.bottom = height;
            this.camera.updateProjectionMatrix();
        }

        updateLandmarks(landmarks) {
            if (!this.active) return;
            if (!Array.isArray(landmarks) || landmarks.length < 21) {
                this.lastLandmarks = null;
                return;
            }
            this.lastLandmarks = landmarks;
            this.lastLandmarksAt = Date.now();
        }

        mirrorX(xRaw) {
            return 1 - xRaw;
        }

        getStreamRect() {
            if (!this.streamElement || !this.container) return null;
            const viewW = this.container.clientWidth;
            const viewH = this.container.clientHeight;
            if (!viewW || !viewH) return null;

            const mediaW = this.streamElement.naturalWidth || this.streamElement.videoWidth || viewW;
            const mediaH = this.streamElement.naturalHeight || this.streamElement.videoHeight || viewH;
            if (!mediaW || !mediaH) return null;

            const scale = Math.min(viewW / mediaW, viewH / mediaH);
            const drawW = mediaW * scale;
            const drawH = mediaH * scale;
            const offsetX = (viewW - drawW) * 0.5;
            const offsetY = (viewH - drawH) * 0.5;
            return { offsetX, offsetY, drawW, drawH };
        }

        hideHand() {
            this.jointMeshes.forEach((joint) => {
                joint.visible = false;
            });
            if (this.lineSegments) this.lineSegments.visible = false;
        }

        drawHand(landmarks) {
            const streamRect = this.getStreamRect();
            if (!streamRect) {
                this.hideHand();
                return;
            }
            const { offsetX, offsetY, drawW, drawH } = streamRect;

            for (let i = 0; i < 21; i += 1) {
                const point = landmarks[i];
                if (!point || point.length < 2) {
                    this.jointMeshes[i].visible = false;
                    continue;
                }
                const [xRaw, yRaw, zRaw = 0] = point;
                const x = offsetX + this.mirrorX(xRaw) * drawW;
                const y = offsetY + yRaw * drawH;
                const z = zRaw * 140;
                const mesh = this.jointMeshes[i];
                mesh.position.set(x, y, z);
                const pulse = 0.8 + Math.min(Math.abs(zRaw) * 3, 0.8);
                mesh.scale.setScalar(pulse);
                mesh.visible = true;
            }

            let ptr = 0;
            HAND_CONNECTIONS.forEach(([aIdx, bIdx]) => {
                const a = landmarks[aIdx];
                const b = landmarks[bIdx];
                if (!a || !b) return;
                this.linePositions[ptr++] = offsetX + this.mirrorX(a[0]) * drawW;
                this.linePositions[ptr++] = offsetY + a[1] * drawH;
                this.linePositions[ptr++] = (a[2] || 0) * 140;
                this.linePositions[ptr++] = offsetX + this.mirrorX(b[0]) * drawW;
                this.linePositions[ptr++] = offsetY + b[1] * drawH;
                this.linePositions[ptr++] = (b[2] || 0) * 140;
            });

            this.lineGeometry.attributes.position.needsUpdate = true;
            this.lineSegments.visible = true;
        }

        renderLoop = () => {
            if (!this.active || !this.renderer) return;
            if (this.lastLandmarks && (Date.now() - this.lastLandmarksAt) <= this.fadeTimeoutMs) {
                this.drawHand(this.lastLandmarks);
            } else {
                this.hideHand();
            }
            this.renderer.render(this.scene, this.camera);
            this.rafId = requestAnimationFrame(this.renderLoop);
        };
    }

    function getStoredUser() {
        const raw = localStorage.getItem(userKey);
        return raw ? JSON.parse(raw) : null;
    }

    function getCurrentSena() {
        return senas.length && currentIndex >= 0 ? senas[currentIndex] : null;
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
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
        const hasJson = response.headers.get('content-type')?.includes('application/json');
        const data = hasJson ? await response.json() : null;
        if (!response.ok) throw new Error(data?.error || `Error ${response.status}`);
        return data;
    }

    function parseYouTubeEmbed(url) {
        if (!url) return null;
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/;
        const match = url.match(regex);
        if (!match) return null;
        const videoId = match[1];
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
        return `https://www.youtube.com/embed/${videoId}`;
    }

    function renderGuideVideo(url) {
        guideVideoWrapper.replaceChildren();
        if (!url) {
            guideVideoWrapper.textContent = 'Sin video de referencia disponible.';
            return;
        }
        const youtubeEmbed = parseYouTubeEmbed(url);
        if (youtubeEmbed) {
            const iframe = document.createElement('iframe');
            iframe.className = 'guide-frame';
            iframe.src = youtubeEmbed;
            iframe.title = 'Video guia de seña';
            iframe.allowFullscreen = true;
            guideVideoWrapper.appendChild(iframe);
            return;
        }
        const video = document.createElement('video');
        video.className = 'guide-local-video';
        video.src = url;
        video.controls = true;
        video.preload = 'metadata';
        guideVideoWrapper.appendChild(video);
    }

    function renderArGuide(url) {
        if (!arGuideWrapper) return;
        const youtubeEmbed = parseYouTubeEmbed(url);
        arGuideWrapper.innerHTML = youtubeEmbed
            ? `<iframe src="${youtubeEmbed}&autoplay=1&mute=1" frameborder="0" allow="autoplay; fullscreen"></iframe>`
            : url
                ? `<video src="${url}" autoplay muted loop playsinline></video>`
                : '<div class="guide-media">Sin video de referencia</div>';
    }

    function renderCurrentSena() {
        const sena = getCurrentSena();
        if (!sena) {
            currentSign.textContent = '"Sin selección"';
            currentCategory.textContent = 'Sin categoría';
            currentDifficulty.textContent = 'Dificultad: -';
            renderGuideVideo('');
            return;
        }

        currentSign.textContent = `"${sena.nombre}"`;
        currentCategory.textContent = sena.categoria;
        currentDifficulty.textContent = `Dificultad: ${sena.dificultad}`;
        renderGuideVideo(sena.videoReferenciaUrl);
        if (arSignLabel) arSignLabel.textContent = sena.nombre;
        if (arStreamActive) renderArGuide(sena.videoReferenciaUrl);

        lessonList.querySelectorAll('li').forEach((item, idx) => {
            item.classList.toggle('active', idx === currentIndex);
        });
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

        currentIndex = senas.length > 0 ? 0 : -1;
        renderCurrentSena();
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

    function ensureMainStreamImage() {
        if (mainStreamImage) return mainStreamImage;
        mainStreamImage = document.createElement('img');
        mainStreamImage.className = 'camera-stream';
        mainStreamImage.alt = 'Vista de cámara del backend';
        videoElement.classList.add('hidden');
        mainVideoContainer.insertBefore(mainStreamImage, feedbackOverlay);
        return mainStreamImage;
    }

    function ensureArStreamImage() {
        if (arStreamImage) return arStreamImage;
        arStreamImage = document.createElement('img');
        arStreamImage.className = 'ar-stream';
        arStreamImage.alt = 'Vista de práctica en tiempo real';
        arVideoEl.classList.add('hidden');
        arCanvas.classList.add('hidden');
        arModalInner.insertBefore(arStreamImage, arCanvas);
        return arStreamImage;
    }

    function ensureGhostHandAR() {
        if (ghostHandAR) return ghostHandAR;
        const streamElement = ensureArStreamImage();
        ghostHandAR = new GhostHandAR({
            canvas: arCanvas,
            streamElement,
            container: arModalInner
        });
        return ghostHandAR;
    }

    function refreshMainStream() {
        ensureMainStreamImage().src = `${API_BASE}/vision/stream?view=main&t=${Date.now()}`;
    }

    function refreshArStream() {
        ensureArStreamImage().src = `${API_BASE}/vision/stream?view=ar&t=${Date.now()}`;
    }

    function clearMainStream() {
        if (mainStreamImage) mainStreamImage.removeAttribute('src');
    }

    function clearArStream() {
        if (arStreamImage) arStreamImage.removeAttribute('src');
    }

    function resetScore() {
        if (scoreDisplay) scoreDisplay.textContent = 'Precisión: 0%';
        if (arProgressFill) arProgressFill.style.width = '0%';
    }

    function showMainSuccess(feedback) {
        if (!feedbackOverlay) return;
        const title = feedbackOverlay.querySelector('h3');
        const description = feedbackOverlay.querySelector('p');
        if (title) title.textContent = '¡Excelente!';
        if (description) description.textContent = feedback || 'Movimiento detectado con éxito';
        feedbackOverlay.classList.remove('hidden');
        window.clearTimeout(successTimeout);
        successTimeout = window.setTimeout(() => feedbackOverlay.classList.add('hidden'), 1600);
    }

    function playSuccessChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [[523.25, 0], [659.25, 0.18]].forEach(([freq, delay]) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                const t = ctx.currentTime + delay;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
                osc.start(t);
                osc.stop(t + 0.6);
            });
        } catch (_) {}
    }

    function updateArStatus(event) {
        if (!arStatus) return;
        arStatus.className = 'ar-status';
        arStatus.classList.remove('hidden');
        arStatus.textContent = event.feedback || 'RA activa';
        if (event.estado === 'success') arStatus.classList.add('ar-success');
        if (event.estado === 'error') arStatus.classList.add('ar-error');
    }

    function showArSuccess() {
        if (!arCheckmark) return;
        arCheckmark.classList.add('hidden');
        void arCheckmark.offsetWidth;
        arCheckmark.classList.remove('hidden');
        window.setTimeout(() => arCheckmark.classList.add('hidden'), 1500);
    }

    function ensureVisionSocket() {
        if (visionSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(visionSocket.readyState)) return;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        visionSocket = new WebSocket(`${protocol}//${window.location.host}${API_BASE}/vision/eventos`);
        visionSocket.onmessage = (message) => {
            const event = JSON.parse(message.data);
            handleVisionEvent(event);
        };
        visionSocket.onclose = () => {
            visionSocket = null;
            if (mainStreamActive || arStreamActive) {
                window.setTimeout(ensureVisionSocket, 600);
            }
        };
    }

    function closeVisionSocket() {
        if (!visionSocket) return;
        visionSocket.close();
        visionSocket = null;
    }

    async function startVision(mode, sena) {
        const user = getStoredUser();
        return apiRequest('/vision/iniciar', {
            method: 'POST',
            body: JSON.stringify({
                mode,
                session_id: currentPracticeSessionId,
                usuario_id: user?.id || null,
                sena_id: sena?.id || null,
                target_name: sena?.nombre || null
            })
        });
    }

    async function stopVisionService() {
        try {
            await apiRequest('/vision/detener', { method: 'POST', body: JSON.stringify({}) });
        } catch (err) {
            console.warn('No se pudo detener el servicio de visión:', err);
        }
    }

    async function syncVisionTarget() {
        const sena = getCurrentSena();
        if (!arStreamActive || !sena) return;
        await startVision('practice', sena);
        refreshArStream();
        if (arProgressFill) arProgressFill.style.width = '0%';
    }

    async function startMainCamera() {
        try {
            await startVision('preview', getCurrentSena());
            mainStreamActive = true;
            refreshMainStream();
            ensureVisionSocket();
            btnCamera.textContent = 'Apagar Cámara';
            btnCamera.classList.replace('secondary', 'primary');
        } catch (err) {
            console.error(err);
            alert('No se pudo iniciar la cámara local desde el backend.');
        }
    }

    async function stopMainCamera() {
        mainStreamActive = false;
        clearMainStream();
        if (!arStreamActive) {
            await stopVisionService();
            closeVisionSocket();
        }
        btnCamera.textContent = 'Activar Cámara';
        btnCamera.classList.replace('primary', 'secondary');
        feedbackOverlay.classList.add('hidden');
        resetScore();
    }

    async function createPracticeSession() {
        const user = getStoredUser();
        const sena = getCurrentSena();
        if (!sena || !user) {
            currentPracticeSessionId = null;
            return;
        }
        const session = await apiRequest('/sesiones-practica', {
            method: 'POST',
            body: JSON.stringify({ usuario_id: user.id, sena_id: sena.id })
        });
        currentPracticeSessionId = session.id;
    }

    async function finalizePracticeSession() {
        if (!currentPracticeSessionId) return;
        try {
            await apiRequest(`/sesiones-practica/${currentPracticeSessionId}/finalizar`, { method: 'POST' });
        } catch (err) {
            console.warn('No se pudo finalizar la sesión:', err);
        }
        currentPracticeSessionId = null;
    }

    async function openArMode() {
        const sena = getCurrentSena();
        if (!sena) {
            alert('Primero selecciona una seña.');
            return;
        }

        arModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (arSignLabel) arSignLabel.textContent = sena.nombre;
        renderArGuide(sena.videoReferenciaUrl);
        resetScore();

        try {
            await createPracticeSession();
            await startVision('practice', sena);
            arStreamActive = true;
            refreshArStream();
            ensureGhostHandAR().start();
            ensureVisionSocket();
        } catch (err) {
            console.error(err);
            alert('No se pudo iniciar la práctica guiada desde el backend.');
            closeArMode();
        }
    }

    async function closeArMode() {
        arStreamActive = false;
        clearArStream();
        if (ghostHandAR) ghostHandAR.stop();
        if (arCheckmark) arCheckmark.classList.add('hidden');
        if (arModal) arModal.classList.add('hidden');
        if (arGuideWrapper) arGuideWrapper.innerHTML = '';
        document.body.style.overflow = '';
        await finalizePracticeSession();

        if (mainStreamActive) {
            await startVision('preview', getCurrentSena());
            refreshMainStream();
        } else {
            await stopVisionService();
            closeVisionSocket();
        }
    }

    function handleVisionEvent(event) {
        const percent = Math.max(0, Math.min(100, Math.round((event.score || 0) * 100)));
        if (scoreDisplay) scoreDisplay.textContent = `Precisión: ${percent}%`;
        if (arProgressFill && arStreamActive) arProgressFill.style.width = `${percent}%`;
        if (arStreamActive) updateArStatus(event);
        if (arStreamActive && ghostHandAR) ghostHandAR.updateLandmarks(event.landmarks || null);

        if (event.estado === 'success') {
            showMainSuccess(event.feedback);
            if (arStreamActive) {
                showArSuccess();
                playSuccessChime();
                window.clearTimeout(successTimeout);
                successTimeout = window.setTimeout(() => {
                    if (arStreamActive && btnArNext) btnArNext.click();
                }, SUCCESS_AUTO_ADVANCE_MS);
            }
        } else if (!mainStreamActive) {
            feedbackOverlay.classList.add('hidden');
        }
    }

    btnCamera.addEventListener('click', async () => {
        if (mainStreamActive) await stopMainCamera();
        else await startMainCamera();
    });

    if (btnArMode) btnArMode.addEventListener('click', openArMode);
    if (btnCloseAr) btnCloseAr.addEventListener('click', closeArMode);

    if (arModal) {
        arModal.addEventListener('click', (event) => {
            if (event.target === arModal) closeArMode();
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && arModal && !arModal.classList.contains('hidden')) {
            closeArMode();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (!senas.length) return;
        currentIndex = (currentIndex - 1 + senas.length) % senas.length;
        renderCurrentSena();
        syncVisionTarget().catch(console.warn);
    });

    btnNext.addEventListener('click', () => {
        if (!senas.length) return;
        currentIndex = (currentIndex + 1) % senas.length;
        renderCurrentSena();
        syncVisionTarget().catch(console.warn);
    });

    if (btnArNext) {
        btnArNext.addEventListener('click', async () => {
            if (!senas.length) return;
            currentIndex = (currentIndex + 1) % senas.length;
            renderCurrentSena();
            await syncVisionTarget();
        });
    }

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

    document.querySelectorAll('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', () => closeModal(document.getElementById(button.dataset.closeModal)));
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
    resetScore();
    cargarSenas();
});
