import React from 'react';
import { pieces } from '../core/piece';

export const PiecePreview = ({ piece }) => {
  if (!piece) return null;

  const fakeboard = Array(8).fill(null);
  return (
    <div className="preview">
      {fakeboard.map((_, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;

        return (
          <div
            key={`${index}`}
            className={`preview-cell ${row < pieces[piece].length && col < pieces[piece].length && pieces[piece][row][col] ? piece : ''}`}
          />
        );
      })}
    </div>
  );
};