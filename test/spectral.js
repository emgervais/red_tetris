import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { PhantomBoard } from '../src/client/components/spectral';

describe('PhantomBoard Component', () => {
  it('should render placeholder when board is null', () => {
    const { container, getByText } = render(<PhantomBoard name="Opponent1" board={null} />);
    expect(getByText(/Waiting for opponent/i)).to.exist;
    expect(container.querySelector('.phantom-board')).to.be.null;
  });

  it('should render a 10x20 grid when board is provided', () => {
    const board = Array(10).fill(19); // all columns have height = 19 (bottom)
    const { container } = render(<PhantomBoard name="TestPlayer" board={board} />);
    
    const rows = container.querySelectorAll('.phantom-row');
    expect(rows.length).to.equal(20); // 20 rows

    const cells = container.querySelectorAll('.phantom-cell');
    expect(cells.length).to.equal(20 * 10); // 10 cols × 20 rows
  });

  it('should apply "spec" class to correct cells', () => {
    const board = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Each column's top filled cell is increasing
    const { container } = render(<PhantomBoard name="SpecTest" board={board} />);
    const specCells = container.querySelectorAll('.phantom-cell.spec');
    
    // Each col should mark only one .spec at the board[col] row
    expect(specCells.length).to.equal(10);

    // Check that spec class appears at expected row/col
    specCells.forEach((cell, index) => {
      const expectedRow = board[index];
      const expectedCell = container.querySelector(`.phantom-row:nth-child(${expectedRow + 2}) .phantom-cell:nth-child(${index + 1})`);
      expect(cell).to.equal(expectedCell);
    });
  });
});

