const { expect } = require('chai');
const sinon = require('sinon');
const { socketMiddleware, socketEmit } = require('../src/client/state/socketMiddleware');

// Mock socket
const fakeSocket = {
  emit: sinon.spy(),
  on: sinon.stub()
};

// Replace real socket with fake socket
const proxyquire = require('proxyquire').noCallThru();

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

  it('should register all socket.on listeners', () => {
    // Validate that handlers are registered (in real app this is on app init)
    expect(fakeSocket.on.callCount).to.be.above(0);
    const events = fakeSocket.on.getCalls().map(c => c.args[0]);

    const expectedEvents = [
      'join_room', 'start_game', 'opponent_board_update', 'new_piece',
      'handicap', 'win', 'error'
    ];
    expectedEvents.forEach(evt => {
      expect(events).to.include(evt);
    });
  });
});
