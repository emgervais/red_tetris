const { expect } = require('chai');
require('babel-polyfill');
const {
  Piece,
  Player,
  Room,
  create_spectrum,
  get_piece,
  find_room_id,
  init_room,
  rooms
} = require('../src/server/index.js');

describe('Piece Class', () => {
  let piece;

  beforeEach(() => {
    piece = new Piece();
  });

  it('should return a random block from valid pieces', () => {
    const block = piece.getRandomBlock();
    expect(piece.pieces).to.include(block);
  });

  it('should generate a list of specified length with valid blocks', () => {
    const length = 10;
    const blocks = piece.generate_list(length);
    expect(blocks).to.have.lengthOf(length);
    blocks.forEach(block => {
      expect(piece.pieces).to.include(block);
    });
  });
});

describe('Player Class', () => {
  let player;

  beforeEach(() => {
    player = new Player('player1', 'TestPlayer');
  });

  it('should initialize with correct properties', () => {
    expect(player.id).to.equal('player1');
    expect(player.name).to.equal('TestPlayer');
    expect(player.score).to.equal(0);
    expect(player.index).to.equal(0);
    expect(player.isDead).to.be.false;
  });

  it('should reset player state correctly', () => {
    player.score = 100;
    player.index = 5;
    player.isDead = true;
    player.reset();
    expect(player.score).to.equal(0);
    expect(player.index).to.equal(0);
    expect(player.isDead).to.be.false;
  });
});

describe('Room Class', () => {
  let room, player;

  beforeEach(() => {
    player = new Player('player1', 'TestPlayer');
    room = new Room('room1', player);
  });

  afterEach(() => {
    rooms.length = 0;
  });

  it('should initialize with correct properties', () => {
    expect(room.id).to.equal('room1');
    expect(room.players).to.have.lengthOf(1);
    expect(room.leader).to.equal('player1');
    expect(room.isPlaying).to.be.false;
    expect(room.pieces_list).to.have.lengthOf(50);
  });

  it('should detect if name is taken', () => {
    expect(room.isNameTaken('TestPlayer')).to.be.true;
    expect(room.isNameTaken('OtherPlayer')).to.be.false;
  });

  it('should detect if player is in room', () => {
    expect(room.isPlayerInRoom('player1')).to.equal(0);
    expect(room.isPlayerInRoom('player2')).to.be.false;
  });

  it('should get piece and increment player index', () => {
    const initialIndex = room.players[0].index;
    const piece = room.getPiece('player1');
    expect(piece).to.be.a('string');
    expect(room.players[0].index).to.equal(initialIndex + 1);
  });

  it('should expand piece list when needed', () => {
    room.players[0].index = 49;
    room.getPiece('player1'); // triggers expansion
    expect(room.pieces_list).to.have.lengthOf(50);
  });

  it('should start game correctly', () => {
    room.startGame(1);
    expect(room.isPlaying).to.be.true;
    expect(room.gamemode).to.equal(1);
    expect(room.isSolo).to.be.true;
  });

  it('should handle disconnect and set isDone', () => {
    const result = room.handleDisconnect('player1');
    expect(result.isDone).to.be.true;
  });

  it('should reassign leader on leader disconnect', () => {
    const player2 = new Player('player2', 'Player2');
    room.players.push(player2);
    const result = room.handleDisconnect('player1');
    expect(result.leader).to.equal('player2');
    expect(room.leader).to.equal('player2');
  });

  it('should return false from isWon if not playing', () => {
    expect(room.isWon()).to.be.false;
  });

  it('should return winner in gamemode 0 (last alive)', () => {
    const player2 = new Player('player2', 'Player2');
    room.players.push(player2);
    room.startGame(0);
    room.handleDeath('player1');
    const winner = room.isWon();
    expect(winner).to.equal('Player2');
  });

  it('should return winner in gamemode 1 (highest score)', () => {
    const player2 = new Player('player2', 'Player2');
    room.players.push(player2);
    room.startGame(1);
    room.players[0].score = 800;
    room.players[0].isDead = true;
    room.players[1].score = 1200;
    room.players[1].isDead = true;
    const winner = room.isWon();
    expect(winner).to.equal('Player2');
  });

  it('should reset room state', () => {
    room.startGame(0);
    room.players[0].score = 100;
    room.resetRoom();
    expect(room.isPlaying).to.be.false;
    expect(room.players[0].score).to.equal(0);
    expect(room.pieces_list).to.have.lengthOf(50);
  });
});

describe('Utility Functions', () => {
  let room, player;

  beforeEach(() => {
    player = new Player('player1', 'TestPlayer');
    room = new Room('room1', player);
    rooms.push(room);
  });

  afterEach(() => {
    rooms.length = 0;
  });

  it('create_spectrum should return correct column heights', () => {
    const board = [
      ['Empty', 'Empty', 'Empty'],
      ['X', 'Empty', 'X'],
      ['X', 'X', 'X']
    ];
    const spectrum = create_spectrum(board);
    expect(spectrum).to.deep.equal([1, 2, 1]);
  });

  it('get_piece should return a valid piece', () => {
    const piece = get_piece('player1');
    expect(['L', 'J', 'T', 'Z', 'S', 'O', 'I']).to.include(piece);
  });

  it('get_piece should return "L" for unknown player', () => {
    const piece = get_piece('unknown');
    expect(piece).to.equal('L');
  });

  it('find_room_id should return index for player in room', () => {
    expect(find_room_id('player1')).to.equal(0);
  });

  it('find_room_id should return false if player not found', () => {
    expect(find_room_id('missing')).to.be.false;
  });

  it('init_room should create a new room', () => {
    const res = init_room('room2', 'id2', 'NewPlayer');
    expect(res).to.deep.equal({
      isLocked: false,
      leader: true,
      name: 'NewPlayer'
    });
    expect(rooms.length).to.equal(2);
  });

  it('init_room should add player to existing room', () => {
    const res = init_room('room1', 'id2', 'Player2');
    expect(res.leader).to.be.false;
    expect(res.isLocked).to.be.false;
    expect(res.name).to.equal('Player2');
  });

  it('init_room should reject duplicate name', () => {
    const res = init_room('room1', 'id2', 'TestPlayer');
    expect(res.name).to.be.null;
  });

  it('init_room should reject join if room is in game', () => {
    room.isPlaying = true;
    const res = init_room('room1', 'id2', 'LateJoiner');
    expect(res.isLocked).to.be.true;
  });
});
