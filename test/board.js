import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import sinon from 'sinon';

import { Board } from '../src/client/components/board';
import * as CellModule from '../src/client/components/cell';

describe('Board Component', () => {
  const mockBoard = [
    ['Empty', 'T', 'Z'],
    ['O', 'Empty', 'J']
  ];

  it('should render correct number of rows and cells', () => {
    const { container } = render(<Board currentBoard={mockBoard} />);
    const rows = container.querySelectorAll('.row');
    const cells = container.querySelectorAll('.cell');

    expect(rows.length).to.equal(2); // 2 rows
    expect(cells.length).to.equal(6); // 2 rows × 3 columns
  });

  it('should render each Cell with correct type', () => {
    const spy = sinon.spy(CellModule, 'Cell');
    
    render(<Board currentBoard={mockBoard} />);
    
    expect(spy.callCount).to.equal(6); // 2x3 cells

    // Check a few expected calls
    expect(spy.getCall(0).args[0].type).to.equal('Empty');
    expect(spy.getCall(1).args[0].type).to.equal('T');
    expect(spy.getCall(5).args[0].type).to.equal('J');

    spy.restore();
  });
});
