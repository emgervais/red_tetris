import { useState, useRef, useEffect, useCallback } from "react";
import {playTetris, checkCollision} from "./Actions";
import { getEmptyBoard } from "./Actions";
import { socket } from "../socket";

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
    const [opponentBoard, setOpponentBoard] = useState(null);
    const [{board, row, col, block, shape}, dispatchState] = playTetris();
    const tick = useCallback(() => {
        dispatchState({ type: 'drop'});
    }, [dispatchState]);

    useEffect(() => {
        socket.on('opponent_board_update', (data) => {
          setOpponentBoard(data.board);
        });
        
        socket.on('new_piece', (data) => {
            dispatchState({ type: 'new_piece', payload: data.piece });
        });

        socket.on('handicap', (data) => {
            dispatchState({ type: 'handicap', payload: data.amount});
        });
        return () => {
          socket.off('opponent_board_update');
        }
      }, [socket]);

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
            socket.connect();
            dispatchState({type: 'start'});
            setOpponentBoard(getEmptyBoard());
        }, [dispatchState]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying) return;
            
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
                case ' ':
                    dispatchState({ type: 'drop', payload: 'full' });
                    break;
                case 'a':
                    socket.emit('send_handicap', {amount: 2});
                    break;
                default:
                    break;
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, dispatchState]);

    const renderedBoard = structuredClone(board);
    if (isPlaying) {
        shape.forEach((r, i) => {
            r.forEach((isSet, j) => {
                if (isSet) {
                    if (board[row + i][col + j] !== 'Empty') {
                        socket.emit('dead');
                        console.log("lost")
                        setIsPlaying(false);
                    }
                    renderedBoard[row + i][col + j] = block;
                }
            });
        });
    }
    return {board: renderedBoard, startGame, isPlaying, opponentBoard}
}