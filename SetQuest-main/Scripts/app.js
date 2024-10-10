let carousel = document.querySelector('.carousel');
let seeMoreButtons = document.querySelectorAll('.seeMore');
let backButton = document.getElementById('back');

// Funcionalidad de los botones "Ver más"
seeMoreButtons.forEach((button) => {
    button.onclick = function(){
        carousel.classList.remove('next', 'prev');
        carousel.classList.add('showDetail');
    }
});

// Funcionalidad del botón "Volver"
backButton.onclick = function(){
    carousel.classList.remove('showDetail');
}
