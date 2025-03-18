import React from 'react';

export const GameControls = ({ startNormalGame, startBonusGame}) => {
  return (
    <div className="control">
          <button onClick={startNormalGame}>
            Start Normal Game
          </button>
          <button onClick={startBonusGame}>
            Start Bonus Game
          </button>
    </div>
  );
};