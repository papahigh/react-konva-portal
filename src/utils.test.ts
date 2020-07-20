import { PortalMeta } from './types';
import { mountCmd, notUnmountByKey, unmountCmd, updateCmd, zIndexComparator } from './utils';

describe('utils.ts', () => {
  describe('notUnmountByKey()', () => {
    it('should handle unknown key', () => {
      const actions = [mountCmd(1, 0, null), updateCmd(2, 0, null), unmountCmd(3)];
      const result = actions.find(notUnmountByKey(-1));
      expect(result).toBeUndefined();
    });

    it('should return first `mount` operation', () => {
      const actions = [
        mountCmd(1, 0, null),
        mountCmd(2, 0, null),
        unmountCmd(3),
        mountCmd(3, 0, null),
        updateCmd(3, 0, null),
      ];
      const result = actions.find(notUnmountByKey(3));
      expect(result).toBe(actions[3]);
    });

    it('should return first `update` operation', () => {
      const actions = [
        mountCmd(1, 0, null),
        mountCmd(2, 0, null),
        updateCmd(3, 0, null),
        mountCmd(3, 0, null),
        unmountCmd(3),
      ];
      const result = actions.find(notUnmountByKey(3));
      expect(result).toBe(actions[2]);
    });

    it('should ignore `unmount` operation', () => {
      const actions = [mountCmd(1, 0, null), unmountCmd(2), mountCmd(3, 0, null), mountCmd(2, 0, null)];
      const result = actions.find(notUnmountByKey(2));
      expect(result).toBe(actions[3]);
    });
  });

  describe('zIndexComparator()', () => {
    function createNode(zIndex?: number) {
      return { zIndex, key: 0, children: null };
    }

    it('should sort by zIndex value', () => {
      const nodes: PortalMeta[] = [
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
