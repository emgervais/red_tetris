const piece_S = 
[[0, 1, 1],
 [1, 1, 0]]
 
const piece_Z =
[[1, 1, 0],
 [0, 1, 1]]

const piece_L =
[[0, 0, 1],
 [1, 1, 1]]

const piece_J =
[[1, 0, 0],
 [1, 1, 1]]

const piece_T =
[[0, 1, 0],
 [1, 1, 1]]


const piece_O =
[[1, 1],
 [1, 1]]

const piece_I =
[[1, 1, 1, 1]]

export const pieces = {'S': piece_S, 'Z': piece_Z, 'L':piece_L,'J':piece_J, 'T':piece_T, 'O':piece_O, 'I':piece_I}

export const transpose = (matrix) => {

    matrix = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    return matrix.map(row => row.reverse());
}