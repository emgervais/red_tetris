import { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { drop, commit, move, rotate, handicap } from "../state/boardReducer";

export function keyHook(isPlaying) {
    const dispatch = useDispatch();
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
}