import { useReducer } from "react"
import { pieces, transpose } from "../helper/piece"
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

export function checkCollision(board, shape, row, col) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if ((i + 1 === shape.length && row + i + 1 === board.length) || (shape[i][j] && (board[row + i + 1][col + j] !== 'Empty')))
                return true;
        }
    }
    return false;
}

function checkSideCollision(board, col, row, shape) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] && (!board[row + i] || !board[row + i][col + j] || board[row + i][col + j] !== 'Empty'))    
                return true;
        }
    }
    return false;
}

function addPiece({board, row, col, shape, block}) {
    const newBoard = board.map(row => [...row])
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j])
                newBoard[row + i][col + j] = block;
        }
    }
    return newBoard
}

function handleLine(board) {
    let lines = 0;
    board.forEach(row => {
        if (row.every(cell => (cell !== 'Empty' && cell !== 'Lock'))) {
            lines++;
            board.splice(board.indexOf(row), 1);
            board.unshift(Array(10).fill('Empty'));
        }
    });
    return {board, lines};
}

function boardReducer(state, action) {
    let copyState = { ...state };
    switch (action.type) {
        case 'start':
            const randomBlock = getRandomBlock()
            return {
                board: getEmptyBoard(),
                row: 0,
                col: 4,
                block: randomBlock,
                shape: pieces[randomBlock]
            }
        case 'drop':
            if (action.payload === 'full') {
                while (!checkCollision(copyState.board, copyState.shape, copyState.row, copyState.col))
                    copyState.row++;
                const newBlock = getRandomBlock();
                const {board, line} = handleLine(addPiece({...copyState}));
                return { board: board, block: newBlock, shape: pieces[newBlock], col:4, row:0 }
            } else
                copyState.row++;
            return copyState;
        case 'commit':
            const newBlock = getRandomBlock();
            const {board, line} = handleLine(addPiece({...copyState}));
            return { board: board, block: newBlock, shape: pieces[newBlock], col:4, row:0 }
        case 'move':
            let col = copyState.col;
            let row = copyState.row;
            if (action.payload === 'left' || action.payload === 'right') {
                col += (action.payload === 'left' ? -1 : 1)
                if (checkSideCollision(copyState.board, col, row, copyState.shape)) 
                    col = copyState.col;
            } else if (!checkCollision(copyState.board, copyState.shape, row, col))
                row++;
            return { ...copyState, col: col, row: row }
        case 'rotate':
            let shape = transpose(state.shape);
            if (checkSideCollision(copyState.board, copyState.col, copyState.row, shape))
                return { ...copyState}
            return {...copyState, shape: shape}
        case 'handicap':
            copyState.board.shift()
            copyState.board.push(Array(10).fill('Lock'));
            return { ...copyState}
        default:
            return state
    }
}
export function getEmptyBoard() {
    return Array.from({ length: 20 }, () => Array(10).fill('Empty'))
}

function getRandomBlock() {
    const keys = Object.keys(type)
    return keys[Math.floor(Math.random() * keys.length)]
}