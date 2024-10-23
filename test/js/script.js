const socket = new WebSocket('ws://localhost:8080');

socket.onopen = function(){
    console.log('connection estabilished');
};

socket.onclose = function(){
    console.log('connection closed');
};

socket.onerror = function(){
    console.log('connection error'+ error.mensage);
};

    document.addEventListener('submit', function(event) {
        event.preventDefault();
        const mensaje = document.getElementById('mensaje').value;
        socket.send(JSON.stringify({
            mensaje: mensaje
        })
    )
});

socket.onmessage = function (event){
    let data = JSON.parse(event.data);

    alert(`Llego un mensaje de ${data.id}\n dice: ${data.mensaje}`);
}