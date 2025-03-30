import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { JSDOM } from 'jsdom';

import { keyHook } from '../src/client/hooks/keyHook';
import * as reactRedux from 'react-redux';
import * as boardActions from '../src/client/state/boardReducer';

// Setup jsdom environment
const dom = new JSDOM('', { url: 'http://localhost/' });
global.window = dom.window;
global.document = dom.window.document;

// Dummy component using the hook
function TestComponent({ isPlaying }) {
  keyHook(isPlaying);
  return <div>Testing keyHook</div>;
}

describe('keyHook', () => {
  let dispatchStub;

  beforeEach(() => {
    dispatchStub = sinon.stub();
    sinon.stub(reactRedux, 'useDispatch').returns(dispatchStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should dispatch move("left") on ArrowLeft', () => {
    render(<TestComponent isPlaying={true} />);
    act(() => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(dispatchStub.calledWith(boardActions.move('left'))).to.be.true;
  });

  it('should dispatch move("right") on ArrowRight', () => {
    render(<TestComponent isPlaying={true} />);
    act(() => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(dispatchStub.calledWith(boardActions.move('right'))).to.be.true;
  });

  it('should dispatch rotate() on ArrowUp', () => {
    render(<TestComponent isPlaying={true} />);
    act(() => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    expect(dispatchStub.calledWith(boardActions.rotate())).to.be.true;
  });

  it('should dispatch move("down") on ArrowDown', () => {
    render(<TestComponent isPlaying={true} />);
    act(() => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    expect(dispatchStub.calledWith(boardActions.move('down'))).to.be.true;
  });

  it('should dispatch drop("full") and commit() on Spacebar', () => {
    render(<TestComponent isPlaying={true} />);
    act(() => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ' }));
    });
    expect(dispatchStub.calledWith(boardActions.drop('full'))).to.be.true;
    expect(dispatchStub.calledWith(boardActions.commit())).to.be.true;
  });

  it('should dispatch handicap(3) on key "a"', () => {
    render(<TestComponent isPlaying={true} />);
    act(() => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(dispatchStub.calledWith(boardActions.handicap(3))).to.be.true;
  });

  it('should NOT dispatch anything when isPlaying is false', () => {
    render(<TestComponent isPlaying={false} />);
    act(() => {
      document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(dispatchStub.called).to.be.false;
  });
});
