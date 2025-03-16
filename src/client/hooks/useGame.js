import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {checkCollision} from '../core/gameLogic'
import { socket } from "../network/socket";
import { start, drop, commit, move, rotate, handicap, newPiece } from "../state/boardReducer";

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
    const dispatch = useDispatch();
    const { board, row, col, block, shape, score, tickSpeed, gamemode } = useSelector(state => state.boardState);
    const [roomState, setRoomState] = useState({ isLeader: false, name: window.location.pathname.split('/').pop() + Math.random() });
    const [isPlaying, setIsPlaying] = useState(false);
    const [message, setMessage] = useState('');
    const [opponentBoard, setOpponentBoard] = useState({});

    const tick = useCallback(() => {
        dispatch(drop());
    }, [dispatch]);

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
    
        socket.on('start_game', (payload) => {
            setMessage('');
            setOpponentBoard({});
            dispatch(start(payload.gamemode));
            socket.emit('get_piece');
            setIsPlaying(true);
        });

        socket.on('opponent_board_update', (data) => {
          setOpponentBoard(prevBoards => ({...prevBoards, [data.name]: data.board}));
        });
        
        socket.on('new_piece', (data) => {
            dispatch(newPiece(data.piece));
        });

        socket.on('handicap', (data) => {
            dispatch(handicap(data.amount));
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
      }, [dispatch]);

    useInterval(() => {
        if (!isPlaying)
            return;
        if (checkCollision(board, shape, row, col)) {
            setTimeout(() => {}, 1000);
            dispatch(commit());
        } else
            tick();
    }, tickSpeed);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || e.repeat) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    dispatch(move('left' ));
                    break;
                case 'ArrowRight':
                    dispatch(move('right' ));
                    break;
                case 'ArrowUp':
                    dispatch(rotate());
                    break;
                case 'ArrowDown':
                    dispatch(move('down' ));
                    break;
                case ' ':
                    dispatch(drop('full'));
                    dispatch(commit());
                    break;
                case 'a':
                    dispatch(handicap(3));
                    break;
                default:
                    break;
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, dispatch]);

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