var leftArrow = document.getElementById("left-arrow");
var rightArrow = document.getElementById("right-arrow");
var upArrow = document.getElementById("up-arrow");
var downArrow = document.getElementById("down-arrow");

// Eventos de toque para las flechas
leftArrow.addEventListener("touchstart", function () {
  dinoVelX = -velocidadMovimiento; // Mover a la izquierda
});

rightArrow.addEventListener("touchstart", function () {
  dinoVelX = velocidadMovimiento; // Mover a la derecha
});

upArrow.addEventListener("touchstart", function () {
  dinoVelY = velocidadMovimiento; // Mover hacia arriba
});

downArrow.addEventListener("touchstart", function () {
  dinoVelY = -velocidadMovimiento; // Mover hacia abajo
});

// Detener el movimiento al soltar la flecha
leftArrow.addEventListener("touchend", function () {
  dinoVelX = 0; // Detener el movimiento
});

rightArrow.addEventListener("touchend", function () {
  dinoVelX = 0; // Detener el movimiento
});

upArrow.addEventListener("touchend", function () {
  dinoVelY = 0; // Detener el movimiento
});

downArrow.addEventListener("touchend", function () {
  dinoVelY = 0; // Detener el movimiento
});

/*Deshabilitar zoom con Ctrl + Rueda del ratón
document.addEventListener(
  "wheel",
  function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);
*/

// Deshabilitar zoom con Ctrl + teclas (+ o -)
document.addEventListener("keydown", function (e) {
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "+" || e.key === "-" || e.key === "=")
  ) {
    e.preventDefault();
  }
});

//****** CODIGO DEL JUEGO  ********//
var time = new Date();
var deltaTime = 0;

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(Init, 1);
} else {
  document.addEventListener("DOMContentLoaded", Init);
}

// Función de cuenta regresiva antes de iniciar el juego
function iniciaConteo(duration, callback) {
  var countdownElement = document.querySelector(".conteo");
  countdownElement.style.display = "block"; // Mostrar el contador

  var remainingTime = duration;
  countdownElement.innerHTML = remainingTime;

  var countdownInterval = setInterval(function () {
    remainingTime -= 1;
    countdownElement.innerHTML = remainingTime;

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownElement.style.display = "none"; // Ocultar el contador
      callback(); // Iniciar el juego
    }
  }, 1000);
}

// Modifica Init para que el juego empiece después del conteo
function Init() {
  iniciaConteo(3, function () {
    // Cuenta regresiva de 3 segundos
    time = new Date();
    Start();
    Loop();

    var backgroundMusic = document.getElementById("background-music");
    backgroundMusic.play();
  });
}

function Loop() {
  deltaTime = (new Date() - time) / 1000;
  time = new Date();
  Update();
  requestAnimationFrame(Loop);
}

//****** LOGICA DEL JUEGO  ********//
var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY;

var sueloX = 0;
var velEscenario = 1280 / 3;
var gameVel = 1;
var score = 0;
var scoreAste = 0;

var parado = false;
var saltando = false;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

var tiempoHastaEstrella = 0.5;
var tiempoEstrellaMin = 0.5;
var tiempoEstrellaMax = 2.5;
var estrellas = [];

var tiempoRestante = 60; // Tiempo en segundos
var temporizador; // Variable para guardar el intervalo

function IniciarTemporizador() {
  temporizador = setInterval(function () {
    tiempoRestante -= 1;
    document.querySelector(".temporizador").innerHTML = tiempoRestante;

    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      FinalizarJuego(); // Finaliza el juego cuando llega a 0
    }
  }, 1000);
}

var tiempoHastaObstaculo = 1.5; // Tiempo entre la creación de obstáculos
var tiempoObstaculoMin = 1.0; // Mínimo tiempo entre obstáculos
var tiempoObstaculoMax = 3.0; // Máximo tiempo entre obstáculos
var obstaculos = []; // Array para almacenar los obstáculos

function DecidirCrearObstaculos() {
  tiempoHastaObstaculo -= deltaTime;
  if (tiempoHastaObstaculo <= 0) {
    CrearObstaculo();
  }
}

function CrearObstaculo() {
  var obstaculo = document.createElement("div");
  contenedor.appendChild(obstaculo);
  obstaculo.classList.add("obstaculo");

  // Posicionar el obstáculo en el lado derecho y en una ubicación aleatoria en el eje Y
  obstaculo.posX = contenedor.clientWidth;
  obstaculo.style.left = contenedor.clientWidth + "px";

  // Generar una posición Y aleatoria dentro del contenedor
  var randomY = Math.random() * (contenedor.clientHeight - 50);
  obstaculo.style.top = randomY + "px";

  obstaculos.push(obstaculo);
  tiempoHastaObstaculo =
    tiempoObstaculoMin +
    Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin);
}

function MoverObstaculos() {
  var factorVelocidadOpstaculos = 1.7; // Ajusta la velocidad de los obstáculos

  for (var i = obstaculos.length - 1; i >= 0; i--) {
    if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
      obstaculos[i].parentNode.removeChild(obstaculos[i]);
      obstaculos.splice(i, 1);
    } else {
      obstaculos[i].posX -=
        CalcularDesplazamiento() * factorVelocidadOpstaculos;
      obstaculos[i].style.left = obstaculos[i].posX + "px";
    }
  }
}

function VerificarColisionObstaculos() {
  var collisionSound = document.getElementById("collision-sound2"); // Obtener el sonido de colisión
  var puntuacionCambio = document.getElementById("puntuacionCambio"); // Obtener el elemento para mostrar el cambio

  for (var i = obstaculos.length - 1; i >= 0; i--) {
    var obstaculo = obstaculos[i];
    var dinoRect = dino.getBoundingClientRect();
    var obstaculoRect = obstaculo.getBoundingClientRect();

    const margin = 20; // Ajustar según sea necesario

    if (
      dinoRect.left + margin < obstaculoRect.left + obstaculoRect.width &&
      dinoRect.left + dinoRect.width - margin > obstaculoRect.left &&
      dinoRect.top + margin < obstaculoRect.top + obstaculoRect.height &&
      dinoRect.top + dinoRect.height - margin > obstaculoRect.top
    ) {
      scoreAste += 1;
      // Aquí va la lógica de colisión
      if (score > 0) {
        score -= 2; // Solo resta si el score es mayor a 0
      } else {
        score = 0; // Si no, el score se queda en 0
      }

      textoScore.innerHTML = score; // Actualizar puntuación
      textoScoreAste.innerHTML = scoreAste; // Actualizar puntuación
      puntuacionCambio.innerHTML = "-2"; // Mostrar cambio de puntuación
      puntuacionCambio.style.color = "red"; // Cambiar el color a rojo
      setTimeout(() => {
        puntuacionCambio.innerHTML = "";
      }, 1000); // Ocultar después de 1 segundo

      collisionSound.play(); // Reproducir el sonido de colisión
      dino.classList.add("dino-parpadeo"); // Añadir clase de parpadeo al dino
      obstaculo.parentNode.removeChild(obstaculo); // Eliminar el obstáculo
      obstaculos.splice(i, 1); // Quitar el obstáculo de la lista

      // Remover la clase de parpadeo después de 1.5 segundos
      setTimeout(() => {
        dino.classList.remove("dino-parpadeo");
      }, 1500);
    }
  }
}

function GanarPunto() {
  score += 1; // Incrementar los puntos
  textoScore.innerHTML = score; // Actualizar puntuación
  puntuacionCambio.innerHTML = "+1"; // Mostrar cambio de puntuación
  puntuacionCambio.style.color = "green"; // Cambiar el color a verde
  setTimeout(() => {
    puntuacionCambio.innerHTML = "";
  }, 1000); // Ocultar después de 1 segundo
}

function DecidirCrearEstrellas() {
  tiempoHastaEstrella -= deltaTime;
  if (tiempoHastaEstrella <= 0) {
    CrearEstrella();
  }
}

function CrearEstrella() {
  var estrella = document.createElement("div");
  contenedor.appendChild(estrella);
  estrella.classList.add("estrella");

  // Posicionar la estrella en el lado derecho y en una ubicación aleatoria en el eje Y
  estrella.posX = contenedor.clientWidth;
  estrella.style.left = contenedor.clientWidth + "px";

  // Generar una posición Y aleatoria en el contenedor
  var randomY = Math.random() * (contenedor.clientHeight - 50);
  estrella.style.top = randomY + "px";

  // También puedes definir un rango en el que quieras que aparezcan las estrellas
  var randomX = Math.random() * contenedor.clientWidth; // Para posicionar en el eje X
  estrella.style.left = randomX + "px"; // Cambiamos la posición en el eje X

  estrellas.push(estrella);
  tiempoHastaEstrella =
    tiempoEstrellaMin + Math.random() * (tiempoEstrellaMax - tiempoEstrellaMin);
}

function MoverEstrellas() {
  var factorVelocidadEstrellas = 2; // Ajusta este valor para cambiar la velocidad de las estrellas

  for (var i = estrellas.length - 1; i >= 0; i--) {
    if (estrellas[i].posX < -estrellas[i].clientWidth) {
      estrellas[i].parentNode.removeChild(estrellas[i]);
      estrellas.splice(i, 1);
    } else {
      estrellas[i].posX -= CalcularDesplazamiento() * factorVelocidadEstrellas;
      estrellas[i].style.left = estrellas[i].posX + "px";
    }
  }
}

function Start() {
  gameOver = document.querySelector(".game-over");
  suelo = document.querySelector(".suelo");
  contenedor = document.querySelector(".contenedor");
  textoScore = document.querySelector(".score");
  textoScoreAste = document.querySelector(".scoreAste");

  dino = document.querySelector(".dino");
  document.addEventListener("keydown", HandleKeyDown);
  IniciarTemporizador(); // Inicia el temporizador
}

function Update() {
  if (parado) return;

  MoverDinosaurio();
  MoverSuelo();
  DecidirCrearEstrellas();
  MoverEstrellas();
  VerificarColisionEstrellas(); // Verifica colisiones con estrellas
}

// Variables para la velocidad del dinosaurio
var velocidadMovimiento = 300; // Velocidad en píxeles por segundo
var dinoVelX = 0; // Velocidad en el eje X
var dinoVelY = 0; // Velocidad en el eje Y

function HandleKeyDown(ev) {
  if (ev.keyCode === 37) {
    // Flecha izquierda
    dinoVelX = -velocidadMovimiento; // Mover a la izquierda
  } else if (ev.keyCode === 39) {
    // Flecha derecha
    dinoVelX = velocidadMovimiento; // Mover a la derecha
  } else if (ev.keyCode === 38) {
    // Flecha arriba
    dinoVelY = velocidadMovimiento; // Mover hacia arriba
  } else if (ev.keyCode === 40) {
    // Flecha abajo
    dinoVelY = -velocidadMovimiento; // Mover hacia abajo
  }
}

function Update() {
  if (parado) return;

  // Actualizar posiciones del dinosaurio
  dinoPosX += dinoVelX * deltaTime; // Desplazamiento en X
  dinoPosY += dinoVelY * deltaTime; // Desplazamiento en Y

  // Limitar el movimiento
  if (dinoPosX < 0) dinoPosX = 0;
  if (dinoPosX > contenedor.clientWidth - dino.clientWidth) {
    dinoPosX = contenedor.clientWidth - dino.clientWidth;
  }
  if (dinoPosY < 0) dinoPosY = 0;
  if (dinoPosY > contenedor.clientHeight - dino.clientHeight) {
    dinoPosY = contenedor.clientHeight - dino.clientHeight;
  }

  // Actualizar la posición del dinosaurio
  dino.style.left = dinoPosX + "px";
  dino.style.bottom = dinoPosY + "px";

  MoverSuelo();
  DecidirCrearEstrellas();
  MoverEstrellas();
  VerificarColisionEstrellas(); // Verifica colisiones con estrellas

  DecidirCrearObstaculos();
  MoverObstaculos();
  VerificarColisionObstaculos(); // Verifica colisiones con obstáculos

  velY -= gravedad * deltaTime;
}

function VerificarColisionEstrellas() {
  var collisionSound = document.getElementById("collision-sound"); // Obtener el sonido

  for (var i = estrellas.length - 1; i >= 0; i--) {
    var estrella = estrellas[i];
    var dinoRect = dino.getBoundingClientRect();
    var estrellaRect = estrella.getBoundingClientRect();

    if (
      dinoRect.x < estrellaRect.x + estrellaRect.width &&
      dinoRect.x + dinoRect.width > estrellaRect.x &&
      dinoRect.y < estrellaRect.y + estrellaRect.height &&
      dinoRect.y + dinoRect.height > estrellaRect.y
    ) {
      // Colisión detectada
      score += 1; // Sumar 1 punto
      textoScore.innerHTML = score; // Actualizar la puntuación

      // Mostrar cambio de puntuación
      puntuacionCambio.innerHTML = "+1"; // Mostrar cambio de puntuación
      puntuacionCambio.style.color = "green"; // Cambiar el color a verde
      setTimeout(() => {
        puntuacionCambio.innerHTML = "";
      }, 1000); // Ocultar después de 1 segundo

      collisionSound.play(); // Reproducir el sonido de colisión
      estrella.parentNode.removeChild(estrella); // Eliminar la estrella
      estrellas.splice(i, 1); // Eliminar de la lista de estrellas
    }
  }
}

// Detener movimiento cuando se suelta la tecla
document.addEventListener("keyup", function (ev) {
  if (ev.keyCode === 37 || ev.keyCode === 39) {
    dinoVelX = 0; // Detener el movimiento horizontal
  }
  if (ev.keyCode === 38 || ev.keyCode === 40) {
    dinoVelY = 0; // Detener el movimiento vertical
  }
});

function Saltar() {
  if (dinoPosY === sueloY) {
    saltando = true;
    velY = impulso;
  }
}

function MoverDinosaurio() {
  dinoPosY += velY * deltaTime;
  if (dinoPosY < sueloY) {
    TocarSuelo();
  }
  dino.style.bottom = dinoPosY + "px";
}

function MoverSuelo() {
  sueloX -= CalcularDesplazamiento();
  if (sueloX <= -1200) {
    sueloX = 0;
  }
  suelo.style.backgroundPositionX = sueloX + "px";
}

function CalcularDesplazamiento() {
  return (velEscenario * deltaTime) / gameVel;
}

function FinalizarJuego() {
  parado = true;

  // Mostrar el modal
  var modal = document.getElementById("modalFinal");
  modal.style.display = "block";

  // Actualizar el texto del score dentro del modal
  var textoScore = document.getElementById("textoScore");
  textoScore.innerHTML = "<span class='juego-terminado'><strong>¡Juego terminado!</strong></span>";
  textoScore.innerHTML += "<br><span class='score-estrellas'>Estrellas: " + score + "</span>";
  textoScore.innerHTML += "<br><span class='score-asteroides'>Asteroides: " + scoreAste + "</span>";

  // Ocultar otros elementos de la interfaz del juego
  document.querySelectorAll(".puntos, .tiempo, .temporizador, .scoreAste, .Asteimg, .estrellaimg, .controls").forEach(function(el) {
    el.style.display = "none";
  });

  // Detener la música de fondo
  var backgroundMusic = document.getElementById("background-music");
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }

  // Botón de "Ir al Lobby"
  document.getElementById("lobbyBtn").onclick = function() {
    window.location.href = "lobby.html"; // Cambia esta línea a la URL del lobby
  };

  // Botón de "Salir del Juego"
  document.getElementById("exitBtn").onclick = function() {
    window.close(); // Esto cierra la ventana del navegador
  };
}







// ------------------------- FONDO ESTELAR ---------------------------------

const canvas = document.getElementById("rainfall");
const ctx = canvas.getContext("2d");

// Función para ajustar el tamaño del canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Llamada inicial para establecer el tamaño del canvas al cargar
resizeCanvas();

// Ajustar el tamaño del canvas cuando cambie el tamaño de la ventana
window.addEventListener('resize', resizeCanvas);

// Crear un array para almacenar las estrellas
const raindrops = [];

// Función para crear una nueva estrella
function createRaindrop() {
  const x = canvas.width + 1; // Empieza fuera del lado derecho del canvas
  const y = Math.random() * canvas.height; // Posición vertical aleatoria
  const speed = Math.random() * 3 + 3; // Velocidad de la estrella
  const length = Math.random() * 9 + 2; // Longitud de la estrella

  raindrops.push({ x, y, speed, length });
}

// Función para actualizar las posiciones de las estrellas
function updateRaindrops() {
  for (let i = 0; i < raindrops.length; i++) {
    const raindrop = raindrops[i];

    raindrop.x -= raindrop.speed; // Se mueve a la izquierda

    // Eliminar estrella si sale del lado izquierdo del canvas
    if (raindrop.x < -raindrop.length) {
      raindrops.splice(i, 1);
      i--;
    }
  }
}

// Función para dibujar las estrellas
function drawRaindrops() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "white"; // Color de las estrellas
  ctx.lineWidth = 2; // Grosor de las líneas

  for (let i = 0; i < raindrops.length; i++) {
    const raindrop = raindrops[i];

    ctx.beginPath();
    ctx.moveTo(raindrop.x, raindrop.y);
    ctx.lineTo(raindrop.x - raindrop.length, raindrop.y); // Dibujar la estrella hacia la izquierda
    ctx.stroke();
  }
}

// Función para animar las estrellas
function animate() {
  createRaindrop(); // Crear nueva estrella
  updateRaindrops(); // Actualizar posiciones
  drawRaindrops(); // Dibujar estrellas
  requestAnimationFrame(animate); // Volver a ejecutar
}

// Iniciar la animación
animate();
