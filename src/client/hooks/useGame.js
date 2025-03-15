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
    const [roomState, setRoomState] = useState({ isLeader: false, name: window.location.pathname.split('/').pop() + Math.random() });
    const [isPlaying, setIsPlaying] = useState(false);
    const [message, setMessage] = useState('');
    const [opponentBoard, setOpponentBoard] = useState({});
    const [{board, row, col, block, shape, index, score, tickSpeed}, dispatchState] = playTetris();

    const tick = useCallback(() => {
        dispatchState({ type: 'drop'});
    }, [dispatchState]);

    useEffect(() => {
        socket.emit('join_request', {room: 'emile12', user: roomState.name});
    }, []);

    useEffect(() => {
        socket.on('join_room', (data) => {
          setRoomState({
            isLeader: data.isLeader,
            name: roomState.name
          });
        });
    
        socket.on('start_game', () => {
            console.log('start');
            startGame();
        });

        socket.on('opponent_board_update', (data) => {
          setOpponentBoard(prevBoards => ({...prevBoards, [data.name]: data.board}));
        });
        
        socket.on('new_piece', (data) => {
            dispatchState({ type: 'new_piece', payload: data.piece });
        });

        socket.on('handicap', (data) => {
            dispatchState({ type: 'handicap', payload: data.amount});
        });

        socket.on('win', (data) => {
            setIsPlaying(false);
            setMessage(data.message);
        });

        socket.on('error', (data) => {
            setMessage(data.message);
        });
        return () => {
            socket.off('opponent_board_update');
            socket.off('join_room');
            socket.off('start_game');
            socket.off('new_piece');
            socket.off('handicap');
            socket.off('win');
            socket.off('error');
        }
      }, [socket, startGame]);

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
            setMessage('');
            setOpponentBoard({});
            dispatchState({type: 'start'});
            socket.emit('get_piece', {index: 0});
            setIsPlaying(true);
        });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || e.repeat) return;
            
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
        let collision = false;
        shape.forEach((r, i) => {
            r.forEach((isSet, j) => {
                if (isSet) {
                    if (board[row + i][col + j] !== 'Empty') {
                        collision = true;
                    }
                    renderedBoard[row + i][col + j] = block;
                }
            });
        });
    if (collision) {
        setMessage('you\'re dead');
        setIsPlaying(false);
        socket.emit('dead');
    }
    }
    return {board: renderedBoard, isPlaying, opponentBoard, roomState, message, score}
}