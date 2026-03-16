document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('user-video');
    const btnCamera = document.getElementById('btn-camera');
    const feedbackOverlay = document.getElementById('feedback-overlay');

    // Variables de estado
    let stream = null;

    // Función para iniciar la cámara
    async function startCamera() {
        try {
            // Pedimos acceso a la cámara
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            // Asignamos el stream de video al elemento HTML
            videoElement.srcObject = stream;
            btnCamera.textContent = 'Apagar Cámara';
            btnCamera.classList.replace('secondary', 'primary');

        } catch (err) {
            console.error("Error al acceder a la cámara: ", err);
            alert("Por favor, permite el acceso a la cámara para poder practicar.");
        }
    }

    // Función para detener la cámara
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
            stream = null;
            btnCamera.textContent = 'Activar Cámara';
            btnCamera.classList.replace('primary', 'secondary');
        }
    }

    // Evento del botón de la cámara
    btnCamera.addEventListener('click', () => {
        if (stream) {
            stopCamera();
        } else {
            startCamera();
        }
    });

    // Simulador de éxito (para que veas cómo se vería cuando el usuario hace bien la seña)
    // En el futuro, MediaPipe llamará a esta función
    function simulateSuccess() {
        if(stream) {
            feedbackOverlay.classList.remove('hidden');
            setTimeout(() => {
                feedbackOverlay.classList.add('hidden');
            }, 2000);
        }
    }

    // Puedes probar el feedback dando clic en el botón "Siguiente Seña" por ahora
    document.getElementById('btn-next').addEventListener('click', () => {
        simulateSuccess();
        // Aquí luego pondremos lógica para cambiar el texto de la seña actual
    });
});