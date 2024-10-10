// Cargar el script de sonido
const script = document.createElement('script');
script.src = 'ruta/al/tu/sonido.js'; // Cambia esta ruta al archivo de tu script de sonido
document.head.appendChild(script);

// Obtener el control deslizante y el valor del volumen
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const sampleAudio = document.getElementById('sampleAudio');

// Establecer el volumen inicial
volumeSlider.value = 1; // Valor inicial del volumen (1 = 100%)
sampleAudio.volume = volumeSlider.value;

// Actualizar el volumen y mostrar el valor
volumeSlider.addEventListener('input', () => {
    const volume = volumeSlider.value;
    volumeValue.textContent = Math.round(volume * 100) + '%';
    sampleAudio.volume = volume; // Cambiar el volumen del audio
});
