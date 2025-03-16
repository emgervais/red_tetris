import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardReducer'
import { socket } from '../network/socket'

const socketMiddleware = () => (next) => (action) => {
  // const result = next(action);
  
  // // Handle socket emissions based on actions
  // if (action.type === 'board/commit') {
  //   socket.emit('commit', {
  //     board: action.payload?.board || store.getState().board.board,
  //     handicap: action.payload?.lines || 0,
  //     score: store.getState().board.score
  //   });
  //   socket.emit('get_piece');
  // }
  
  // if (action.type === 'board/drop' && action.payload === 'full') {
  //   socket.emit('get_piece');
  //   // The commit action will be dispatched separately
  // }
  
  // return result;
};

const store = configureStore({
  reducer: {
    boardState: boardReducer
  },
  // middleware: (getDefaultMiddleware) => 
  //   getDefaultMiddleware().concat(socketMiddleware)
});

export default store;
