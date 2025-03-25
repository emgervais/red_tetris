export function removeEmptyRows(shape) {
    return shape.filter(row => 
      row.some(cell => cell !== 0)
    );
  }

export function checkCollision(board, shape, row, col) {
    const clearShape = removeEmptyRows(shape);
    for (let i = 0; i < clearShape.length; i++) {
        for (let j = 0; j < clearShape[i].length; j++) {
            if ((i + 1 === clearShape.length && row + i + 1 === board.length) || (clearShape[i][j] && (board[row + i + 1][col + j] !== 'Empty')))
                return true;
        }
    }
    return false;
}

export function checkSideCollision(board, col, row, shape) {
    const clearShape = removeEmptyRows(shape);
    for (let i = 0; i < clearShape.length; i++) {
        for (let j = 0; j < clearShape[i].length; j++) {
            if (clearShape[i][j] && (!board[row + i] || !board[row + i][col + j] || board[row + i][col + j] !== 'Empty'))    
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