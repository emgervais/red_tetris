const { expect } = require('chai');
const { describe, it } = require('mocha');

// 🧠 FIX: Correct imports
const boardSlice = require('../src/client/state/boardReducer').default;
const {
  start,
  drop,
  commit,
  move,
  rotate,
  handicap,
  newPiece,
} = require('../src/client/state/boardReducer');

const { getEmptyBoard } = require('../src/client/core/board');
const { pieces } = require('../src/client/core/piece'); // ✅ FIXED

const boardInitialState = {
  board: getEmptyBoard(),
  row: 0,
  col: 0,
  block: '',
  nextBlock: '',
  shape: [[]],
  score: 0,
  tickSpeed: 800,
  level: 0,
  lastClearedLines: 0,
  remaining: 10,
  gamemode: 0,
};

describe('Board Reducer', () => {
  it('should return initial state when no action is provided', () => {
    const state = boardSlice(undefined, {});
    expect(state).to.deep.equal(boardInitialState);
  });

  describe('Reducers', () => {
    it('start should reset state with given gamemode', () => {
      const action = start(1);
      const state = boardSlice(boardInitialState, action);
      expect(state.board).to.deep.equal(getEmptyBoard());
      expect(state.gamemode).to.equal(1);
      expect(state.score).to.equal(0);
      expect(state.tickSpeed).to.equal(800);
    });

    it('drop with "full" should move piece to bottom', () => {
      const stateWithPiece = { ...boardInitialState, shape: pieces['L'], block: 'L' };
      const action = drop('full');
      const state = boardSlice(stateWithPiece, action);
      expect(state.row).to.be.greaterThan(0);
    });

    it('drop without "full" should increment row', () => {
      const stateWithPiece = { ...boardInitialState, shape: pieces['L'], block: 'L' };
      const action = drop();
      const state = boardSlice(stateWithPiece, action);
      expect(state.row).to.equal(1);
    });

    it('commit should add piece and update score', () => {
      const stateWithPiece = { ...boardInitialState, shape: pieces['I'], block: 'I', col: 4, row: 19 };
      const state = boardSlice(stateWithPiece, commit());
      expect(state.board[19].slice(4, 8)).to.not.include('Empty');
      expect(state.shape).to.deep.equal([[]]);
      expect(state.row).to.equal(0);
      expect(state.col).to.equal(4);
    });

    it('move left should decrement col if no collision', () => {
      const stateWithPiece = { ...boardInitialState, shape: pieces['L'], block: 'L', col: 4 };
      const action = move('left');
      const state = boardSlice(stateWithPiece, action);
      expect(state.col).to.equal(3);
    });

    it('rotate should transpose shape if no collision', () => {
      const stateWithPiece = { ...boardInitialState, shape: pieces['L'], block: 'L', col: 4 };
      const originalShape = stateWithPiece.shape.map(row => [...row]);
      const state = boardSlice(stateWithPiece, rotate());
      expect(state.shape).to.not.deep.equal(originalShape);
    });

    it('handicap should add lines and adjust row', () => {
      const stateWithPiece = { ...boardInitialState, shape: pieces['L'], block: 'L', row: 5 };
      const action = handicap(2);
      const state = boardSlice(stateWithPiece, action);
      expect(state.board.length).to.equal(20);
      expect(state.board[18]).to.include('Lock');
      expect(state.row).to.equal(3);
    });

    it('newPiece should set block and nextBlock', () => {
      const action = newPiece('T');
      const state = boardSlice(boardInitialState, action);
      expect(state.block).to.equal('T');
      expect(state.nextBlock).to.equal('T');
      expect(state.shape).to.deep.equal(pieces['T']);
    });
  });
});
