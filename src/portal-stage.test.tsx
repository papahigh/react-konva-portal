import { render } from '@testing-library/react';
import React from 'react';
import PortalStage from './portal-stage';

describe('portal-stage.tsx', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<PortalStage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
