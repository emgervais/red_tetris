const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const { socketEmit } = require('../src/client/state/socketMiddleware');

// Mock socket object
const fakeSocket = {
  emit: sinon.spy(),
  on: sinon.stub()
};

// Proxy middleware with mocked socket
const { socketMiddleware: middlewareWithMock } = proxyquire('../src/client/state/socketMiddleware', {
  '../network/socket': { socket: fakeSocket }
});

describe('socketMiddleware', () => {
  let dispatch, getState, next, store, invoke;

  beforeEach(() => {
    dispatch = sinon.spy();
    getState = sinon.stub().returns({
      boardState: {
        board: [['Empty']],
        lastClearedLines: 2,
        score: 500
      }
    });
    next = sinon.spy();

    store = { dispatch, getState };
    const middleware = middlewareWithMock(store);
    invoke = (action) => middleware(next)(action);
    fakeSocket.emit.resetHistory();
    fakeSocket.on.resetHistory();
  });

  it('should emit socket events for socket/emit action', () => {
    const action = socketEmit('join_request', { user: 'Etienne' });
    invoke(action);

    expect(fakeSocket.emit.calledOnce).to.be.true;
    expect(fakeSocket.emit.calledWith('join_request', { user: 'Etienne' })).to.be.true;
  });

  it('should call next for non-socket actions', () => {
    const action = { type: 'some/otherAction' };
    invoke(action);
    expect(next.calledWith(action)).to.be.true;
  });

  it('should emit commit and get_piece after boardState/commit', () => {
    const action = { type: 'boardState/commit' };
    invoke(action);

    expect(fakeSocket.emit.callCount).to.equal(2);
    expect(fakeSocket.emit.firstCall.args[0]).to.equal('commit');
    expect(fakeSocket.emit.secondCall.args[0]).to.equal('get_piece');
  });

  it('should dispatch roomJoined on join_room event', () => {
    middlewareWithMock(store);
    fakeSocket.on.withArgs('join_room').callArgWith(1, { isLeader: true, name: 'Etienne' });

    expect(dispatch.calledWith({
      type: 'socket/roomJoined',
      payload: { isLeader: true, name: 'Etienne' }
    })).to.be.true;
  });

  it('should dispatch all correct actions on start_game event', () => {
    middlewareWithMock(store);
    fakeSocket.on.withArgs('start_game').callArgWith(1, { gamemode: 1 });

    expect(dispatch.callCount).to.equal(4);
    expect(dispatch.getCall(0).args[0]).to.deep.equal(socketEmit('get_piece', {}));
    expect(dispatch.getCall(1).args[0]).to.deep.equal(socketEmit('get_piece', {}));
    expect(dispatch.getCall(2).args[0]).to.deep.equal({ type: 'boardState/start', payload: 1 });
    expect(dispatch.getCall(3).args[0]).to.deep.equal({ type: 'socket/gameStarted' });
  });

  it('should dispatch opponentUpdate on opponent_board_update event', () => {
    middlewareWithMock(store);
    const data = { name: 'Other', board: [0, 1, 2] };
    fakeSocket.on.withArgs('opponent_board_update').callArgWith(1, data);

    expect(dispatch.calledWith({ type: 'socket/opponentUpdate', payload: data })).to.be.true;
  });

  it('should dispatch boardState/newPiece on new_piece event', () => {
    middlewareWithMock(store);
    fakeSocket.on.withArgs('new_piece').callArgWith(1, { piece: 'T' });

    expect(dispatch.calledWith({ type: 'boardState/newPiece', payload: 'T' })).to.be.true;
  });

  it('should dispatch handicap and receivedHandicap on handicap event', () => {
    middlewareWithMock(store);
    const data = { amount: 3 };
    fakeSocket.on.withArgs('handicap').callArgWith(1, data);

    expect(dispatch.calledWith({ type: 'socket/receivedHandicap', payload: data })).to.be.true;
    expect(dispatch.calledWith({ type: 'boardState/handicap', payload: 3 })).to.be.true;
  });

  it('should dispatch gameWon on win event', () => {
    middlewareWithMock(store);
    const data = { message: 'You win!' };
    fakeSocket.on.withArgs('win').callArgWith(1, data);

    expect(dispatch.calledWith({ type: 'socket/gameWon', payload: data })).to.be.true;
  });

  it('should dispatch error on error event', () => {
    middlewareWithMock(store);
    const data = { message: 'Error occurred' };
    fakeSocket.on.withArgs('error').callArgWith(1, data);

    expect(dispatch.calledWith({ type: 'socket/error', payload: data })).to.be.true;
  });
});
