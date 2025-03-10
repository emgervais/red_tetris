import React from 'react'
import { connect } from 'react-redux'
import { Board } from '../components/board'
import { useGame } from '../hooks/useGame'
import { PhantomBoard } from '../components/spectral'

const App = () => {
  const {board, startGame, isPlaying, opponentBoard} = useGame();
  return (
    <div className='container'>
      <Board currentBoard={board}/>
      <div className="control">
        {isPlaying ? null : (<button onClick={startGame}>Play</button>)}
      </div>
      <PhantomBoard board={opponentBoard} />
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}

export default connect(mapStateToProps, null)(App)