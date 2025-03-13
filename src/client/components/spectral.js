import React from 'react';
import { getEmptyBoard } from '../hooks/Actions';

export const PhantomBoard = ({ board }) => {
  if (!board) return <div className="phantom-board-placeholder">Waiting for opponent...</div>;
  console.log(board);
  const fakeBoard = getEmptyBoard();
  return (
    <div className="phantom-board">
        {fakeBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="phantom-row">
            {row.map((cell, cellIndex) => (
              <div 
                key={`${rowIndex}-${cellIndex}`} 
                className={`phantom-cell ` + (board[cellIndex] === rowIndex ? 'spec' : '')}
              />
            ))}
          </div>
        ))}
    </div>
  );
};