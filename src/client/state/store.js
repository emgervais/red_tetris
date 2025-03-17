import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardReducer'
import roomReducer from './roomReducer'
import { socket } from '../network/socket'

export const socketEmit = (eventName, payload) => ({
  type: 'socket/emit',
  payload: {
    eventName,
    data: payload
  }
});

const socketMiddleware = (store) => {

  socket.on('join_room', (data) => {
    store.dispatch({type: 'socket/roomJoined', payload: data});
  });

  socket.on('start_game', (data) => {
    store.dispatch({ type: 'boardState/start', payload: data.gamemode });
    store.dispatch({type: 'socket/gameStarted'});
    store.dispatch(socketEmit('get_piece', {}));
  });

  socket.on('opponent_board_update', (data) => {
    store.dispatch({ type: 'socket/opponentUpdate', payload: data });
  });

  socket.on('new_piece', (data) => {
    store.dispatch({ type: 'boardState/newPiece', payload: data.piece });
  });

  socket.on('handicap', (data) => {
    store.dispatch({ type: 'socket/receivedHandicap', payload: data });
    store.dispatch({ type: 'boardState/handicap', payload: data.amount });
  });

  socket.on('win', (data) => {
    store.dispatch({ type: 'socket/gameWon', payload: data });
  });

  socket.on('error', (data) => {
    store.dispatch({ type: 'socket/error', payload: data });
  });

  return next => action => {
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
        handicap: state.lastClearedLines,
        score: state.score
      });
      socket.emit('get_piece');
    }

    return result;
  };
};

const store = configureStore({
  reducer: {
    boardState: boardReducer,
    roomState: roomReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(socketMiddleware)
});

export default store;
