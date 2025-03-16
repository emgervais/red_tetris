export function checkCollision(board, shape, row, col) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if ((i + 1 === shape.length && row + i + 1 === board.length) || (shape[i][j] && (board[row + i + 1][col + j] !== 'Empty')))
                return true;
        }
    }
    return false;
}

export function checkSideCollision(board, col, row, shape) {
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] && (!board[row + i] || !board[row + i][col + j] || board[row + i][col + j] !== 'Empty'))    
                return true;
        }
    }
    return false;
}

export function handleLevel(lines, remaining, level) {
    const newRemain = remaining - lines;
    if(newRemain <= 0)
        return [1, (level + 1) * 10];
    return [0, newRemain];
}

export function points(level, lines) {
    const value = [40, 100, 300, 1200];
    if(!lines)
        return 0;
    return ((level + 1) * value[lines - 1]);
}

export const transpose = (matrix) => {

    matrix = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    return matrix.map(row => row.reverse());
}