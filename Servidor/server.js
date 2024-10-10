const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Cliente/index.html');
});

app.use(express.static(path.join(__dirname, 'cliente')));

const salas = {};
function generarIdUnico() {
  return crypto.randomUUID();
}

io.on('connection', (socket) => {
  const salasDisponibles = (salas) => {
    return Object.keys(salas) 
      .filter((key) => salas[key].estado !== 'jugando') //  && salas[key].jugadores.some(jugador => jugador.id === socket.id)
      .reduce((obj, key) => {
        obj[key] = salas[key]; 
        return obj;
      }, {});
  };
  
  console.log('Un usuario se ha conectado');

  socket.on('crear-sala', (nombreJugador) => {
    const salaId = generarIdUnico();
    salas[salaId] = {
      jugadores: [{ id: socket.id, nombre: nombreJugador, puntaje: 0 }],
      estado: 'esperando', // esperando/jugando
    };
    socket.join(salaId);
    socket.emit('sala-creada', salaId);

    
    socket.broadcast.emit('lista-salas',  salasDisponibles(salas)); // Notificar a todos los clientes menos la session actual
  });

  socket.on('unirse-a-sala', (salaId, nombreJugador) => {
    if (salas[salaId] && salas[salaId].estado === 'esperando' && salas[salaId].jugadores.length < 2) {
      salas[salaId].jugadores.push({ id: socket.id, nombre: nombreJugador, puntaje: 0 });
      socket.join(salaId);

      // Si es el segundo jugador, iniciar la partida
      if (salas[salaId].jugadores.length === 2) {
        salas[salaId].estado = 'jugando';
        io.to(salaId).emit('partida-lista', salas[salaId].jugadores);
      }

      io.emit('lista-salas', salasDisponibles(salas));
    } else {
      socket.emit('error-sala', 'La sala no existe o está llena');
    }
  });

  socket.on('obtener-salas', () => {
    socket.emit('lista-salas', salasDisponibles(salas));
  });

  socket.on('actualizar-puntaje', (salaId, nuevoPuntaje) => {
    const jugador = salas[salaId].jugadores.find(j => j.id === socket.id);
    if (jugador) {
      jugador.puntaje = nuevoPuntaje;
      io.to(salaId).emit('puntajes-actualizados', salas[salaId].jugadores);
    }
  });

  socket.on('movimiento', (salaId, posicion) => {
    // Enviar la posición del jugador a los demás en la sala
    socket.to(salaId).emit('movimiento-jugador', socket.id, posicion);
  });

  socket.on('disconnect', () => {
    // Eliminar al jugador de la sala y actualizar el estado de la sala si es necesario
    for (const salaId in salas) {
      const index = salas[salaId].jugadores.findIndex(j => j.id === socket.id);
      if (index !== -1) {
        salas[salaId].jugadores.splice(index, 1);
        if (salas[salaId].jugadores.length === 0) {
          delete salas[salaId]; // Eliminar la sala si no hay jugadores
        } else {
          salas[salaId].estado = 'esperando'; // Cambiar el estado a esperando
        }
        io.emit('lista-salas', salasDisponibles(salas)); // Actualizar la lista de salas
        break;
      }
    }
    console.log('Un usuario se ha desconectado');
  });
});

http.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});