import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render, fireEvent } from '@testing-library/react';
import { GameControls } from '../src/client/components/gameControls'; 

describe('GameControls Component', () => {
  it('should render both buttons', () => {
    const { getByText } = render(
      <GameControls startNormalGame={() => {}} startBonusGame={() => {}} />
    );

    expect(getByText('Start Normal Game')).to.exist;
    expect(getByText('Start Bonus Game')).to.exist;
  });

  it('should call startNormalGame when the first button is clicked', () => {
    const startNormalGame = sinon.spy();
    const startBonusGame = sinon.spy();

    const { getByText } = render(
      <GameControls startNormalGame={startNormalGame} startBonusGame={startBonusGame} />
    );

    fireEvent.click(getByText('Start Normal Game'));
    expect(startNormalGame.calledOnce).to.be.true;
    expect(startBonusGame.called).to.be.false;
  });

  it('should call startBonusGame when the second button is clicked', () => {
    const startNormalGame = sinon.spy();
    const startBonusGame = sinon.spy();

    const { getByText } = render(
      <GameControls startNormalGame={startNormalGame} startBonusGame={startBonusGame} />
    );

    fireEvent.click(getByText('Start Bonus Game'));
    expect(startBonusGame.calledOnce).to.be.true;
    expect(startNormalGame.called).to.be.false;
  });
});
