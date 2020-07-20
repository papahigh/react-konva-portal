import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { PortalStageContext } from './types';
import { ERROR_MESSAGE } from './utils';

export const StageContext = createContext<PortalStageContext | null>(null);

function Provider({
  mount,
  unmount,
  update,
  children,
  addManager,
  removeManager,
}: PropsWithChildren<PortalStageContext>) {
  const value = useMemo(() => {
    const context = { mount, unmount, update, addManager, removeManager };
    Object.defineProperty(context, '__type', { value: TYPE_MARKER, enumerable: false, writable: false });
    return context;
  }, [mount, unmount, update, addManager, removeManager]);
  return <StageContext.Provider value={value}>{children}</StageContext.Provider>;
}

const TYPE_MARKER = Symbol();

function isStageContext(val: any): val is PortalStageContext {
  return val && typeof val === 'object' && val['__type'] === TYPE_MARKER;
}

export function useStageContext() {
  const value = useContext(StageContext);
  if (!isStageContext(value)) throw new Error(ERROR_MESSAGE);
  return value;
}

export default Provider;
