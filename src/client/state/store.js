import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardReducer'
import { socket } from '../network/socket'

export const socketEmit = (eventName, payload) => ({
  type: 'socket/emit',
  payload: {
    eventName,
    data: payload
  }
});

const socketMiddleware = () => (next) => (action) => {

  if (action.type === 'socket/emit') {
    const { eventName, data } = action.payload;
    socket.emit(eventName, data);
    return;
  }
  const result = next(action);

  if (action.type === 'boardState/commit') {
    const state = store.getState().boardState;
    socket.emit('commit', {
      board: state.board,
      handicap: result.lines,
      score: state.score
    });
    socket.emit('get_piece');
  }
  return result;
};

const store = configureStore({
  reducer: {
    boardState: boardReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(socketMiddleware)
});

export default store;
