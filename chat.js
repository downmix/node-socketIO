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

  const param = {
    id : socket.client.id,
  };

  socket.on('join', data => {
    roomId = data.id;
    socket.leaveAll();
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('connectUser', param);
  })

  socket.on('disconnect', () => {
    socket.broadcast.to(roomId).emit('disconnectUser', param);
  })

  socket.on('chatMsg', msg => {
    console.dir(msg);
    
    //글로벌채널의 경우 전체전송
    if(roomId === '0'){
      io.sockets.emit('chatMsg', msg);
    }else{
      socket.broadcast.to(roomId).emit('chatMsg', msg);
    }
  })
})
