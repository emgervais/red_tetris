import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import { renderHook, act } from '@testing-library/react-hooks';
import * as reactRedux from 'react-redux';
import * as middleware from '../src/client/state/socketMiddleware';
import * as gameLogic from '../src/client/core/gameLogic';
import * as boardReducer from '../src/client/state/boardReducer';
import * as roomReducer from '../src/client/state/roomReducer';
import { useGame } from '../src/client/hooks/useGame';

describe('useGame Hook', () => {
  let dispatchStub, useSelectorStub;

  beforeEach(() => {
    // Set up JSDOM for window.location
    const dom = new JSDOM('', { url: 'http://localhost/emile12/testPlayer' });
    global.window = dom.window;
    global.document = dom.window.document;

    // Mock Redux hooks
    dispatchStub = sinon.stub();
    useSelectorStub = sinon.stub(reactRedux, 'useSelector');
    sinon.stub(reactRedux, 'useDispatch').returns(dispatchStub);

    // Mock middleware and game logic
    sinon.stub(middleware, 'socketEmit').returns({ type: 'socket/emit', payload: {} });
    sinon.stub(gameLogic, 'checkCollision').returns(false);
    sinon.stub(gameLogic, 'removeEmptyRows').callsFake((shape) => shape);
  });

  afterEach(() => {
    sinon.restore();
    delete global.window;
    delete global.document;
  });

  const setupHook = (initialState = {}) => {
    useSelectorStub.callsFake(fn =>
      fn({
        boardState: {
          board: [['Empty', 'Empty'], ['Empty', 'Empty']],
          row: 0,
          col: 0,
          block: 'T',
          nextBlock: 'I',
          shape: [[1, 1], [0, 1]],
          score: 0,
          tickSpeed: null,
          ...initialState.boardState,
        },
        roomState: {
          isLeader: true,
          name: '',
          isPlaying: false,
          message: '',
          opponentBoards: {},
          ...initialState.roomState,
        },
      })
    );
    return renderHook(() => useGame());
  };

  it('should dispatch drop when isPlaying and no collision', () => {
    sinon.stub(boardReducer, 'drop').returns({ type: 'boardState/drop' });
    const { unmount } = setupHook({
      boardState: { tickSpeed: 100 },
      roomState: { isPlaying: true },
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(dispatchStub.calledWith({ type: 'boardState/drop' })).to.be.true;
        expect(dispatchStub.calledWith(boardReducer.commit())).to.be.false;
        unmount();
        resolve();
      }, 150); // Wait longer than tickSpeed to ensure interval runs
    });
  });

  it('should dispatch commit when collision detected in interval', () => {
    gameLogic.checkCollision.returns(true);
    sinon.stub(boardReducer, 'commit').returns({ type: 'boardState/commit' });
    const { unmount } = setupHook({
      boardState: { tickSpeed: 100 },
      roomState: { isPlaying: true },
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(dispatchStub.calledWith({ type: 'boardState/commit' })).to.be.true;
        expect(dispatchStub.calledWith(boardReducer.drop())).to.be.false;
        unmount();
        resolve();
      }, 150);
    });
  });
});