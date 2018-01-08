const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const PORT = 4000;
const app = express();

const server = http.createServer(app)
const io = socketio(server)

server.listen(PORT, () => {
  console.log(`start server ${PORT}`);
})

app.use('/build', express.static('build'))
app.get('/', (req, res) => {
  res.redirect('/build');
})

io.on('connection', socket => {
  let roomId;
  console.log(`접속 : ${socket.client.id}`);
  //console.log(socket, '<< [ socket ]');
  const param = {
    id : socket.client.id,
  };

  socket.on('join', (data, ack) => {
    roomId = data.id;
    socket.leaveAll();
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('connectUser', param);
    //ack(param);
  })

  socket.on('disconnect', () => {
    socket.broadcast.to(roomId).emit('disconnectUser', param);
  })

  socket.on('chatMsg', msg => {
    console.dir(msg);
    //io.emit('chatMsg', msg);
    
    if(roomId === '0'){
      console.log(roomId, '<< [ roomId ]');
      //io.emit('chatMsg', msg);
      io.sockets.emit('chatMsg', msg);
    }
    socket.broadcast.to(roomId).emit('chatMsg', msg);
  })
})
