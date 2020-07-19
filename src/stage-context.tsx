import React, { createContext, PropsWithChildren, useContext, useLayoutEffect, useMemo } from 'react';
import { PortalStageContext } from './types';
import { assertStageContext } from './utils';

export const StageContext = createContext<PortalStageContext | null>(null);

export function useStageContext() {
  const value = useContext(StageContext);
  useLayoutEffect(() => assertStageContext(value), [value]);
  return value;
}

function Provider({
  mount,
  unmount,
  update,
  children,
  addManager,
  removeManager,
}: PropsWithChildren<PortalStageContext>) {
  const value = useMemo(() => ({ mount, unmount, update, addManager, removeManager }), [
    mount,
    unmount,
    update,
    addManager,
    removeManager,
  ]);
  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}

export default Provider;
