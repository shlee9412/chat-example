import express from 'express';
import SocketIO from 'socket.io';
import morgan from 'morgan';
import { createServer } from 'http';
import os from 'os';
import path from 'path';

const PORT = 8080;
const userArr = [];

const app = express();
const server = createServer(app);
const io = new SocketIO.Server(server);

io.on('connection', socket => {
  let name: string;
  
  socket.on('enter', (n: string) => {
    if (n === '') return socket.disconnect();
    name = n;
    userArr.push(name);
    io.emit('enter', name);
  });

  socket.on('msg', msg => {
    io.emit('msg', name, msg);
  });

  socket.on('disconnect', () => {
    if (name) io.emit('leave', name);
    const index = userArr.indexOf(name);
    if (index === -1) return;
    userArr.splice(index, 1);
  });
});

server.listen(PORT, '0.0.0.0', 10000, () => {
  const interfaces = os.networkInterfaces();
  console.log('\n======= Chat Example =======\n');
  Object.keys(interfaces).forEach(i => interfaces[i].forEach(d => d.family === 'IPv4' ? console.log(`> http://${d.address}:${PORT}`) : null));
  console.log('\n============================\n');

  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/js', express.static(path.resolve(__dirname, '..', 'node_modules')));
  app.use(express.static(path.resolve(__dirname, '..', 'public')));

  app.get('/check', (req, res) => {
    const { name } = req.query;
    res.json({ result: userArr.indexOf(name) === -1 });
  });
});