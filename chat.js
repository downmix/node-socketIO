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
  console.log(`접속 : ${socket.client.id}`);

  socket.on('chatMsg', msg => {
    console.dir(msg);
    io.emit('chatMsg', msg);
  })
})
