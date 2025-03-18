import React from 'react';
import { Board } from '../components/board';
import { useGame } from '../hooks/useGame';
import { PhantomBoard } from '../components/spectral';
import { useDispatch } from 'react-redux';
import { socketEmit } from '../state/socketMiddleware';
import { PiecePreview } from '../components/piecePreview';
import { GameControls } from '../components/gameControls';

const App = () => {
  const dispatch = useDispatch();
  const { board, isPlaying, opponentBoard, roomState, message, score, nextBlock } = useGame();

  const startNormalGame = () => {
    dispatch(socketEmit('start_game', 0));
  };

  const startBonusGame = () => {
    dispatch(socketEmit('start_game', 1));
  };

  return (
    <div className='container'>
      <header className='header'>
        <h1>Tetris Game</h1>
        {isPlaying ? <h3>You're playing as {roomState.name}</h3> : ''}
        {isPlaying ? <h4>Your current score is: {score}</h4> : ''}
      </header>
      <main className='game-area'>
        {isPlaying ? <Board currentBoard={board} /> : <h2>{message}</h2>}
        {roomState.isLeader ? !isPlaying ? (
          <GameControls startNormalGame={startNormalGame} startBonusGame={startBonusGame} />
        ) : '' : 'Waiting for leader to start game'}
        {isPlaying ? <PiecePreview key="preview" piece={nextBlock} /> : ''}
        </main>
        <div className='specBoard'>
        {Object.entries(opponentBoard).map(([key, value]) => (
          <PhantomBoard key={key} name={key} board={value} />
        ))}
        </div>
    </div>
  );
};

export default App;