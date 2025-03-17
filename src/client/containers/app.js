import React from 'react'
import { Board } from '../components/board'
import { useGame } from '../hooks/useGame'
import { PhantomBoard } from '../components/spectral'
import { useDispatch } from 'react-redux'
import { socketEmit } from '../state/store'

const App = () => {
  const dispatch = useDispatch();
  const {board, isPlaying, opponentBoard, roomState, message, score} = useGame();
  const startNormalGame = () => {
    dispatch(socketEmit('start_game', 0));
  };

  const startBonusGame = () => {
    dispatch(socketEmit('start_game', 1));
  };
  
  return (
    <div className='container'>
      {isPlaying? <h3>You're playing as {roomState.name}</h3> : ''}
      {isPlaying? <h4>Your current score is: {score}</h4> : ''}
      {isPlaying? <Board currentBoard={board}/> : <h2>{message}</h2>}
        {roomState.isLeader ? !isPlaying ? (
          <div className="control">
            <button onClick={startNormalGame}>Start normal Game</button>
            <button onClick={startBonusGame}>Start bonus Game</button>
          </div>
      ) : '': 'Waiting for leader to start game'}
      {Object.entries(opponentBoard).map(([key, value]) => (
          <PhantomBoard key={key} name={key} board={value} />
      ))}
    </div>
  )
}

export default App;