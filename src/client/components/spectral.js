import React from 'react';
import { getEmptyBoard } from '../hooks/Actions';

export const PhantomBoard = ({ name, board }) => {
  if (!board) return <div className="phantom-board-placeholder">Waiting for opponent...</div>;
  const fakeBoard = getEmptyBoard();
  return (
    <div className="phantom-board">
      <h3>{name}</h3>
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