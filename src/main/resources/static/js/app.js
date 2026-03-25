document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api';
    const tokenKey = 'authToken';
    const userKey = 'authUser';

    // Main-page DOM refs
    const videoElement    = document.getElementById('user-video');
    const btnCamera       = document.getElementById('btn-camera');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const lessonList      = document.getElementById('lesson-list');
    const currentSign     = document.getElementById('current-sign');
    const currentCategory = document.getElementById('current-category');
    const currentDifficulty = document.getElementById('current-difficulty');
    const guideVideoWrapper = document.getElementById('guide-video-wrapper');

    const btnPrev         = document.getElementById('btn-prev');
    const btnNext         = document.getElementById('btn-next');
    const btnLoginOpen    = document.getElementById('btn-login-open');
    const btnRegisterOpen = document.getElementById('btn-register-open');
    const btnLogout       = document.getElementById('btn-logout');
    const btnAdmin        = document.getElementById('btn-admin');
    const loginModal      = document.getElementById('login-modal');
    const registerModal   = document.getElementById('register-modal');
    const loginForm       = document.getElementById('login-form');
    const registerForm    = document.getElementById('register-form');

    // AR-modal DOM refs
    const btnArMode    = document.getElementById('btn-ar-mode');
    const btnCloseAr   = document.getElementById('btn-close-ar');
    const arModal      = document.getElementById('ar-modal');
    const arVideoEl    = document.getElementById('ar-video');
    const arCanvas     = document.getElementById('ar-canvas');
    const arStatus     = document.getElementById('ar-status');
    const arCheckmark  = document.getElementById('ar-checkmark');
    const arSignLabel  = document.getElementById('ar-sign-label');

    let stream    = null;   // main camera stream
    let arStream  = null;   // AR modal camera stream
    let senas     = [];
    let currentIndex = -1;
    let arSystem  = null;

    // ============================================================
    // AUTH & API
    // ============================================================

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

    function openModal(modal) { modal.classList.remove('hidden'); }
    function closeModal(modal) { modal.classList.add('hidden'); }

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

    // ============================================================
    // LESSONS
    // ============================================================

    function parseYouTubeEmbed(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/;
        const match = url.match(regex);
        if (!match) return null;
        const videoId = match[1];
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
        return `https://www.youtube.com/embed/${videoId}`;
    }

    function renderGuideVideo(url) {
        guideVideoWrapper.replaceChildren();
        if (!url) { guideVideoWrapper.textContent = 'Sin video de referencia disponible.'; return; }
        const youtubeEmbed = parseYouTubeEmbed(url);
        if (youtubeEmbed) {
            const iframe = document.createElement('iframe');
            iframe.className = 'guide-frame';
            iframe.src = youtubeEmbed;
            iframe.title = 'Video guía de seña';
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

    function renderCurrentSena() {
        if (!senas.length || currentIndex < 0) {
            currentSign.textContent = '"Sin selección"';
            currentCategory.textContent = 'Sin categoría';
            currentDifficulty.textContent = 'Dificultad: -';
            renderGuideVideo('');
            if (arSystem) arSystem.hideGhostHand();
            return;
        }
        const sena = senas[currentIndex];
        currentSign.textContent = `"${sena.nombre}"`;
        currentCategory.textContent = sena.categoria;
        currentDifficulty.textContent = `Dificultad: ${sena.dificultad}`;
        renderGuideVideo(sena.videoReferenciaUrl);
        const items = lessonList.querySelectorAll('li');
        items.forEach((item, idx) => item.classList.toggle('active', idx === currentIndex));
        // Update AR modal sign label and ghost hand pose if the modal is open
        if (arSignLabel) arSignLabel.textContent = sena.nombre;
        if (arSystem && arStream) arSystem.setTargetSign(sena.nombre, sena.id);
    }

    function renderLessonList() {
        lessonList.innerHTML = '';
        senas.forEach((sena, index) => {
            const li = document.createElement('li');
            li.textContent = `${sena.nombre} • ${sena.categoria}`;
            li.addEventListener('click', () => { currentIndex = index; renderCurrentSena(); });
            lessonList.appendChild(li);
        });
        if (senas.length > 0) { currentIndex = 0; renderCurrentSena(); }
        else renderCurrentSena();
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

    // ============================================================
    // GHOST-HAND AR – POSE LIBRARY
    // ============================================================

    const HAND_CONNECTIONS = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17]
    ];

    // Base landmark positions: wrist at origin, y-UP, middle-MCP at ~[0,1,0]
    const BASE_EXT = [
        [0, 0, 0],          // 0  wrist
        [.3, .2, 0],        // 1  thumb cmc
        [.5, .4, 0],        // 2  thumb mcp
        [.65, .6, 0],       // 3  thumb ip
        [.75, .82, 0],      // 4  thumb tip
        [.25, .85, 0],      // 5  index mcp
        [.25, 1.3, 0],      // 6  index pip
        [.25, 1.65, 0],     // 7  index dip
        [.25, 1.9, 0],      // 8  index tip
        [0, 1.0, 0],        // 9  middle mcp
        [0, 1.5, 0],        // 10 middle pip
        [0, 1.85, 0],       // 11 middle dip
        [0, 2.1, 0],        // 12 middle tip
        [-.25, .85, 0],     // 13 ring mcp
        [-.25, 1.3, 0],     // 14 ring pip
        [-.25, 1.6, 0],     // 15 ring dip
        [-.25, 1.85, 0],    // 16 ring tip
        [-.45, .7, 0],      // 17 pinky mcp
        [-.45, 1.1, 0],     // 18 pinky pip
        [-.45, 1.35, 0],    // 19 pinky dip
        [-.45, 1.55, 0]     // 20 pinky tip
    ];

    const BASE_CURL = [
        [0, 0, 0],          // 0  wrist
        [.3, .2, 0],        // 1  thumb cmc
        [.45, .5, .05],     // 2  thumb mcp
        [.45, .7, .1],      // 3  thumb ip
        [.4, .85, .1],      // 4  thumb tip
        [.25, .85, 0],      // 5  index mcp
        [.3, 1.05, .1],     // 6  index pip
        [.28, .9, .15],     // 7  index dip
        [.22, .75, .15],    // 8  index tip
        [0, 1.0, 0],        // 9  middle mcp
        [.05, 1.15, .1],    // 10 middle pip
        [.03, .98, .15],    // 11 middle dip
        [-.02, .85, .15],   // 12 middle tip
        [-.25, .85, 0],     // 13 ring mcp
        [-.2, 1.0, .1],     // 14 ring pip
        [-.22, .85, .15],   // 15 ring dip
        [-.25, .72, .15],   // 16 ring tip
        [-.45, .7, 0],      // 17 pinky mcp
        [-.42, .85, .1],    // 18 pinky pip
        [-.43, .75, .12],   // 19 pinky dip
        [-.45, .63, .12]    // 20 pinky tip
    ];

    function lp3(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }

    function buildPose({ th = 1, idx = 1, mid = 1, rng = 1, pnk = 1 } = {}) {
        return BASE_EXT.map((ext, i) => {
            const curl = BASE_CURL[i];
            const t = i <= 4 ? th : i <= 8 ? idx : i <= 12 ? mid : i <= 16 ? rng : pnk;
            return lp3(curl, ext, t);
        });
    }

    const SIGN_POSES = {
        'default':   buildPose(),
        'hola':      buildPose(),
        'adios':     buildPose(),
        'bienvenido':buildPose(),
        'gracias':   buildPose({ th: 1, idx: 0, mid: 0, rng: 0, pnk: 0 }),
        'si':        buildPose({ th: .3, idx: 0, mid: 0, rng: 0, pnk: 1 }),
        'no':        buildPose({ th: .3, idx: 1, mid: .8, rng: 0, pnk: 0 }),
        'por favor': buildPose({ th: .5, idx: .5, mid: .5, rng: .5, pnk: .5 }),
        'amor':      buildPose({ th: 1, idx: 1, mid: 0, rng: 0, pnk: 1 }),
        'bien':      buildPose({ th: 1, idx: 0, mid: 0, rng: 0, pnk: 0 }),
        'mal':       buildPose({ th: 0, idx: 0, mid: 0, rng: 0, pnk: 0 }),
        'fist':      buildPose({ th: .2, idx: 0, mid: 0, rng: 0, pnk: 0 }),
        'a':         buildPose({ th: .5, idx: 0, mid: 0, rng: 0, pnk: 0 }),
        'b':         buildPose({ th: 0, idx: 1, mid: 1, rng: 1, pnk: 1 }),
        'c':         buildPose({ th: .5, idx: .5, mid: .5, rng: .5, pnk: .5 }),
        'd':         buildPose({ th: .2, idx: 1, mid: .1, rng: .1, pnk: .1 }),
        'e':         buildPose({ th: .1, idx: .1, mid: .1, rng: .1, pnk: .1 }),
        'f':         buildPose({ th: .1, idx: .1, mid: 1, rng: 1, pnk: 1 }),
        'g':         buildPose({ th: .8, idx: 1, mid: 0, rng: 0, pnk: 0 }),
        'h':         buildPose({ th: .3, idx: 1, mid: 1, rng: 0, pnk: 0 }),
        'i':         buildPose({ th: .3, idx: 0, mid: 0, rng: 0, pnk: 1 }),
        'j':         buildPose({ th: .3, idx: 0, mid: 0, rng: 0, pnk: 1 }),
        'k':         buildPose({ th: .6, idx: 1, mid: .7, rng: 0, pnk: 0 }),
        'l':         buildPose({ th: 1, idx: 1, mid: 0, rng: 0, pnk: 0 }),
        'm':         buildPose({ th: .1, idx: .1, mid: .1, rng: .1, pnk: 0 }),
        'n':         buildPose({ th: .1, idx: .1, mid: .1, rng: 0, pnk: 0 }),
        'o':         buildPose({ th: .3, idx: .3, mid: .3, rng: .3, pnk: .3 }),
        'p':         buildPose({ th: .6, idx: 1, mid: .7, rng: 0, pnk: 0 }),
        'q':         buildPose({ th: .6, idx: 1, mid: 0, rng: 0, pnk: 0 }),
        'r':         buildPose({ th: .3, idx: 1, mid: 1, rng: 0, pnk: 0 }),
        's':         buildPose({ th: .2, idx: 0, mid: 0, rng: 0, pnk: 0 }),
        't':         buildPose({ th: .5, idx: .1, mid: 0, rng: 0, pnk: 0 }),
        'u':         buildPose({ th: .3, idx: 1, mid: 1, rng: 0, pnk: 0 }),
        'v':         buildPose({ th: .3, idx: 1, mid: 1, rng: 0, pnk: 0 }),
        'w':         buildPose({ th: .3, idx: 1, mid: 1, rng: 1, pnk: 0 }),
        'x':         buildPose({ th: .3, idx: .4, mid: 0, rng: 0, pnk: 0 }),
        'y':         buildPose({ th: 1, idx: 0, mid: 0, rng: 0, pnk: 1 }),
        'z':         buildPose({ th: .3, idx: 1, mid: 0, rng: 0, pnk: 0 }),
        '1':         buildPose({ th: .3, idx: 1, mid: 0, rng: 0, pnk: 0 }),
        '2':         buildPose({ th: .3, idx: 1, mid: 1, rng: 0, pnk: 0 }),
        '3':         buildPose({ th: .8, idx: 1, mid: 1, rng: 0, pnk: 0 }),
        '4':         buildPose({ th: 0, idx: 1, mid: 1, rng: 1, pnk: 1 }),
        '5':         buildPose()
    };

    function findPoseForSign(name) {
        if (!name) return SIGN_POSES['default'];
        const lower = name.toLowerCase().trim();
        if (SIGN_POSES[lower]) return SIGN_POSES[lower];
        for (const [key, pose] of Object.entries(SIGN_POSES)) {
            if (key !== 'default' && (lower.includes(key) || key.includes(lower))) return pose;
        }
        return SIGN_POSES['default'];
    }

    // ============================================================
    // GHOST-HAND AR – THREE.JS + MEDIAPIPE CLASS
    // ============================================================

    // AR tuning constants (documented for clarity)
    const AR_FRAME_INTERVAL_MS   = 66;   // ~15 fps (66 ms) for MediaPipe inference
    const SIMILARITY_SUCCESS     = 0.82; // Normalised similarity score → "match"
    const SIMILARITY_ERROR       = 0.48; // Below this score → "mismatch"
    const SIMILARITY_NORM_FACTOR = 1.5;  // Max expected avg fingertip distance (normalised units)
    const SUCCESS_LOCK_MS        = 3000; // How long the success state is held
    const FEEDBACK_DURATION_MS   = 2500; // How long the overlay / checkmark are shown

    class GhostHandAR {
        constructor(videoEl, canvasEl, statusEl) {
            this.videoEl  = videoEl;
            this.canvasEl = canvasEl;
            this.statusEl = statusEl;
            this.enabled        = false;
            this.targetPose     = null;
            this.currentSenaId  = null;
            this.state          = 'idle';
            this.successLocked  = false;
            this.onSuccess      = null;
            this._busy          = false;
            this._lastFrameTs   = 0;
            this._particles     = [];
            this._defaultScale  = 0.18;
            this._defaultAnchor = { x: 0.5, y: 0.35 };

            this._initThreeJS();
            this._initMediaPipe();
            this._renderLoop();
            this._watchResize();
        }

        // ----------------------------------------------------------
        // Three.js setup
        // ----------------------------------------------------------
        _initThreeJS() {
            if (typeof THREE === 'undefined') { this._threeOk = false; return; }
            this._threeOk = true;

            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasEl, alpha: true, antialias: true });
            this.renderer.setClearColor(0x000000, 0);

            this.scene  = new THREE.Scene();
            this.threeCamera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 10);
            this.threeCamera.position.set(0.5, 0.5, 5);

            this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
            const pt = new THREE.PointLight(0x00e5ff, 2.5, 8);
            pt.position.set(0.5, 0.8, 3);
            this.scene.add(pt);

            this.ghostGroup = new THREE.Group();
            this.scene.add(this.ghostGroup);

            this.jointMeshes = [];
            const jointGeo = new THREE.SphereGeometry(0.011, 10, 7);
            for (let i = 0; i < 21; i++) {
                const mat = new THREE.MeshPhongMaterial({
                    color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.5,
                    transparent: true, opacity: 0.78
                });
                const mesh = new THREE.Mesh(jointGeo, mat);
                this.jointMeshes.push(mesh);
                this.ghostGroup.add(mesh);
            }

            this.boneLines = [];
            HAND_CONNECTIONS.forEach(([a, b]) => {
                const mat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.55 });
                const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
                const line = new THREE.Line(geo, mat);
                this.boneLines.push({ line, a, b });
                this.ghostGroup.add(line);
            });

            this.particleGroup = new THREE.Group();
            this.scene.add(this.particleGroup);

            this.ghostGroup.visible = false;
            this._resizeRenderer();
        }

        _resizeRenderer() {
            if (!this._threeOk) return;
            const host = this.canvasEl.parentElement || this.videoEl.parentElement;
            const w = host?.clientWidth
                || this.videoEl.clientWidth
                || this.canvasEl.clientWidth
                || this.videoEl.offsetWidth
                || 640;
            const h = host?.clientHeight
                || this.videoEl.clientHeight
                || this.canvasEl.clientHeight
                || this.videoEl.offsetHeight
                || 480;
            if (w > 0 && h > 0) this.renderer.setSize(w, h, false);
        }

        // Public alias so callers don't access a private method
        resizeRenderer() { this._resizeRenderer(); }

        _watchResize() {
            if (typeof ResizeObserver === 'undefined') return;
            const ro = new ResizeObserver(() => this._resizeRenderer());
            ro.observe(this.videoEl);
        }

        // ----------------------------------------------------------
        // MediaPipe setup
        // ----------------------------------------------------------
        _initMediaPipe() {
            if (typeof Hands === 'undefined') { this._mpOk = false; return; }
            this._mpOk = true;
            this.hands = new Hands({
                locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${f}`
            });
            this.hands.setOptions({
                maxNumHands: 1, modelComplexity: 1,
                minDetectionConfidence: 0.7, minTrackingConfidence: 0.5
            });
            this.hands.onResults(r => this._onHandResults(r));
        }

        // ----------------------------------------------------------
        // Render loop
        // ----------------------------------------------------------
        _renderLoop() {
            const loop = ts => {
                requestAnimationFrame(loop);
                this._updateParticles();
                if (this._threeOk) this.renderer.render(this.scene, this.threeCamera);
                // Throttle MediaPipe to ~15 fps
                if (this.enabled && this._mpOk && !this._busy && ts - this._lastFrameTs > AR_FRAME_INTERVAL_MS) {
                    if (this.videoEl.readyState >= 2) {
                        this._lastFrameTs = ts;
                        this._busy = true;
                        this.hands.send({ image: this.videoEl }).catch(() => {}).finally(() => { this._busy = false; });
                    }
                }
            };
            requestAnimationFrame(loop);
        }

        // ----------------------------------------------------------
        // Public API
        // ----------------------------------------------------------
        enable()  { this.enabled = true; }
        disable() { this.enabled = false; this.hideGhostHand(); }

        setTargetSign(signName, senaId) {
            this.targetPose    = findPoseForSign(signName);
            this.currentSenaId = senaId;
            this.state         = 'active';
            this.successLocked = false;
            if (this._threeOk) {
                this.ghostGroup.visible = true;
                this._setColor('cyan');
                this._renderPoseAt(this.targetPose, this._defaultAnchor, this._defaultScale);
            }
            this._setStatus('active', '👻 RA activa');
        }

        hideGhostHand() {
            if (this._threeOk) this.ghostGroup.visible = false;
            this.state = 'idle';
            this._setStatus('hidden', '');
        }

        // ----------------------------------------------------------
        // MediaPipe results handler
        // ----------------------------------------------------------
        _onHandResults(results) {
            if (!this.targetPose || !this.ghostGroup.visible) return;
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                this._trackHand(results.multiHandLandmarks[0]);
            } else {
                if (this._threeOk) this._renderPoseAt(this.targetPose, this._defaultAnchor, this._defaultScale);
                if (this.state !== 'success') {
                    this._setColor('cyan');
                    this._setStatus('active', '👻 RA activa');
                }
            }
        }

        _trackHand(lms) {
            const wrist  = lms[0];
            const midMcp = lms[9];
            const ax = 1 - wrist.x;
            const ay = 1 - wrist.y;
            const mx = 1 - midMcp.x;
            const my = 1 - midMcp.y;
            const palmScale = Math.sqrt((mx - ax) ** 2 + (my - ay) ** 2);
            const scale = palmScale > 0.02 ? palmScale : this._defaultScale;

            if (this._threeOk) this._renderPoseAt(this.targetPose, { x: ax, y: ay }, scale);
            if (this.state === 'success') return;

            const sim = this._similarity(lms, this.targetPose);
            if (sim > SIMILARITY_SUCCESS) {
                this._triggerSuccess(sim);
            } else if (sim < SIMILARITY_ERROR) {
                this._setColor('red');
                this._setStatus('error', '🔴 Ajusta tu mano');
            } else {
                this._setColor('cyan');
                this._setStatus('tracking', `👻 Similitud ${Math.round(sim * 100)}%`);
            }
        }

        // ----------------------------------------------------------
        // Pose rendering
        // ----------------------------------------------------------
        _renderPoseAt(pose, anchor, scale) {
            const wristPose = pose[0];
            const positions = pose.map(([px, py, pz]) => ({
                x: anchor.x + (px - wristPose[0]) * scale,
                y: anchor.y + (py - wristPose[1]) * scale,
                z: (pz - wristPose[2]) * scale * 0.3
            }));
            this.jointMeshes.forEach((m, i) => m.position.set(positions[i].x, positions[i].y, positions[i].z));
            this.boneLines.forEach(({ line, a, b }) => {
                const posA = new THREE.Vector3(positions[a].x, positions[a].y, positions[a].z);
                const posB = new THREE.Vector3(positions[b].x, positions[b].y, positions[b].z);
                line.geometry.setFromPoints([posA, posB]);
                line.geometry.computeBoundingSphere();
            });
        }

        // ----------------------------------------------------------
        // Similarity
        // ----------------------------------------------------------
        _similarity(lms, targetPose) {
            const wrist  = lms[0];
            const midMcp = lms[9];
            const dx = midMcp.x - wrist.x;
            const dy = midMcp.y - wrist.y;
            const palmDist = Math.sqrt(dx * dx + dy * dy);
            if (palmDist < 0.001) return 0;

            const userNorm = lms.map(lm => [
                (lm.x - wrist.x) / palmDist,
                -((lm.y - wrist.y) / palmDist),
                ((lm.z || 0) - (wrist.z || 0)) / palmDist
            ]);

            const tWrist  = targetPose[0];
            const tMcpVec = targetPose[9];
            const td = Math.sqrt((tMcpVec[0] - tWrist[0]) ** 2 + (tMcpVec[1] - tWrist[1]) ** 2);
            const tScale = td > 0.001 ? td : 1;
            const targetNorm = targetPose.map(([px, py]) => [
                (px - tWrist[0]) / tScale,
                (py - tWrist[1]) / tScale
            ]);

            const tips = [4, 8, 12, 16, 20];
            let totalDist = 0;
            for (const i of tips) {
                const ux = userNorm[i][0] - targetNorm[i][0];
                const uy = userNorm[i][1] - targetNorm[i][1];
                totalDist += Math.sqrt(ux * ux + uy * uy);
            }
            return Math.max(0, 1 - (totalDist / tips.length) / SIMILARITY_NORM_FACTOR);
        }

        // ----------------------------------------------------------
        // Success
        // ----------------------------------------------------------
        _triggerSuccess(sim) {
            if (this.successLocked) return;
            this.successLocked = true;
            this.state = 'success';
            this._setColor('green');
            this._setStatus('success', '✅ ¡Perfecto!');
            this._spawnParticles();
            setTimeout(() => {
                this.successLocked = false;
                this.state = 'active';
                this._setColor('cyan');
                this._setStatus('active', '👻 RA activa');
            }, SUCCESS_LOCK_MS);
            if (typeof this.onSuccess === 'function') this.onSuccess(sim, this.currentSenaId);
        }

        // ----------------------------------------------------------
        // Colors
        // ----------------------------------------------------------
        _setColor(state) {
            const palettes = {
                cyan:  { color: 0x00e5ff, emissive: 0x00e5ff, ei: 0.5,  jo: 0.78, bo: 0.55 },
                green: { color: 0x00ff88, emissive: 0x00ff00, ei: 1.2,  jo: 0.92, bo: 0.75 },
                red:   { color: 0xff3355, emissive: 0xff2244, ei: 0.7,  jo: 0.72, bo: 0.55 }
            };
            const p = palettes[state] || palettes.cyan;
            this.jointMeshes.forEach(m => {
                m.material.color.setHex(p.color);
                m.material.emissive.setHex(p.emissive);
                m.material.emissiveIntensity = p.ei;
                m.material.opacity = p.jo;
            });
            this.boneLines.forEach(({ line }) => {
                line.material.color.setHex(p.color);
                line.material.opacity = p.bo;
            });
        }

        // ----------------------------------------------------------
        // Particles
        // ----------------------------------------------------------
        _spawnParticles() {
            if (!this._threeOk) return;
            this.particleGroup.clear();
            this._particles = [];
            const origin = this.jointMeshes[0].position.clone();
            const count  = 24;
            const pGeo   = new THREE.SphereGeometry(0.007, 4, 4);
            for (let i = 0; i < count; i++) {
                const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 1 });
                const mesh = new THREE.Mesh(pGeo, mat);
                mesh.position.copy(origin);
                const angle = (i / count) * Math.PI * 2;
                const speed = 0.006 + Math.random() * 0.006;
                mesh.userData = { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed + 0.004, life: 1.0 };
                this.particleGroup.add(mesh);
                this._particles.push(mesh);
            }
        }

        _updateParticles() {
            this._particles = this._particles.filter(p => {
                p.userData.life -= 0.025;
                if (p.userData.life <= 0) { this.particleGroup.remove(p); return false; }
                p.position.x += p.userData.vx;
                p.position.y += p.userData.vy;
                p.material.opacity = p.userData.life;
                return true;
            });
        }

        // ----------------------------------------------------------
        // Status badge
        // ----------------------------------------------------------
        _setStatus(cls, text) {
            if (!this.statusEl) return;
            this.statusEl.className = 'ar-status';
            if (!text) { this.statusEl.classList.add('hidden'); return; }
            this.statusEl.classList.remove('hidden');
            this.statusEl.textContent = text;
            if (cls === 'tracking') this.statusEl.classList.add('ar-tracking');
            else if (cls === 'success') this.statusEl.classList.add('ar-success');
            else if (cls === 'error')   this.statusEl.classList.add('ar-error');
        }
    }

    // ============================================================
    // AUDIO CUE (Web Audio API – no external file needed)
    // ============================================================

    function playSuccessChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Two-note ascending chime: C5 → E5
            [[523.25, 0], [659.25, 0.18]].forEach(([freq, delay]) => {
                const osc  = ctx.createOscillator();
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
        } catch (_) { /* AudioContext not available – skip silently */ }
    }

    // ============================================================
    // MAIN CAMERA CONTROL
    // ============================================================

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
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
            stream.getTracks().forEach(t => t.stop());
            videoElement.srcObject = null;
            stream = null;
        }
        btnCamera.textContent = 'Activar Cámara';
        btnCamera.classList.replace('primary', 'secondary');
    }

    // ============================================================
    // AR MODAL CONTROL
    // ============================================================

    async function openArMode() {
        if (!arModal) return;
        // Update sign label from current selection
        if (arSignLabel && senas.length && currentIndex >= 0) {
            arSignLabel.textContent = senas[currentIndex].nombre;
        }
        arModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        // Start AR-dedicated camera stream
        try {
            arStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            arVideoEl.srcObject = arStream;
            // Wait for the modal to paint and the video element to have measurable dimensions.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (arSystem) arSystem.resizeRenderer();
                    setTimeout(() => { if (arSystem) arSystem.resizeRenderer(); }, 50);
                });
            });
            if (arVideoEl.readyState < 2) {
                await new Promise(resolve => arVideoEl.addEventListener('loadeddata', resolve, { once: true }));
            }
            await arVideoEl.play().catch(() => {});
            if (arSystem) {
                arSystem.enable();
                if (senas.length && currentIndex >= 0) {
                    const sena = senas[currentIndex];
                    arSystem.setTargetSign(sena.nombre, sena.id);
                } else {
                    arSystem.setTargetSign('default');
                }
                requestAnimationFrame(() => arSystem.resizeRenderer());
            }
        } catch (err) {
            console.error('Error al acceder a la cámara AR:', err);
            closeArMode();
            alert('Por favor, permite el acceso a la cámara para usar el Modo AR.');
        }
    }

    function closeArMode() {
        if (arStream) {
            arStream.getTracks().forEach(t => t.stop());
            arVideoEl.srcObject = null;
            arStream = null;
        }
        if (arSystem) arSystem.disable();
        if (arCheckmark) arCheckmark.classList.add('hidden');
        if (arModal) arModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Success callback: visual checkmark + audio cue + progress API call
    function handleARSuccess(sim, senaId) {
        // Visual checkmark inside the AR modal — re-trigger CSS animation cleanly
        const checkEl = document.getElementById('ar-checkmark');
        if (checkEl) {
            // Force animation replay by toggling the hidden class after a reflow
            checkEl.classList.add('hidden');
            checkEl.offsetWidth; // read offsetWidth to force a reflow and restart the CSS animation
            checkEl.classList.remove('hidden');
            setTimeout(() => checkEl.classList.add('hidden'), FEEDBACK_DURATION_MS);
        }

        // Audio cue
        playSuccessChime();

        // Register progress when logged in
        const user = getStoredUser();
        if (!user || !senaId) return;
        const puntuacion = Math.round(sim * 100);
        apiRequest('/progreso/registrar', {
            method: 'POST',
            body: JSON.stringify({ usuario_id: user.id, sena_id: senaId, puntuacion })
        }).catch(err => console.warn('No se pudo registrar progreso:', err));
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    btnCamera.addEventListener('click', () => { if (stream) stopCamera(); else startCamera(); });

    if (btnArMode)  btnArMode.addEventListener('click', openArMode);
    if (btnCloseAr) btnCloseAr.addEventListener('click', closeArMode);
    // Close AR modal on backdrop click
    if (arModal) {
        arModal.addEventListener('click', e => { if (e.target === arModal) closeArMode(); });
    }
    // Close AR modal on Escape key
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && arModal && !arModal.classList.contains('hidden')) closeArMode(); });

    btnPrev.addEventListener('click', () => {
        if (!senas.length) return;
        currentIndex = (currentIndex - 1 + senas.length) % senas.length;
        renderCurrentSena();
    });

    btnNext.addEventListener('click', () => {
        if (!senas.length) return;
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

    btnAdmin.addEventListener('click', () => { window.location.href = '/admin.html'; });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(document.getElementById(btn.dataset.closeModal)));
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        try {
            const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
            localStorage.setItem(tokenKey, data.token);
            localStorage.setItem(userKey, JSON.stringify(data.usuario));
            updateAuthUI();
            closeModal(loginModal);
            alert(`Bienvenido, ${data.usuario.nombre}`);
            loginForm.reset();
        } catch (err) { alert(err.message); }
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nombre   = document.getElementById('register-name').value.trim();
        const email    = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        try {
            await apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify({ nombre, email, password }) });
            alert('Registro exitoso. Ahora inicia sesión.');
            closeModal(registerModal);
            registerForm.reset();
        } catch (err) { alert(err.message); }
    });

    // ============================================================
    // BOOT
    // ============================================================

    // Initialise AR system only if the modal elements and Three.js are available
    if (arCanvas && arVideoEl && typeof THREE !== 'undefined') {
        arSystem = new GhostHandAR(arVideoEl, arCanvas, arStatus);
        arSystem.onSuccess = (sim, senaId) => handleARSuccess(sim, senaId);
    }

    updateAuthUI();
    cargarSenas();
});
