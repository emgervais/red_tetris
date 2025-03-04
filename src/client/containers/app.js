import React from 'react'
import { connect } from 'react-redux'
import { Board } from '../components/board'
import { Empty } from '../helper/type'

const App = () => {
  const board = Array(20).fill(null).map(() => Array(12).fill(Empty))
  return (
    <div className='App'>
      <Board currentBoard={board}/>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    message: state.message
  }
}

export default connect(mapStateToProps, null)(App)


