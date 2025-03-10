import { useState, useRef, useEffect, useCallback } from "react";
import {playTetris, checkCollision} from "./Actions";

function useInterval(callback, delay) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if(delay == null)
            return;

        const intervalID = setInterval(() => callbackRef.current(), delay);
        return () => clearInterval(intervalID);
    }, [delay]);
}

export function useGame() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [tickSpeed, setTickSpeed] = useState(null);

    const [{board, row, col, block, shape}, dispatchState] = playTetris();
    const tick = useCallback(() => {
        dispatchState({ type: 'drop'});
    }, [dispatchState]);

    
    useInterval(() => {
        if (!isPlaying)
            return;
        if (checkCollision(board, shape, row, col)) {
            setTimeout(function(){}, 1000);
            dispatchState({ type: 'commit' });
        } else
            tick();
    }, tickSpeed);
    
    const startGame = useCallback(() => {
            setIsPlaying(true);
            setTickSpeed(800);
            dispatchState({type: 'start'})
            document.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowLeft':
                        dispatchState({ type: 'move', payload: 'left' });
                        break;
                    case 'ArrowRight':
                        dispatchState({ type: 'move', payload: 'right' });
                        break;
                    case 'ArrowUp':
                        dispatchState({ type: 'rotate' });
                        break;
                    case 'ArrowDown':
                        dispatchState({ type: 'move', payload: 'down' });
                        break;
                    default:
                        break;
                }
            });
        }, [dispatchState])
    
    const renderedBoard = structuredClone(board);
    if (isPlaying) {
        shape.forEach((r, i) => {
            r.forEach((isSet, j) => {
                if (isSet) {
                    if (board[row + i][col + j] !== 'Empty') {
                        console.log('lost');
                        setIsPlaying(false);
                    }
                    renderedBoard[row + i][col + j] = block;
                }
            });
        });
    }
    return {board: renderedBoard, startGame, isPlaying}
}