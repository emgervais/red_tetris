import { useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkCollision, removeEmptyRows } from '../core/gameLogic';
import { drop, commit } from "../state/boardReducer";
import { socketEmit } from '../state/socketMiddleware';
import { keyHook } from "./keyHook";
import { setPlayerName, setPlaying } from "../state/roomReducer";

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
    const { board, row, col, block, nextBlock, shape, score, tickSpeed } = useSelector(state => state.boardState);
    const { isLeader, name, isPlaying, message, opponentBoards } = useSelector(state => state.roomState);

    const tick = useCallback(() => {
        dispatch(drop());
    }, [dispatch]);

    keyHook(isPlaying);
    
    useEffect(() => {
        const url = window.location.pathname.split('/')
        const playerName = url.pop();
        const room = url.pop()
        dispatch(setPlayerName(playerName));
        dispatch(socketEmit('join_request', {
            room: room, 
            user: playerName
        }));
    }, [dispatch]); 

    useInterval(() => {
        if (!isPlaying) return;
        
        if (checkCollision(board, shape, row, col)) {
            dispatch(commit());
        } else {
            tick();
        }
    }, tickSpeed);

    const renderedBoard = structuredClone(board);
    let collision = false;
    if (isPlaying) {
        const clearShape = removeEmptyRows(shape);
        clearShape.forEach((r, i) => {
            r.forEach((isSet, j) => {
                if (isSet) {
                    if (board[row + i][col + j] !== 'Empty') {
                        collision = true;
                    }
                    renderedBoard[row + i][col + j] = block;
                }
            });
        });
        
    }
    if (collision) {
        dispatch(setPlaying());
        dispatch(socketEmit('dead', {}));
    }
    return {
        board: renderedBoard, 
        isPlaying, 
        opponentBoard: opponentBoards, 
        roomState: { isLeader, name }, 
        message, 
        score,
        nextBlock
    };
}