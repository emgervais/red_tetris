import { createSlice } from '@reduxjs/toolkit'
import { pieces } from '../core/piece'
import { handleLine, addPiece, getEmptyBoard } from '../core/board'
import { checkCollision, checkSideCollision, handleLevel, points, transpose } from '../core/gameLogic'
import { socket } from '../network/socket'

const initialState = {
  board: getEmptyBoard(),
  row: 0,
  col: 0,
  block: '',
  shape: [[]],
  score: 0,
  tickSpeed: 800,
  level: 0,
  remaining: 10,
  gamemode: 0
};

const boardSlice = createSlice({
  name: 'boardState',
  initialState,
  reducers: {
    start: (state, action) => {
      console.log('start');
      state.board = getEmptyBoard();
      state.row = 0;
      state.col = 4;
      state.block = '';
      state.shape = [[]];
      state.score = 0;
      state.level = 0;
      state.remaining = 10;
      state.tickSpeed = 800;
      state.gamemode = action.payload;
    },
    
    drop: (state, action) => {
      if (action.payload === 'full') {
        while (!checkCollision(state.board, state.shape, state.row, state.col))
          state.row++;
          
        return;
      } else {
        state.row++;
      }
    },
    
    commit: (state) => {
      const result = handleLine(addPiece({ 
        board: state.board, 
        row: state.row, 
        col: state.col, 
        shape: state.shape, 
        block: state.block 
      }), state.gamemode);
      
      state.board = result.board;
      
      const levelUpdate = handleLevel(result.lines, state.remaining, state.level);
      if (levelUpdate[0] && state.gamemode) {
        state.tickSpeed -= 85;
      }
      
      state.level += levelUpdate[0];
      state.remaining = levelUpdate[1];
      state.score += points(state.level, result.lines);
      
      state.shape = [[]];
      state.col = 4;
      state.row = 0;
      socket.emit('commit', {handicap: result.lines, score: state.score, board: state.board});
      socket.emit('get_piece');
    },
    
    move: (state, action) => {
      let newCol = state.col;
      
      if (action.payload === 'left' || action.payload === 'right') {
        newCol += (action.payload === 'left' ? -1 : 1);
        if (!checkSideCollision(state.board, newCol, state.row, state.shape)) {
          state.col = newCol;
        }
      } else if (action.payload === 'down' && !checkCollision(state.board, state.shape, state.row, state.col)) {
        state.row++;
      }
    },
    
    rotate: (state) => {
      const rotatedShape = transpose(state.shape);
      
      if (!checkSideCollision(state.board, state.col, state.row, rotatedShape)) {
        state.shape = rotatedShape;
      }
    },
    
    handicap: (state, action) => {
      let amount = action.payload;
      
      while (amount > 0) {
        state.board.shift();
        const line = Array(10).fill('Lock');
        
        if (state.gamemode !== 0) {
          line[Math.floor(Math.random() * 9)] = 'Empty';
        }
        
        state.board.push(line);
        amount--;
      }
    },
    
    newPiece: (state, action) => {
      state.block = action.payload;
      state.shape = pieces[action.payload];
    }
  }
});

export const { start, drop, commit, move, rotate, handicap, newPiece } = boardSlice.actions;

export default boardSlice.reducer;