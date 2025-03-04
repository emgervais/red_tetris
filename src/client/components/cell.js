import React from 'react';

export function Cell(Block) {
  return (
    <div className={`cell ${Block.type}`} />
  );
}
