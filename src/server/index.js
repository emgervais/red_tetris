import fs  from 'fs'
import debug from 'debug'

class Piece {
  constructor() {
    this.pieces = ['L', 'J', 'T', 'Z', 'S', 'O', 'I'];
  }
  getRandomBlock() { return this.pieces[Math.floor(Math.random() * this.pieces.length)] }
  generate_list(length) { return Array.from(Array(length), () => this.getRandomBlock()) }
}

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.index = 0;
    this.score = 0;
    this.isDead = false;
  }
  reset() {
    this.isDead = false;
    this.index = 0;
    this.score = 0;
  }
}

class Room {
  constructor(id, player) {
    this.id = id;
    this.players = [player];
    this.gamemode = 0;
    this.isPlaying = false;
    this.pieceGenerator = new Piece();
    this.pieces_list = this.pieceGenerator.generate_list(50);
    this.leader = player.id;
    this.isSolo = false;
  }
  isNameTaken(name) {
    for (let i = 0; i < this.players.length; i++)
      if (this.players[i].name === name)
        return true;
    return false;
  }
  isPlayerInRoom(id) {
    for (let i = 0; i < this.players.length; i++)
      if(this.players[i].id === id)
        return i;
    return false;
  }
  getPiece(id) {
    const playerIndex = this.isPlayerInRoom(id);
    const pieceIndex = this.players[playerIndex].index++
    if (pieceIndex === this.pieces_list.length)
      this.expandPieceList();
    return this.pieces_list[pieceIndex];
  }
  expandPieceList() {
    this.pieces_list = this.pieces_list.concat(this.pieceGenerator.generate_list(50));
  }
  startGame(gamemode) {
    this.isPlaying = true;
    this.isSolo = this.players.length === 1 ? true : false;
    this.gamemode = gamemode;
  }
  handleDisconnect(id) {
    const res = {leader: null, isWon: false, isDone: false}
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === id) {
        if (this.players.length === 1) {
          res.isDone = true;
          return res;
        }
        if (this.players.splice(i, 1)[0].id === this.leader) {
          this.leader = res.leader = this.players[0].id;
        }
        res.isWon = this.isWon();
        return res;
      }
    }
    return res;
  }
  isWon() {
    let alive = 0;
    this.players.forEach((player) => alive += player.isDead ? 0 : 1);
    if (!this.isPlaying)
      return false;
    if (this.gamemode === 0 && alive === 1)
      return (this.players.find((player) => player.isDead === false)).name;
    if(this.gamemode === 1 && alive === 0)
      return (this.players.sort((a, b) => {return b.score - a.score}))[0].name;
    return false;
  }
  resetRoom() {
    this.isPlaying = false;
    this.pieces_list = this.pieceGenerator.generate_list(50);
    this.players.forEach((player) => player.reset());
  }
  handleDeath(id) {
    this.players.forEach((player) =>{
      if (player.id === id) {
          player.isDead = true;
      }
    });
    return this.isWon();
  }
}


const rooms = [];
const logerror = debug('tetris:error') , loginfo = debug('tetris:info');

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
function get_piece(id) {
  const i = find_room_id(id);
  if(i !== false)
    return rooms[i].getPiece(id)
  return 'L';
}

function find_room_id(id) {
  for(let i = 0; i < rooms.length; i++)
    if(rooms[i].isPlayerInRoom(id) !== false)
      return i;
  return false;
}

function init_room(room, id, user) {
  const res = {isLocked: false, leader: true, name: user}
  for(let i = 0; i < rooms.length; i++) {
    if (rooms[i].id === room) {
      if (rooms[i].isPlaying === false) {
        if(rooms[i].isNameTaken(user)) {
          res.name = null;
          return res;
        }

        rooms[i].players.push(new Player(id, user));
        res.leader = false;
      } 
      else {
        res.isLocked = true;
      }
      return res;
    }
  }
  rooms.push(new Room(room, new Player(id, user)));
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
    //done
    socket.on('get_piece', () => {
      const piece = get_piece(socket.id);
      socket.emit('new_piece', {piece: piece});
    });

    //done
    socket.on('dead', () => {
      const roomIndex = find_room_id(socket.id);
      if(roomIndex === false)
        return;
      if (rooms[roomIndex].isSolo) {
        socket.emit('win', {message: 'You\'re dead'})
        rooms[roomIndex].resetRoom();
        return;
      }

      const winner = rooms[roomIndex].handleDeath(socket.id);
      if (winner === false)
        return;

      io.in(rooms[roomIndex].id).emit('win', {message: `${winner} won`});
      rooms[roomIndex].resetRoom();
    })

    //done
    socket.on('commit', (payload) => {
      const roomIndex = find_room_id(socket.id);
      if(roomIndex === false)
        return;
      if(payload.handicap)
        socket.to(rooms[roomIndex].id).emit('handicap', {amount: payload.handicap - 1});
      const spec = create_spectrum(payload.board);
      const playerId = rooms[roomIndex].isPlayerInRoom(socket.id);
      rooms[roomIndex].players[playerId].score = payload.score;
      socket.to(rooms[roomIndex].id).emit('opponent_board_update', {board: spec, name: rooms[roomIndex].players[playerId].name});
    });

    //done
    socket.on('join_request', (payload) => {
      const res = init_room(payload.room, socket.id, payload.user);
      if (res.name === null)
        socket.emit('error', {message: 'Name already picked Choose an other one.'});
      else if(res.isLocked)
        socket.emit('error', {message: 'Room is in game. Try again later'});
      else {
        socket.join(payload.room);
        socket.emit('join_room', {isLeader: res.leader});
      }
    });

    //done
    socket.on('start_game', (data) => {
      const roomIndex = find_room_id(socket.id);
      if(roomIndex === false || socket.id !== rooms[roomIndex].leader)
        return;
      rooms[roomIndex].startGame(data);
      io.in(rooms[roomIndex].id).emit('start_game', {gamemode: data});
    });

    //done
    socket.on("disconnect", () => {
      console.log('disconect', socket.id);

      const roomIndex = find_room_id(socket.id);
      if (roomIndex === false)
        return;

      const result = rooms[roomIndex].handleDisconnect(socket.id);
      if (result.isDone)
        rooms.splice(roomIndex, 1);
      else if(result.leader !== null)
        socket.to(result.leader).emit('join_room', {isLeader: true});

      if (result.isWon !== false) {
        rooms[roomIndex].resetRoom();
        io.to(rooms[roomIndex].id).emit('win', {message: `${result.isWon} has won the game`});
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
