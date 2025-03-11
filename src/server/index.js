import fs  from 'fs'
import debug from 'debug'

const logerror = debug('tetris:error') , loginfo = debug('tetris:info');
const pieces = ['L', 'J', 'T', 'Z', 'S', 'O', 'I'];
let pieces_list = Array.from(Array(5), () => getRandomBlock());
let index = 0;

function getRandomBlock() {
    return pieces[Math.floor(Math.random() * pieces.length)]
}

const initApp = (app, params, cb) => {
  const {host, port} = params
  const handler = (req, res) => {
    const file = req.url === '/bundle.js' ? '/../../build/bundle.js' : '/../../index.html'
    fs.readFile(__dirname + file, (err, data) => {
      if (err) {
        logerror(err)
        res.writeHead(500)
        return res.end('Error loading index.html')
      }
      res.writeHead(200)
      res.end(data)
    })
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
    socket.on('get_piece', () => {
      if(index === pieces_list.length) {
        pieces_list = pieces_list.concat(Array.from(Array(5), () => getRandomBlock()));
      }
      console.log(index, pieces_list)
      io.emit('new_piece', {piece: pieces_list[index++]});
    });
    socket.on('send_handicap', (payload) => {
      io.emit('handicap', {amount: payload.amount})
    });

    socket.on('dead', () => {
      console.log(socket.id + " is dead");
    })

    socket.on('commit', (payload) => {
  
    });
  })
}

export function create(params){
  const promise = new Promise( (resolve, reject) => {
    const app = require('http').createServer();
    initApp(app, params, () =>{
      const io = require('socket.io')(app, {
        cors: {
          origin: "http://localhost:8080"
        }
      });
      io.listen('8000');
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
