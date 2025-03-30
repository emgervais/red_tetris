const { expect } = require('chai');
const { describe, it } = require('mocha');

const roomReducer = require('../src/client/state/roomReducer').default;
const { setPlayerName, setPlaying } = require('../src/client/state/roomReducer');

const initialState = {
  isLeader: false,
  name: '',
  isPlaying: false,
  message: '',
  opponentBoards: {},
};

describe('Room Reducer', () => {
  it('should return initial state when no action is provided', () => {
    const state = roomReducer(undefined, {});
    expect(state).to.deep.equal(initialState);
  });

  describe('Standard Reducers', () => {
    it('setPlayerName should update name', () => {
      const action = setPlayerName('Etienne');
      const state = roomReducer(initialState, action);
      expect(state.name).to.equal('Etienne');
    });

    it('setPlaying should toggle isPlaying', () => {
      const state1 = roomReducer(initialState, setPlaying());
      expect(state1.isPlaying).to.equal(true);

      const state2 = roomReducer(state1, setPlaying());
      expect(state2.isPlaying).to.equal(false);
    });
  });

  describe('Extra Reducers', () => {
    it('socket/roomJoined should set isLeader and name if name not already set', () => {
      const action = {
        type: 'socket/roomJoined',
        payload: { isLeader: true, name: 'NewPlayer' }
      };
      const state = roomReducer(initialState, action);
      expect(state.isLeader).to.equal(true);
      expect(state.name).to.equal('NewPlayer');
    });

    it('socket/roomJoined should NOT overwrite existing name', () => {
      const preState = { ...initialState, name: 'ExistingPlayer' };
      const action = {
        type: 'socket/roomJoined',
        payload: { isLeader: false, name: 'NewPlayer' }
      };
      const state = roomReducer(preState, action);
      expect(state.name).to.equal('ExistingPlayer');
      expect(state.isLeader).to.equal(false);
    });

    it('socket/gameStarted should set isPlaying, reset message and opponentBoards', () => {
      const preState = {
        ...initialState,
        isPlaying: false,
        message: 'Previous message',
        opponentBoards: { Opponent1: [1, 2, 3] }
      };
      const action = { type: 'socket/gameStarted' };
      const state = roomReducer(preState, action);
      expect(state.isPlaying).to.equal(true);
      expect(state.message).to.equal('');
      expect(state.opponentBoards).to.deep.equal({});
    });

    it('socket/opponentUpdate should update opponentBoards', () => {
      const action = {
        type: 'socket/opponentUpdate',
        payload: { name: 'Opponent1', board: ['Filled'] }
      };
      const state = roomReducer(initialState, action);
      expect(state.opponentBoards).to.deep.equal({ Opponent1: ['Filled'] });
    });

    it('socket/gameWon should set message and stop game', () => {
      const preState = { ...initialState, isPlaying: true };
      const action = {
        type: 'socket/gameWon',
        payload: { message: 'Player1 won!' }
      };
      const state = roomReducer(preState, action);
      expect(state.isPlaying).to.equal(false);
      expect(state.message).to.equal('Player1 won!');
    });

    it('socket/error should set message', () => {
      const action = {
        type: 'socket/error',
        payload: { message: 'Something went wrong' }
      };
      const state = roomReducer(initialState, action);
      expect(state.message).to.equal('Something went wrong');
    });
  });
});
