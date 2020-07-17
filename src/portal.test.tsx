import { render } from '@testing-library/react';
import React from 'react';
import { Layer, Text } from 'react-konva';
import { assertPortalManager, ERROR_MESSAGE, Portal } from './portal';
import { PortalStage as Stage } from './portal-stage';

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

  describe('assertPortalManager()', () => {
    it('returns `true` for valid instance', () => {
      const fn = jest.fn();
      const instance = { mount: fn, unmount: fn, update: fn };
      const result = assertPortalManager(instance);
      expect(result).toBeTruthy();
    });

    it('throws error for incorrect input', () => {
      const tryAction = (val: any) => () => assertPortalManager(val);
      expect(tryAction(Infinity)).toThrow(ERROR_MESSAGE);
      expect(tryAction({})).toThrow(ERROR_MESSAGE);
      expect(tryAction(true)).toThrow(ERROR_MESSAGE);
      expect(tryAction(false)).toThrow(ERROR_MESSAGE);
      expect(tryAction('Hello')).toThrow(ERROR_MESSAGE);
    });

    it('throws error if manager is `null` or `undefined`', () => {
      const tryAction = (val: null | undefined) => () => assertPortalManager(val);
      expect(tryAction(null)).toThrow(ERROR_MESSAGE);
      expect(tryAction(undefined)).toThrow(ERROR_MESSAGE);
    });
  });
});
