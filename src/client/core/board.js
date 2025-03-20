import { removeEmptyRows } from './gameLogic'

export function addPiece({board, row, col, shape, block}) {
    const newBoard = board.map(row => [...row]);
    const clearShape = removeEmptyRows(shape);
    for (let i = 0; i < clearShape.length; i++) {
        for (let j = 0; j < clearShape[i].length; j++) {
            if (clearShape[i][j])
                newBoard[row + i][col + j] = block;
        }
    }
    return newBoard
}

export function handleLine(board, gamemode) {
    let lines = 0;
    const copyBoard = [...board];
    copyBoard.forEach((row, index) => {
        if (row.every(cell => (cell !== 'Empty' && (gamemode !== 0 ? true : cell !== 'Lock')))) {
            lines += row.some(cell => cell === 'Lock') ? 0 : 1;   
            copyBoard.splice(index, 1);
            copyBoard.unshift(Array(10).fill('Empty'));
        }
    });
    return { board: copyBoard, lines: lines };
}

export function getEmptyBoard() {
    return Array.from({ length: 20 }, () => Array(10).fill('Empty'));
}