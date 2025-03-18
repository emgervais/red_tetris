import { socket } from '../network/socket'



export const socketEmit = (eventName, payload) => ({
  type: 'socket/emit',
  payload: {
    eventName,
    data: payload
  }
});

export const socketMiddleware = (store) => {

  socket.on('join_room', (data) => {
    store.dispatch({type: 'socket/roomJoined', payload: data});
  });

  socket.on('start_game', (data) => {
    store.dispatch(socketEmit('get_piece', {}));
    store.dispatch(socketEmit('get_piece', {}));
    store.dispatch( { type: 'boardState/start', payload: data.gamemode } );
    store.dispatch( {type: 'socket/gameStarted'} );
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