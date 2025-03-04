import React from 'react'
import { connect } from 'react-redux'
import { Board } from '../components/board'
import { useGame } from '../hooks/useGame'

const App = () => {
  const {board, startGame, isPlaying} = useGame();
  return (
    <div>
      <Board currentBoard={board}/>
      <div className="control">
        {isPlaying ? null : (<button onClick={startGame}>Play</button>)}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}

export default connect(mapStateToProps, null)(App)


