import React from 'react'
import { connect } from 'react-redux'
import { Board } from '../components/board'
import { useGame } from '../hooks/useGame'
import { PhantomBoard } from '../components/spectral'
import { socket } from '../socket'

const App = () => {
  const {board, isPlaying, opponentBoard, roomState, message} = useGame();
  // const urlParts = window.location.href.split('/').filter(part => part !== '');
  const user = 'emile';//urlParts.pop();
  const roomName = '12';//urlParts.pop();
  return (
    <div className='container'>
      {isPlaying? <h3>You're playing as {roomState.name}</h3> : ''}
      {isPlaying? <Board currentBoard={board}/> : <h2>{message}</h2>}
      <div className="control">
        {roomState.isLeader ? !isPlaying ? (<button onClick={() => socket.emit('start_game')}>Start Game</button>) : '': 'Waiting for leader to start game'}
      </div>
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