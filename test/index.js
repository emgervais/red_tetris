const { expect } = require('chai');
require('babel-polyfill');
const { describe, beforeEach, afterEach } = require('mocha');
const { Piece, Player, Room, create_spectrum, get_piece, find_room_id, init_room, rooms } = require('../src/server/index.js');

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
    while (rooms.length > 0) rooms.pop(); 
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
    room.getPiece('player1');
    expect(room.pieces_list).to.have.lengthOf(100);
  });

  it('should start game correctly', () => {
    room.startGame(1);
    expect(room.isPlaying).to.be.true;
    expect(room.gamemode).to.equal(1);
    expect(room.isSolo).to.be.true;
  });

  it('should handle disconnect properly', () => {
    const result = room.handleDisconnect('player1');
    expect(result.isDone).to.be.true;
    expect(room.players).to.have.lengthOf(0);
  });

  it('should handle multiplayer win conditions', () => {
    const player2 = new Player('player2', 'Player2');
    room.players.push(player2);
    room.startGame(0);
    room.handleDeath('player1');
    const winner = room.isWon();
    expect(winner).to.equal('Player2');
  });
});

describe('Utility Functions', () => {
  let room, player;

  beforeEach(() => {
    player = new Player('player1', 'TestPlayer');
    room = new Room('room1', player);
    rooms.push(room); // Use imported rooms array
  });

  afterEach(() => {
    while (rooms.length > 0) rooms.pop(); // Use imported rooms array
  });

  it('create_spectrum should calculate heights correctly', () => {
    const board = [
      ['Empty', 'Empty', 'Empty'],
      ['X', 'Empty', 'X'],
      ['X', 'X', 'X']
    ];
    const spectrum = create_spectrum(board);
    expect(spectrum).to.deep.equal([1, 2, 1]);
  });

  it('get_piece should return piece for valid player', () => {
    const piece = get_piece('player1');
    expect(piece).to.be.a('string');
    expect(['L', 'J', 'T', 'Z', 'S', 'O', 'I']).to.include(piece);
  });

  it('find_room_id should locate correct room', () => {
    expect(find_room_id('player1')).to.equal(0);
    expect(find_room_id('player2')).to.be.false;
  });

  it('init_room should handle new room creation', () => {
    const result = init_room('room2', 'player2', 'NewPlayer');
    expect(result).to.deep.equal({
      isLocked: false,
      leader: true,
      name: 'NewPlayer'
    });
  });

  it('init_room should handle existing room join', () => {
    const result = init_room('room1', 'player2', 'Player2');
    expect(result.isLocked).to.be.false;
    expect(result.leader).to.be.false;
    expect(result.name).to.equal('Player2');
  });

  it('init_room should reject duplicate names', () => {
    const result = init_room('room1', 'player2', 'TestPlayer');
    expect(result.name).to.be.null;
  });
});