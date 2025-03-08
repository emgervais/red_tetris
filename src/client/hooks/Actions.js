import { useReducer } from "react"
import { pieces } from "../helper/piece"
import { type } from "../helper/type"

export function playTetris() {
    const [board, setBoard] = useReducer(
        boardReducer,
        {
            board: [],
            row: 0,
            col: 0,
            block: type.I,
            shape: pieces[type.I]
        },
        (emptyState) => {
            const state = { ...emptyState,
                board: getEmptyBoard(),
            }
            return state
        });
    return [board, setBoard]
}

function boardReducer(state, action) {
    let copyState = { ...state };
    switch (action.type) {
        case 'start':
            const randomBlock = getRandomBlock()
            return {
                board: getEmptyBoard(),
                row: 0,
                col: 3,
                block: randomBlock,
                shape: pieces[randomBlock]
            }
        case 'drop':
            copyState.row++;
            break;
        case 'commit':
            return { ...state, col: state.col + 1 }
        case 'move':
            return { ...state, block: action.payload }
        default:
            return state
    }
}
export function getEmptyBoard() {
    return Array.from({ length: 20 }, () => Array(12).fill('Empty'))
}

function getRandomBlock() {
    const keys = Object.keys(type)
    return keys[Math.floor(Math.random() * keys.length)]
}