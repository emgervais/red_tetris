import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Board } from '../components/board'
import { useGame } from '../hooks/useGame'
import { PhantomBoard } from '../components/spectral'
import { BrowserRouter, Route } from 'react-router-dom';
import { useState } from 'react'
import { socket } from '../socket'

const App = () => {
  const {board, startGame, isPlaying, opponentBoard, roomState} = useGame();
  // const urlParts = window.location.href.split('/').filter(part => part !== '');
  const user = 'emile';//urlParts.pop();
  const roomName = '12';//urlParts.pop();
  return (
    <div className='container'>
      <Board currentBoard={board}/>
      <div className="control">
        {roomState.isLeader ? (<button onClick={() => {socket.emit('start_game', {room: 'emile12'})}}>Start Game</button>): 'Waiting for leader to start game'}
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