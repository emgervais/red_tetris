import { useState, useRef, useEffect, useCallback } from "react";
import {playTetris} from "./Actions";

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
    console.log(board);

    const tick = useCallback(() => {
        dispatchState({ type: 'drop'});}, [dispatchState]);
    
        useInterval(() => {
            if (!isPlaying)
                return;
            tick();
        }, tickSpeed);
    
    const startGame = useCallback(() => {
            setIsPlaying(true);
            setTickSpeed(800);
            dispatchState({type: 'start'})
        }, [dispatchState])
    
    const renderedBoard = structuredClone(board);
    if (isPlaying) {
        shape.forEach((r, i) => {
            r.forEach((isSet, j) => {
                if (isSet)
                    renderedBoard[row + i][col + j] = block;
            });
        });
    }
    return {board: renderedBoard, startGame, isPlaying}
}