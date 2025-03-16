import React from 'react'
import { connect } from 'react-redux'
import { Board } from '../components/board'
import { useGame } from '../hooks/useGame'
import { PhantomBoard } from '../components/spectral'
import { socket } from '../socket'

const App = () => {
  const {board, isPlaying, opponentBoard, roomState, message, score} = useGame();

  return (
    <div className='container'>
      {isPlaying? <h3>You're playing as {roomState.name}</h3> : ''}
      {isPlaying? <h4>Your current score is: {score}</h4> : ''}
      {isPlaying? <Board currentBoard={board}/> : <h2>{message}</h2>}
        {roomState.isLeader ? !isPlaying ? (
          <div className="control">
            <button onClick={() => socket.emit('start_game', {gamemode: 0})}>Start normal Game</button>
            <button onClick={() => socket.emit('start_game', {gamemode: 1})}>Start bonus Game</button>
            <button onClick={() => socket.emit('start_game', {gamemode: 2})}>Start invisible Game</button>
          </div>
      ) : '': 'Waiting for leader to start game'}
      {Object.entries(opponentBoard).map(([key, value]) => (
          <PhantomBoard key={key} name={key} board={value} />
      ))}
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}

export default connect(mapStateToProps, null)(App)