import { useReducer } from "react"
import { pieces, transpose } from "../helper/piece"
import { type } from "../helper/type"
import { socket } from "../socket"

//Gamemodes
//--------------------
//0: normal
//1: bonus (destructible handicap, increase gravity)
//2: invisible(no handicap. no increase gravity)
export function playTetris() {
    const [state, setBoard] = useReducer(boardReducer, {board: [], row: 0, col: 0, block: '', shape: [[]], score: 0, tickSpeed: 0, level: 0, remaining: 0, gamemode: 0}, (emptyState) => {
            return { ...emptyState, board: getEmptyBoard() }
        });
    return [state, setBoard]
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

function handleLevel(lines, remaining, level) {
    const newRemain = remaining - lines;
    if(newRemain <= 0)
        return [1, (level + 1) * 10];
    return [0, newRemain];
}

function points(level, lines) {
    const value = [40, 100, 300, 1200];
    if(!lines)
        return 0;
    return ((level + 1) * value[lines - 1]);
}

function handleLine(board, gamemode) {
    let lines = 0;
    console.log(gamemode);
    board.forEach(row => {
        if (row.every(cell => (cell !== 'Empty' && (gamemode !== 0 ? true : cell !== 'Lock')))) {
            lines++;
            board.splice(board.indexOf(row), 1);
            board.unshift(Array(10).fill('Empty'));
        }
    });
    return {board: board, lines: lines};
}

function boardReducer(state, action) {
    let copyState = { ...state };
    switch (action.type) {
        case 'start':
            return {
                board: getEmptyBoard(),
                row: 0,
                col: 4,
                block: '',
                shape: [[]],
                score: 0,
                level: 0,
                remaining: 10,
                tickSpeed: 800,
                gamemode: action.payload
            }
        case 'drop':
            if (action.payload === 'full') {
                while (!checkCollision(copyState.board, copyState.shape, copyState.row, copyState.col))
                    copyState.row++;
                socket.emit("get_piece");
                const {board, lines} = handleLine(addPiece({...copyState}), copyState.gamemode);
                const [level, remaining] = handleLevel(lines, copyState.remaining, copyState.level);
                if (level && copyState.gamemode)
                    copyState.tickSpeed -= 85;
                const score = copyState.score + points(copyState.level)
                socket.emit('commit', {board: board, handicap: lines, score: score});
                return { ...copyState, board: board, shape: [[]], col:4, row:0, score: score, level: level + copyState.level, remaining: remaining}
            } else
                copyState.row++;
            return copyState;
        case 'commit':
            socket.emit('get_piece');
            const {board, lines} = handleLine(addPiece({...copyState}), copyState.gamemode);
            const [level, remaining] = handleLevel(lines, copyState.remaining, copyState.level);
            if (level)
                copyState.tickSpeed -= 85;
            const score = copyState.score + points(copyState.level)
            socket.emit('commit', {board: board, handicap: lines, score: score});
            return { ...copyState, board: board, shape: [[]], col:4, row:0, score: score, level: level + copyState.level, remaining: remaining}
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
            let shape = transpose(copyState.shape);
            if (checkSideCollision(copyState.board, copyState.col, copyState.row, shape))
                return { ...copyState}
            return {...copyState, shape: shape}
        case 'handicap':
            while(action.payload) {
                copyState.board.shift()
                const line = Array(10).fill('Lock');
                console.log(copyState.gamemode)
                if(copyState.gamemode !== 0)
                    line[Math.floor(Math.random() * 9)] = 'Empty';
                copyState.board.push(line);
                action.payload--;
            }
            return { ...copyState}
        case 'new_piece':
            const newBlock = action.payload;
            return {...copyState, block: newBlock, shape: pieces[newBlock]}
        default:
            return state
    }
}
export function getEmptyBoard() {
    return Array.from({ length: 20 }, () => Array(10).fill('Empty'))
}