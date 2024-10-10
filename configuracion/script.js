// Seleccionamos el cuerpo del documento
const body = document.querySelector("body");

// Creamos un contenedor para las estrellas
const space = document.createElement("div");
space.id = "space";
body.appendChild(space);

// Función para crear una estrella
function createStar() {
    const star = document.createElement("div");
    star.classList.add("star");
    
    // Asignar un tamaño aleatorio entre 1px y 3px para simular estrellas pequeñas y grandes
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Posicionarla en un lugar aleatorio de la pantalla
    star.style.top = `${Math.random() * 100}vh`;
    star.style.left = `${Math.random() * 100}vw`;
    
    // Añadir la estrella al espacio
    space.appendChild(star);
}

// Crear 100 estrellas
for (let i = 0; i < 100; i++) {
    createStar();
}

// Cada 5 segundos creamos más estrellas para añadir dinamismo al fondo
setInterval(() => {
    createStar();
}, 5000);
