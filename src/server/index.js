import fs  from 'fs'
import debug from 'debug'
import { SocketAddress } from 'net';

const rooms = []; // {id: string, players: [int], pieces_list: [char], isPlaying: bool}
const logerror = debug('tetris:error') , loginfo = debug('tetris:info');
const pieces = ['L', 'J', 'T', 'Z', 'S', 'O', 'I'];
const generate_list = (length) => Array.from(Array(length), () => getRandomBlock());

function getRandomBlock() {
    return pieces[Math.floor(Math.random() * pieces.length)]
}

function get_piece(id, index) {
  const i = find_room_id(id);
  if(i !== -1) {
    if(index === rooms[i].pieces_list.length)
      rooms[i].pieces_list = rooms[i].pieces_list.concat(generate_list(50));
    return rooms[i].pieces_list[index];
  }
  return getRandomBlock();
}

function find_room_id(id) {
  for(let i = 0; i < rooms.length; i++) {
    const player = rooms[i].players.indexOf(id);
    if(player !== -1) {
      return i;
    }
  }
  return -1;
}

function init_room(room, id) {
  const res = {index: -1, full: false, leader: true}
  for(let i = 0; i < rooms.length; i++) {
    if (rooms[i].id === room) {
      if (rooms[i].players.length === 1) {
        res.index = i;
        res.leader = false;
        rooms[i].players.push(id);
      }
      else
        res.full = true;
      return res;
    }
  }
  res.id = (rooms.push({id: room, players: [id], pieces_list: generate_list(50), isPlaying: false})) - 1;
  return res;
}

const initApp = (app, params, cb) => {
  const {host, port} = params
  const handler = (req, res) => {
    const urlParts = req.url.split('/').filter(part => part !== '');
    if (urlParts[urlParts.length - 1] === 'bundle.js' && urlParts.length === 2) {
      fs.readFile(__dirname + '/../../build/bundle.js', (err, data) => {
        if (err) {
          logerror(err)
          res.writeHead(500)
          return res.end('Error loading bundle.js')
        }
        res.writeHead(300)
        res.end(data)
      })
    } else if(urlParts[urlParts.length - 1] === 'style.css' && urlParts.length === 2) {
      fs.readFile(__dirname + '/../../style.css', (err, data) => {
        if (err) {
          logerror(err)
          res.writeHead(500)
          return res.end('Error loading style.css')
        }
        res.writeHead(200)
        res.end(data)
      })
    }
    else if (urlParts.length === 2 && !req.url.endsWith('/')) {
      fs.readFile(__dirname + '/../../index.html', (err, data) => {
        if (err) {
          logerror(err)
          res.writeHead(500)
          return res.end('Error loading index.html')
        }
        res.writeHead(200)
        res.end(data)
      })
    } else {
      res.writeHead(404)
      res.end('Please enter the URL in that format: http://<server_name_or_ip>:<port>/<room>/<player_name>')
    }
  }

  app.on('request', handler)

  app.listen({host, port}, () =>{
    loginfo(`tetris listen on ${params.url}`)
    cb()
  })
}

const initEngine = io => {
  io.on('connection', function(socket){
    loginfo("Socket connected: " + socket.id)
    socket.on('get_piece', (payload) => {
      const piece = get_piece(socket.id, payload.index);
      socket.emit('new_piece', {piece: piece});
    });

    socket.on('dead', () => {
      console.log(socket.id + " is dead");
    })

    socket.on('commit', (payload) => {
      const roomIndex = find_room_id(socket.id);
      if(payload.handicap)
        socket.to(rooms[roomIndex].id).emit('handicap', {amount: payload.handicap - 1});
    });

    socket.on('join_request', (payload) => {
      const res = init_room(payload.room, socket.id);
      console.log(rooms);
      if(res.full)
        socket.emit('error', {message: 'Room full'});
      socket.join(payload.room);
      socket.emit('join_room', {isLeader: res.leader});
    });

    socket.on('start_game', () => {
      console.log('start_game');
      const roomIndex = find_room_id(socket.id);
      if(roomIndex === -1 || socket.id !== rooms[roomIndex].players[0])
        return;
      rooms[roomIndex].isPlaying = true;
      io.to(rooms[roomIndex].id).emit('start_game');
    })
  })
}

export function create(params){
  const promise = new Promise( (resolve, reject) => {
    const app = require('http').createServer();
    initApp(app, params, () =>{
      const io = require('socket.io')(app, {
        cors: {
          origin: "http://localhost:8080",
        }
      });

      const stop = (cb) => {
        io.close()
        app.close( () => {
          app.unref()
        })
        loginfo(`Engine stopped.`)
        cb()
      }

      initEngine(io)
      resolve({stop})
    })
  })
  return promise
}
