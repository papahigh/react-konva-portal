import { mount, ReactWrapper } from 'enzyme';
import Konva from 'konva';
import React, { Component } from 'react';
import { Rect, Stage as ReactKonvaStage } from 'react-konva';

import Layer from './portal-layer';
import Manager from './portal-manager';
import Stage from './portal-stage';
import { PortalManagerRef } from './types';
import { mountCmd, unmountCmd, updateCmd } from './utils';

describe('portal-manager.tsx', () => {
  class App extends Component {
    public stageRef: ReactKonvaStage | null = null;
    public managerRef: PortalManagerRef | null = null;
    public render() {
      return (
        <Stage ref={ref => (this.stageRef = ref)}>
          <Layer id="layer-1">
            <Manager ref={ref => (this.managerRef = ref)} />
          </Layer>
        </Stage>
      );
    }
  }

  let wrapper: ReactWrapper<any, any, App> | undefined = undefined;
  let stage: Konva.Stage | null = null;
  let manager: PortalManagerRef | null = null;
  let layer: Konva.Layer | null = null;

  beforeEach(() => {
    wrapper = mount<App>(<App />);
    stage = wrapper.instance().stageRef?.getStage() as Konva.Stage;
    manager = wrapper.instance().managerRef as PortalManagerRef;
    layer = stage?.find('#layer-1')?.toArray()[0] as Konva.Layer;
  });

  it('should handle mount command', () => {
    expect(layer?.children.length).toEqual(0);

    manager?.handle(mountCmd(1, 1, <Rect name="rect-1" />));

    expect(layer?.children.length).toEqual(1);
    expect(layer?.children[0].name()).toEqual('rect-1');
  });

  it('should handle unmount command', () => {
    manager?.handle(mountCmd(1, 1, <Rect name="rect-1" />));

    expect(layer?.children.length).toEqual(1);
    expect(layer?.children[0].name()).toEqual('rect-1');

    manager?.handle(unmountCmd(1));

    expect(layer?.children.length).toEqual(0);
  });

  it('should handle update command', () => {
    manager?.handle(mountCmd(1, 1, <Rect name="rect-1" />));

    expect(layer?.children.length).toEqual(1);
    expect(layer?.children[0].name()).toEqual('rect-1');

    manager?.handle(updateCmd(1, 1, <Rect name="rect-1-updated" />));

    expect(layer?.children.length).toEqual(1);
    expect(layer?.children[0].name()).toEqual('rect-1-updated');
  });

  it('should handle batched commands', () => {
    manager?.handle([
      mountCmd(1, 1, <Rect name="rect-1" />),
      mountCmd(2, 1, <Rect name="rect-2" />),
      updateCmd(1, 1, <Rect name="rect-1-updated" />),
      unmountCmd(2), // drop content with key 2
      mountCmd(3, 1, <Rect name="rect-3" />),
      updateCmd(-200, 1, <Rect name="ignored" />), // unknown key
      unmountCmd(-100), // unknown key
    ]);

    expect(layer?.children.length).toEqual(2);
    expect(layer?.children[0].name()).toEqual('rect-1-updated');
    expect(layer?.children[1].name()).toEqual('rect-3');

    manager?.handle(updateCmd(1, 100, <Rect name="z-index-updated" />));

    expect(layer?.children.length).toEqual(2);
    expect(layer?.children[0].name()).toEqual('rect-3');
    expect(layer?.children[1].name()).toEqual('z-index-updated');
  });
});
