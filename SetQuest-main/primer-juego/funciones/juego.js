// Clase que representa al jugador
class Player {
    constructor(element) {
        this.element = element;
        this.speed = 20;
        this.positionX = 100;
        this.maxWidth = document.getElementById('gameArea').offsetWidth - this.element.offsetWidth;
        this.updatePosition();
    }

    moveLeft() {
        this.positionX = Math.max(0, this.positionX - this.speed);
        this.updatePosition();
    }

    moveRight() {
        this.positionX = Math.min(this.maxWidth, this.positionX + this.speed);
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = this.positionX + 'px';
    }

    getPosition() {
        return this.element.getBoundingClientRect();
    }
}

// Clase que representa los bloques que caen desde arriba y otorgan puntos
class FallingDiv {
    constructor(container) {
        this.container = container;
        this.div = document.createElement('div');
        this.div.classList.add('falling-div'); // Asigna la clase CSS para los bloques que caen
        this.resetPosition();
        this.container.appendChild(this.div);
        this.isFalling = true;
    }

    resetPosition() {
        this.div.style.top = '0px';
        this.div.style.left = Math.random() * (this.container.offsetWidth - this.div.offsetWidth) + 'px';
        this.isFalling = true;
    }

    fall(speed, player, onBlockCollected) {
        const interval = setInterval(() => {
            if (!this.isFalling) {
                clearInterval(interval);
                return;
            }

            const currentTop = parseInt(this.div.style.top);

            if (this.checkCollision(player)) {
                this.div.style.display = 'none'; // Oculta el bloque
                clearInterval(interval);
                this.isFalling = false;
                onBlockCollected(); // Otorga puntos al jugador
            } else if (currentTop >= this.container.offsetHeight - this.div.offsetHeight) {
                clearInterval(interval);
                this.resetPosition();
                this.fall(speed, player, onBlockCollected); // Reinicia la caída si llega al fondo
            } else {
                this.div.style.top = currentTop + speed + 'px';
            }
        }, 30);
    }

    checkCollision(player) {
        const playerPos = player.getPosition();
        const divPos = this.div.getBoundingClientRect();

        return !(
            divPos.bottom < playerPos.top || 
            divPos.top > playerPos.bottom || 
            divPos.right < playerPos.left || 
            divPos.left > playerPos.right
        );
    }
}


// Clase que representa los asteroides peligrosos que hacen perder al jugador
class DangerousDiv {
    constructor(container) {
        this.container = container;
        this.div = document.createElement('div');
        this.div.classList.add('dangerous-div'); // Asigna la clase CSS peligrosa
        this.resetPosition();
        this.container.appendChild(this.div);
        this.isFalling = true;
    }

    resetPosition() {
        this.div.style.top = '0px';
        this.div.style.left = Math.random() * (this.container.offsetWidth - this.div.offsetWidth) + 'px';
        this.isFalling = true;
    }

    fall(speed, player, onLose) {
        const interval = setInterval(() => {
            if (!this.isFalling) {
                clearInterval(interval);
                return;
            }

            const currentTop = parseInt(this.div.style.top);

            if (this.checkCollision(player)) {
                this.div.style.display = 'none';
                clearInterval(interval);
                this.isFalling = false;
                onLose(); // Llama a la función de pérdida si colisiona
            } else if (currentTop >= this.container.offsetHeight - this.div.offsetHeight) {
                clearInterval(interval);
                this.resetPosition();
                this.fall(speed, player, onLose); // Reinicia la caída si llega al fondo
            } else {
                this.div.style.top = currentTop + speed + 'px';
            }
        }, 30);
    }

    checkCollision(player) {
        const playerPos = player.getPosition();
        const divPos = this.div.getBoundingClientRect();

        return !(
            divPos.bottom < playerPos.top || 
            divPos.top > playerPos.bottom || 
            divPos.right < playerPos.left || 
            divPos.left > playerPos.right
        );
    }
}


// Referencia al área de juego
const gameArea = document.getElementById('gameArea');

// Crear jugador
const player = new Player(document.getElementById('player'));

// Crear bloques normales y bloques peligrosos
const fallingDivs = [];
const totalBlocks = 15;
let blocksCollected = 0;
let score = 0; // Variable de puntuación
const totalDangerousBlocks = 3;

// Temporizador de 1 minuto
let timeLeft = 60;
const timerElement = document.createElement('div');
timerElement.id = 'timer';
timerElement.style.position = 'absolute';
timerElement.style.top = '10px';
timerElement.style.right = '10px';
timerElement.style.fontSize = '24px';
timerElement.style.color = 'red';
gameArea.appendChild(timerElement);

// Crear un elemento para mostrar la puntuación
const scoreElement = document.createElement('div');
scoreElement.id = 'score';
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.fontSize = '24px';
scoreElement.style.color = 'green';
gameArea.appendChild(scoreElement);

function updateTimer() {
    timerElement.textContent = `Tiempo restante: ${timeLeft} segundos`;
    timeLeft--;

    if (timeLeft < 0) {
        onLose();
    }
}

// Función para actualizar la puntuación en pantalla
function updateScore() {
    scoreElement.textContent = `Puntuación: ${score}`;
}

// Inicia el temporizador y lo actualiza cada segundo
const timerInterval = setInterval(updateTimer, 1000);

// Función que se llama cuando se recoge un bloque
function onBlockCollected() {
    blocksCollected++;
    score += 10; // Otorga 10 puntos por cada bloque recogido
    updateScore(); // Actualiza la puntuación en pantalla
    if (blocksCollected === totalBlocks) {
        clearInterval(timerInterval);
        alert("¡Ganaste!");
    }
}

// Función que se llama cuando el jugador pierde
function onLose() {
    clearInterval(timerInterval);
    alert(`¡Perdiste! Puntuación final: ${score}`);
    window.location.reload(); // Recargar el juego
}

// Crear los bloques que caen
for (let i = 0; i < totalBlocks; i++) {
    const div = new FallingDiv(gameArea);
    fallingDivs.push(div);
    div.fall(Math.random() * 3 + 3, player, onBlockCollected);
}

// Crear varios bloques peligrosos
const dangerousDivs = [];
for (let i = 0; i < totalDangerousBlocks; i++) {
    const dangerousDiv = new DangerousDiv(gameArea);
    dangerousDivs.push(dangerousDiv);
    dangerousDiv.fall(Math.random() * 3 + 2, player, onLose);
}

// Evento de teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        player.moveLeft();
    } else if (event.key === 'ArrowRight') {
        player.moveRight();
    }
});

// Soporte para pantallas táctiles
let touchStartX = null;

document.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
});

document.addEventListener('touchmove', (event) => {
    const touchMoveX = event.touches[0].clientX;
    if (touchStartX) {
        if (touchMoveX < touchStartX) {
            player.moveLeft();
        } else if (touchMoveX > touchStartX) {
            player.moveRight();
        }
    }
}); 