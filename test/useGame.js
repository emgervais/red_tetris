import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import { renderHook } from '@testing-library/react-hooks';
import * as reactRedux from 'react-redux';
import * as middleware from '../src/client/state/socketMiddleware';
import * as gameLogic from '../src/client/core/gameLogic';
import { useGame } from '../src/client/hooks/useGame';

describe('useGame Hook', () => {
  let dispatchStub, useSelectorStub;

  beforeEach(() => {
    // Set up a fake browser environment with window.location
    const dom = new JSDOM('', { url: 'http://localhost/emile12/testPlayer' });
    global.window = dom.window;
    global.document = dom.window.document;

    // Redux and app setup
    dispatchStub = sinon.stub();
    useSelectorStub = sinon.stub(reactRedux, 'useSelector');
    sinon.stub(reactRedux, 'useDispatch').returns(dispatchStub);
    sinon.stub(middleware, 'socketEmit').returns({ type: 'socket/emit', payload: {} });

    sinon.stub(gameLogic, 'checkCollision').returns(false);
    sinon.stub(gameLogic, 'removeEmptyRows').callsFake((s) => s);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should dispatch join_request on mount', () => {
    useSelectorStub.callsFake(fn =>
      fn({
        boardState: {
          board: [['Empty']],
          row: 0,
          col: 0,
          block: 'T',
          nextBlock: 'I',
          shape: [[1]],
          score: 0,
          tickSpeed: null,
        },
        roomState: {
          isLeader: true,
          name: '',
          isPlaying: false,
          message: '',
          opponentBoards: {}
        }
      })
    );

    renderHook(() => useGame());

    expect(dispatchStub.callCount).to.be.greaterThan(0);
    expect(dispatchStub.getCall(0).args[0].type).to.equal('roomState/setPlayerName');
    expect(dispatchStub.getCall(1).args[0].type).to.equal('socket/emit');
  });
});
