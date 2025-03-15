import fs  from 'fs'
import debug from 'debug'

const rooms = []; // {id: string, players: {id: name}, pieces_list: [char], isPlaying: bool, death: [string]}
const logerror = debug('tetris:error') , loginfo = debug('tetris:info');
const pieces = ['L', 'J', 'T', 'Z', 'S', 'O', 'I'];
const generate_list = (length) => Array.from(Array(length), () => getRandomBlock());

function getRandomBlock() {
    return pieces[Math.floor(Math.random() * pieces.length)]
}

function room_reset(id) {
  rooms[id].death = Object.keys(rooms[id].players);
  rooms[id].isPlaying = false;
  rooms[id].pieces_list = generate_list(50);
}
function create_spectrum(board) {
  const spec = new Array(board[0].length);
  
  for(let i = 0; i < board[0].length; i++) {
    spec[i] = board.length;
    for(let j = 0; j < board.length; j++) {
      if(board[j][i] !== 'Empty') {
        spec[i] = j;
        break;
      }
    }
  }
  return spec;
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
    const player = Object.keys( rooms[i].players).indexOf(id);
    if(player !== -1) {
      return i;
    }
  }
  return -1;
}

function init_room(room, id, user) {
  const res = {isLocked: false, leader: true, name: user}
  for(let i = 0; i < rooms.length; i++) {
    if (rooms[i].id === room) {
      if (!rooms[i].isPlaying) {
        if(Object.values(rooms[i].players).includes(user)) {
          res.name = null;
          return res
        }
        rooms[i].players[id] = res.name;
        rooms[i].death.push(id);
        res.leader = false;
      } else
        res.isLocked = true;
      return res;
    }
  }
  rooms.push({id: room, players: {[id]: res.name}, pieces_list: generate_list(50), isPlaying: false, death: [id]});
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
      const roomIndex = find_room_id(socket.id);
      if(roomIndex !== -1) {
        rooms[roomIndex].death.splice(rooms[roomIndex].death.indexOf(socket.id), 1);
        if(Object.keys(rooms[roomIndex].players).length === 1 && rooms[roomIndex].death.length === 0) {
          socket.emit('win', {message: 'You\'re dead'})
          room_reset(roomIndex);
        }
        else if(rooms[roomIndex].death.length === 1 && Object.keys(rooms[roomIndex].players).length > 1) {
          io.in(rooms[roomIndex].id).emit('win', {message: `${rooms[roomIndex].players[rooms[roomIndex].death[0]]} won`});
          room_reset(roomIndex);
        }
      }
    })

    socket.on('commit', (payload) => {
      const roomIndex = find_room_id(socket.id);
      if(roomIndex === -1)
        return;
      if(payload.handicap)
        socket.to(rooms[roomIndex].id).emit('handicap', {amount: payload.handicap - 1});
      const spec = create_spectrum(payload.board);
      socket.to(rooms[roomIndex].id).emit('opponent_board_update', {board: spec, name: rooms[roomIndex].players[socket.id]});
    });

    socket.on('join_request', (payload) => {
      const res = init_room(payload.room, socket.id, payload.user);
      
      console.log(rooms);
      if (res.name === null)
        socket.emit('error', {message: 'Name already picked Choose an other one.'});
      else if(res.isLocked)
        socket.emit('error', {message: 'Room is in game. Try again later'});
      else {
        socket.join(payload.room);
        socket.emit('join_room', {isLeader: res.leader});
      }
    });

    socket.on('start_game', (data) => {
      console.log('start_game');
      const roomIndex = find_room_id(socket.id);
      if(roomIndex === -1 || socket.id !== Object.keys(rooms[roomIndex].players)[0])
        return;
      rooms[roomIndex].isPlaying = true;
      io.in(rooms[roomIndex].id).emit('start_game', {gamemode: data.gamemode});
    })
    socket.on("disconnect", () => {
      console.log('disconect', socket.id);
      const roomIndex = find_room_id(socket.id);
      if (roomIndex !== -1) {
        const keys = Object.keys(rooms[roomIndex].players);
        if(keys.indexOf(socket.id) === 0 && keys.length > 1) {
          socket.to(keys[1]).emit('join_room', {isLeader: true, name: rooms[roomIndex].players[keys[1]]});
        }
        delete(rooms[roomIndex].players[socket.id]);
        rooms[roomIndex].death.splice(rooms[roomIndex].death.indexOf(socket.id), 1);
        if (keys.length === 1)
          rooms.splice(roomIndex, 1);
      }
    });
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
