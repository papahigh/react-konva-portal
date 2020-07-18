import { render } from '@testing-library/react';
import React from 'react';
import { Layer, Text } from 'react-konva';

import Portal from './portal';
import Stage from './portal-stage';

describe('portal.tsx', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(
      <Stage>
        <Layer>
          <Portal>
            <Text align="center" verticalAlign="middle" text="Hello from Portal" />
          </Portal>
          <Text align="center" verticalAlign="middle" text="Hello from Outside" />
        </Layer>
      </Stage>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
