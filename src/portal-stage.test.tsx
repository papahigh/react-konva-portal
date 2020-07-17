import { render } from '@testing-library/react';
import React from 'react';
import { BufferedAction, pendingPredicate, PortalStage } from './portal-stage';

describe('portal-stage.tsx', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<PortalStage />);
    expect(asFragment()).toMatchSnapshot();
  });

  describe('pendingPredicate()', () => {
    function createAction(key: number, type: 'mount' | 'unmount' | 'update' = 'mount') {
      return { type, key, children: null } as BufferedAction;
    }

    it('should handle unknown key', () => {
      const actions: BufferedAction[] = [createAction(1), createAction(2), createAction(3)];
      const result = actions.find(pendingPredicate(-1));
      expect(result).toBeUndefined();
    });

    it('should return first `mount` operation', () => {
      const actions: BufferedAction[] = [
        createAction(1),
        createAction(2),
        createAction(3, 'unmount'),
        createAction(3, 'mount'),
        createAction(3, 'update'),
      ];
      const result = actions.find(pendingPredicate(3));
      expect(result).toBe(actions[3]);
    });

    it('should return first `update` operation', () => {
      const actions: BufferedAction[] = [
        createAction(1),
        createAction(2),
        createAction(3, 'update'),
        createAction(3, 'unmount'),
        createAction(3, 'mount'),
      ];
      const result = actions.find(pendingPredicate(3));
      expect(result).toBe(actions[2]);
    });

    it('should ignore `unmount` operation', () => {
      const actions: BufferedAction[] = [
        createAction(1),
        createAction(2, 'unmount'),
        createAction(3),
        createAction(2, 'unmount'),
      ];
      const result = actions.find(pendingPredicate(-1));
      expect(result).toBeUndefined();
    });
  });
});
