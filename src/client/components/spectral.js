import React from 'react';

export const PhantomBoard = ({ board }) => {
  if (!board) return <div className="phantom-board-placeholder">Waiting for opponent...</div>;

  return (
    <div className="phantom-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="phantom-row">
            {row.map((cell, cellIndex) => (
              <div 
                key={`${rowIndex}-${cellIndex}`} 
                className={`phantom-cell`}
              />
            ))}
          </div>
        ))}
    </div>
  );
};