var config = {
  type: Phaser.AUTO,
  width: 1395,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

var score = 0;
var diamondCount = 0; // Contador de diamantes
var emeraldCount = 0; // Contador de esmeraldas
var scoreText;
var diamondText;
var emeraldText;
var gameOver = false;
var game = new Phaser.Game(config);

let platforms;
let player;
let cursors;
let stars;
let diamonds; // Grupo de diamantes
let emeralds; // Grupo de esmeraldas
let bombs;
let lasers;
let fireButton; // Tecla para disparar
let spaceBar;
var leftPressed = false;
var rightPressed = false;
var jumpPressed = false;

function preload() {
  this.load.image("sky", "assets/Fondo4.jpg");
  this.load.image("ground", "assets/platformlava.png");
  this.load.image("ground2", "assets/suelo_lava_renderized.jpg");
  this.load.image("star", "assets/star.png");
  this.load.image("diamond", "assets/diamanted.png"); // Cargar imagen del diamante
  this.load.image("emerald", "assets/esmeraldad.png"); // Cargar imagen de la esmeralda
  this.load.image("bomb", "assets/bomb.png");
  this.load.image("laser", "assets/star.png"); // Cargar láser rojo
  this.load.spritesheet("dude", "assets/personaje-2.png", {
    frameWidth: 32,
    frameHeight: 48,
  });


  this.load.image("leftButton", "assets/Boton_izquierda.png");  // Imagen para el botón izquierdo
  this.load.image("rightButton", "assets/boton-derecha.png");  // Imagen para el botón derecho
  this.load.image("jumpButton", "assets/Boton arriba.png");


  this.load.image("laserButton", "assets/disparar.png"); // Imagen para el botón de lanzar láser
  this.load.image("slideButton", "assets/deslizarse.png"); // Imagen para el botón de deslizarse

  this.load.audio("backgroundMusic", "assets/Musicadefondo.mp3"); // Reemplaza la ruta con la del archivo de sonido
  this.load.audio(
    "collectStarSound",
    "assets/pieza-de-estrella-conseguida.mp3"
  );
  this.load.audio(
    "collectDiamondSound",
    "assets/pieza-de-estrella-conseguida.mp3"
  );
  this.load.audio(
    "collectEmeraldSound",
    "assets/pieza-de-estrella-conseguida.mp3"
  );
}

function isMobile() {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


let movingPlatform; // Variable para la plataforma que se moverá
let platformSpeed = 100; // Velocidad de la plataforma

function create() {
  this.add.image(700, 200, "sky");

  // Crear el objeto de sonido
  var music = this.sound.add("backgroundMusic");

  // Reproducir el sonido al iniciar el juego
  music.play({
    loop: true, // Si deseas que el sonido se reproduzca en bucle
    volume: 0.5, // Ajusta el volumen si lo necesitas
  });

  if (isMobile()) {
    // Crear botones táctiles solo si es móvil
    leftButton = this.add.image(50, game.config.height - 50, 'leftButton').setInteractive();
    rightButton = this.add.image(200, game.config.height - 50, 'rightButton').setInteractive();
    jumpButton = this.add.image(game.config.width - 50, game.config.height - 50, 'jumpButton').setInteractive();
    // Botón para lanzar láser
    fireButtonMobile = this.add.image(game.config.width - 500, game.config.height - 50, 'laserButton').setInteractive();

    // Botón para deslizarse
    slideButton = this.add.image(550, game.config.height - 50, 'slideButton').setInteractive();

    // Escalar los botones
    leftButton.setScale(0.5);
    rightButton.setScale(0.5);
    jumpButton.setScale(0.5);
    fireButtonMobile.setScale(0.5);
    slideButton.setScale(0.5);

    // Asegurarse de que los botones estén por encima de todo lo demás
    leftButton.setDepth(10);
    rightButton.setDepth(10);
    jumpButton.setDepth(10);
    fireButtonMobile.setDepth(10);
    slideButton.setDepth(10);
    // Añadir las interacciones a los botones
    leftButton.on('pointerdown', function () {
      leftPressed = true;
    });
    leftButton.on('pointerup', function () {
      leftPressed = false;
    });

    rightButton.on('pointerdown', function () {
      rightPressed = true;
    });
    rightButton.on('pointerup', function () {
      rightPressed = false;
    });

    jumpButton.on('pointerdown', function () {
      jumpPressed = true;
    });
    jumpButton.on('pointerup', function () {
      jumpPressed = false;
    });

    // Añadir funcionalidad al botón de lanzar láser
    fireButtonMobile.on('pointerdown', function () {
      fireLaser(); // Llamar a la función para disparar un láser
    });

    // Añadir funcionalidad al botón de deslizarse
    slideButton.on('pointerdown', function () {
      // Aquí puedes añadir la lógica para deslizarse
      // Por ejemplo, podrías modificar la velocidad o la animación del jugador
      player.setVelocityX(0); // Detener el movimiento
      player.anims.play("slide"); // Suponiendo que tengas una animación de deslizamiento
    });
    slideButton.on('pointerup', function () {
      // Aquí puedes regresar a la animación normal o detener el deslizamiento
      if (cursors.left.isDown) {
        player.anims.play("left", true);
      } else if (cursors.right.isDown) {
        player.anims.play("right", true);
      } else {
        player.anims.play("turn");
      }
    });
  }

  this.collectStarSound = this.sound.add("collectStarSound");
  this.collectDiamondSound = this.sound.add("collectDiamondSound");
  this.collectEmeraldSound = this.sound.add("collectEmeraldSound");

  platforms = this.physics.add.staticGroup();
  platforms.create(550, 550, "ground2").setScale(1).refreshBody();
  platforms.create(50, 100, "ground");
  platforms.create(200, 250, "ground");
  platforms.create(750, 100, "ground");
  platforms.create(50, 400, "ground");
  platforms.create(750, 400, "ground");
  platforms.create(1200, 300, "ground");

  player = this.physics.add.sprite(100, 450, "dude");
  player.setCollideWorldBounds(true);
  player.setBounce(0.2);






  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });


  this.physics.add.collider(player, platforms);
  cursors = this.input.keyboard.createCursorKeys();
  fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X); // Tecla X para disparar

  // Agregar el grupo de estrellas
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 100 },
    collideWorldBounds: true // Para evitar que salgan de la pantalla
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
    child.setCollideWorldBounds(true); // Asegurarse de que cada estrella no salga de la pantalla
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  // Agregar el grupo de diamantes
  diamonds = this.physics.add.group({
    key: "diamond",
    repeat: 5,
    setXY: { x: 200, y: 0, stepX: 150 }, // Posición inicial
  });

  diamonds.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
  });

  this.physics.add.collider(diamonds, platforms);
  this.physics.add.overlap(player, diamonds, collectDiamond, null, this);

  // Agregar el grupo de esmeraldas
  emeralds = this.physics.add.group({
    key: "emerald",
    repeat: 5,
    setXY: { x: 400, y: 0, stepX: 150 }, // Posición inicial
  });

  emeralds.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.5));
  });

  this.physics.add.collider(emeralds, platforms);
  this.physics.add.overlap(player, emeralds, collectEmerald, null, this);

  scoreText = this.add.text(16, 16, "Estrellas: 0", {
    fontSize: "25px",
    fill: "#ff0",
    fontFamily: "Orbitron, sans-serif",
    padding: { x: 10, y: 5 },
    borderColor: "#ffffff",
    borderThickness: 2,
    align: "center",
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: "#000",
      blur: 3,
      stroke: true,
      fill: true,
    },
  });

  // Texto para diamantes, colocado al lado del texto de estrellas
  diamondText = this.add.text(300, 16, "Diamantes: 0", {
    fontSize: "25px",
    fill: "#00ffd8",
    fontFamily: "Orbitron, sans-serif",
    padding: { x: 10, y: 5 },
    borderColor: "#ffffff",
    borderThickness: 2,
    align: "center",
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: "#000",
      blur: 3,
      stroke: true,
      fill: true,
    },
  });

  // Texto para esmeraldas, colocado al lado del texto de diamantes
  emeraldText = this.add.text(600, 16, "Esmeraldas: 0", {
    fontSize: "25px",
    fill: "#0f0",
    fontFamily: "Orbitron, sans-serif",
    padding: { x: 10, y: 5 },
    borderColor: "#ffffff",
    borderThickness: 2,
    align: "center",
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: "#000",
      blur: 3,
      stroke: true,
      fill: true,
    },
  });

  // Grupo de bombas
  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  // Grupo de láseres
  lasers = this.physics.add.group({
    defaultKey: "laser",
  });

  // Colisión entre láseres y bombas
  this.physics.add.collider(lasers, bombs, destroyBomb, null, this);

  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // Tecla para impulsarse
}

function update() {
  if (gameOver) {
    return;
  }



  lasers.children.iterate(function(laser) {
    if (laser && laser.y < 0) { // Si el láser sale de la parte superior de la pantalla
      laser.destroy(); // Destruir el láser
    }
  });

  const speed = 200; // Velocidad normal
  const boostSpeed = 3000; // Velocidad al impulsarse

  // Movimiento hacia la izquierda
  if (cursors.left.isDown || leftPressed) {
    player.setVelocityX(-speed);
    player.anims.play("left", true);

    // Impulsar hacia la izquierda
    if (Phaser.Input.Keyboard.JustDown(spaceBar) && diamondCount > 0) {
      player.setVelocityX(-boostSpeed); // Impulso hacia la izquierda
      diamondCount -= 1; // Restar un diamante
      updateDiamondText(); // Actualizar el texto de diamantes
    }
  }
       // Movimiento hacia la derecha
  else if (cursors.right.isDown || rightPressed) {
    player.setVelocityX(speed);
    player.anims.play("right", true);

    // Impulsar hacia la derecha
    if (Phaser.Input.Keyboard.JustDown(spaceBar) && diamondCount > 0) {
      player.setVelocityX(boostSpeed); // Impulso hacia la derecha
      diamondCount -= 1; // Restar un diamante
      updateDiamondText(); // Actualizar el texto de diamantes
    }
  }
  // Sin movimiento
  else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  // Salto
  if ((cursors.up.isDown || jumpPressed) && player.body.touching.down) {
    player.setVelocityY(-700);
  }

  // Disparar láser al presionar la tecla X
  if (Phaser.Input.Keyboard.JustDown(fireButton)) {
    fireLaser();
  }
}

// Función para actualizar el texto de diamantes
function updateDiamondText() {
  diamondText.setText("Diamantes: " + diamondCount);
}

// Función para disparar un láser
// Función para disparar un láser
function fireLaser() {
  if (score >= 5) {
    // Asegúrate de tener suficiente puntuación
    let laser = lasers.get(player.x, player.y - 2); // Posición del láser
    if (laser) {
      laser.setActive(true);
      laser.setVisible(true);
      laser.body.allowGravity = false; // El láser no cae por gravedad

      // Determinar dirección del disparo
      if (cursors.left.isDown) {
        laser.setVelocityX(-500); // Disparar hacia la izquierda
      } else if (cursors.right.isDown) {
        laser.setVelocityX(500); // Disparar hacia la derecha
      } else {
        laser.setVelocityX(0); // No se mueve horizontalmente
        laser.setVelocityY(-500); // Disparar hacia arriba
      }

      // Restar una estrella al disparar un láser
      score -= 5;
      scoreText.setText("Estrellas: " + score);
    }
  } else {
    console.log("No tienes suficientes estrellas para disparar");
  }
}

// Función para destruir una bomba al impactar con el láser
function destroyBomb(laser, bomb) {
  laser.setActive(false); // Desactivar el láser
  laser.setVisible(false); // Hacer el láser invisible
  bomb.disableBody(true, true); // Destruir la bomba
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText("Estrellas: " + score);

  // Reproducir sonido al recolectar una estrella
  this.collectStarSound.play();

  if (
    stars.countActive(true) === 0 &&
    diamonds.countActive(true) === 0 &&
    emeralds.countActive(true) === 0
  ) {
    regenerateAllObjects();
  }
}

function collectDiamond(player, diamond) {
  diamond.disableBody(true, true);
  diamondCount += 3;
  diamondText.setText("Diamantes: " + diamondCount);

  // Reproducir sonido al recolectar un diamante
  this.collectDiamondSound.play();

  if (
    stars.countActive(true) === 0 &&
    diamonds.countActive(true) === 0 &&
    emeralds.countActive(true) === 0
  ) {
    regenerateAllObjects();
  }
}

function collectEmerald(player, emerald) {
  emerald.disableBody(true, true);
  emeraldCount += 1;
  emeraldText.setText("Esmeraldas: " + emeraldCount);

  // Reproducir sonido al recolectar una esmeralda
  this.collectEmeraldSound.play();

  if (
    stars.countActive(true) === 0 &&
    diamonds.countActive(true) === 0 &&
    emeralds.countActive(true) === 0
  ) {
    regenerateAllObjects();
  }
}

// Función para regenerar estrellas, diamantes y esmeraldas
function regenerateAllObjects() {
  // Regenerar estrellas
  stars.children.iterate(function (child) {
    child.enableBody(true, child.x, 0, true, true);
  });

  // Regenerar diamantes
  diamonds.children.iterate(function (child) {
    child.enableBody(true, child.x, 0, true, true);
  });

  // Regenerar esmeraldas
  emeralds.children.iterate(function (child) {
    child.enableBody(true, child.x, 0, true, true);
  });

  // Crear una nueva bomba
  var x =
    player.x < 400
      ? Phaser.Math.Between(400, 800)
      : Phaser.Math.Between(0, 400);
  var bomb = bombs.create(x, 16, "bomb");
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

  var x =
    player.x < 400
      ? Phaser.Math.Between(400, 800)
      : Phaser.Math.Between(0, 400);
  var bomb = bombs.create(x, 16, "bomb");
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
}

// Función para manejar el impacto de la bomba
function hitBomb(player, bomb) {
  this.physics.pause(); // Pausar la física
  player.setTint(0xff0000); // Cambiar el color del jugador
  player.anims.play("turn"); // Cambiar a la animación de 'turn'
  gameOver = true; // Cambiar el estado del juego a 'gameOver'

  // Mostrar el modal
  document.getElementById("gameOverModal").style.display = "flex"; // Cambia el estilo para mostrar el modal

  // Actualizar el contenido del modal con los puntos obtenidos
  document.getElementById("estrellasCount").textContent = score; // Mostrar puntos de estrellas
  document.getElementById("diamantesCount").textContent = diamondCount; // Mostrar puntos de diamantes
  document.getElementById("esmeraldasCount").textContent = emeraldCount; // Mostrar puntos de esmeraldas

  // Agregar evento al botón de reiniciar
  document.getElementById("retryBtn").addEventListener("click", function () {
    location.reload(); // Recargar la página para reiniciar el juego
  });
}