import { render } from '@testing-library/react';
import React from 'react';
import { PortalManager, PortalNode, UpdateStrategy, zIndexComparator } from './portal-manager';

describe('portal-manager.tsx', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<PortalManager updateStrategy={UpdateStrategy.SCHEDULED} />);
    expect(asFragment()).toMatchSnapshot();
  });

  describe('zIndexComparator()', () => {
    function createNode(zIndex?: number) {
      return { zIndex, key: 0, children: null };
    }

    it('should sort by zIndex value', () => {
      const nodes: PortalNode[] = [
        createNode(20),
        createNode(40),
        createNode(0),
        createNode(10),
        createNode(50),
        createNode(-100),
        createNode(30),
        createNode(-10),
        createNode(60),
      ];
      const result = nodes.sort(zIndexComparator);
      expect(result).toStrictEqual([
        createNode(-100),
        createNode(-10),
        createNode(0),
        createNode(10),
        createNode(20),
        createNode(30),
        createNode(40),
        createNode(50),
        createNode(60),
      ]);
    });

    it('should handle missing zIndex value', () => {
      const input = [
        createNode(),
        createNode(40),
        createNode(60),
        createNode(10),
        createNode(50),
        createNode(-100),
        createNode(undefined),
        createNode(30),
        createNode(-10),
      ];
      const result = input.sort(zIndexComparator);
      expect(result).toStrictEqual([
        createNode(-100),
        createNode(-10),
        createNode(),
        createNode(),
        createNode(10),
        createNode(30),
        createNode(40),
        createNode(50),
        createNode(60),
      ]);
    });
  });
});
