import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLeader: false,
  name: '',
  isPlaying: false,
  message: '',
  opponentBoards: {},
};

const roomSlice = createSlice({
  name: 'roomState',
  initialState,
  reducers: {
    setPlayerName: (state, action) => {
      state.name = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase('socket/roomJoined', (state, action) => {
        state.isLeader = action.payload.isLeader;
        if (!state.name) {
          state.name = action.payload.name;
        }
      })
      .addCase('socket/gameStarted', (state) => {
        state.isPlaying = true;
        state.message = '';
        state.opponentBoards = {};
      })
      .addCase('socket/opponentUpdate', (state, action) => {
        state.opponentBoards = {
          ...state.opponentBoards,
          [action.payload.name]: action.payload.board
        };
      })
      .addCase('socket/gameWon', (state, action) => {
        state.isPlaying = false;
        state.message = action.payload.message;
      })
      .addCase('socket/error', (state, action) => {
        state.message = action.payload.message;
      });
  }
});

export const { setPlayerName } = roomSlice.actions;
export default roomSlice.reducer;