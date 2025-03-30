import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { PiecePreview } from '../src/client/components/piecePreview';
import { pieces } from '../src/client/core/piece';

describe('PiecePreview Component', () => {
  it('should render nothing if no piece is provided', () => {
    const { container } = render(<PiecePreview piece={null} />);
    expect(container.firstChild).to.be.null;
  });

  it('should render 8 preview cells', () => {
    const { container } = render(<PiecePreview piece="T" />);
    const cells = container.querySelectorAll('.preview-cell');
    expect(cells.length).to.equal(8);
  });

  it('should apply correct class names for active cells', () => {
    const { container } = render(<PiecePreview piece="T" />);
    const activeCells = container.querySelectorAll('.preview-cell.T');
    // Count how many non-zero cells are in pieces["T"]
    const flat = pieces["T"].flat();
    const expectedActive = flat.filter(Boolean).length;
    expect(activeCells.length).to.equal(expectedActive);
  });
});
