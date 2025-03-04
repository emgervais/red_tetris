import { Cell } from './cell';
import React from 'react';

export function Board({ currentBoard }) {
     
    return (
        <div className="board">
            {currentBoard.map((row, rowIndex) => {
                return (
                    <div key={rowIndex} className="row">
                        {row.map((cell, cellIndex) => {
                            console.log(cell); 
                            return (
                                <Cell
                                    key={`${rowIndex}-${cellIndex}`}
                                    type={cell}
                                />
                            )
                        })}
                    </div>
                )
            })}
        </div>
    );
}