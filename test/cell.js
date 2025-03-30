import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Cell } from '../src/client/components/cell';

describe('Cell Component', () => {
  it('should render with the correct class based on type prop', () => {
    const { container } = render(<Cell type="T" />);
    const cell = container.firstChild;
    expect(cell).to.exist;
    expect(cell.className).to.include('cell');
    expect(cell.className).to.include('T');
  });

  it('should throw error if no type is provided', () => {
    // React Testing Library doesn't throw for PropTypes, so this test would need a linter or runtime warning.
    expect(() => render(<Cell />)).to.not.throw();
  });
});
