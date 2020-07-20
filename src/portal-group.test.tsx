import { mount } from 'enzyme';
import Konva from 'konva';
import noop from 'lodash/noop';
import React, { Component } from 'react';
import { Layer } from 'react-konva';

import Group from './portal-group';
import Stage from './portal-stage';
import { ERROR_MESSAGE } from './utils';

describe('portal-group.tsx', () => {
  class App extends Component<Konva.NodeConfig> {
    public groupRef: Konva.Group | null = null;
    public render() {
      return (
        <Stage>
          <Layer>
            <Group {...this.props} ref={ref => (this.groupRef = ref)} />
          </Layer>
        </Stage>
      );
    }
  }

  it('should forward ref', () => {
    const wrapper = mount<App>(<App />);
    const groupRef = wrapper.instance().groupRef;

    expect(groupRef).toBeInstanceOf(Konva.Group);
  });

  it('should pass-down props', () => {
    const wrapper = mount<App>(<App id="group-1" y={-200} width={200} height={400} listening={false} />);
    const groupRef = wrapper.instance().groupRef;

    expect(groupRef?.id()).toEqual('group-1');
    expect(groupRef?.x()).toEqual(0);
    expect(groupRef?.y()).toEqual(-200);
    expect(groupRef?.width()).toEqual(200);
    expect(groupRef?.height()).toEqual(400);
    expect(groupRef?.listening()).toEqual(false);
  });

  it('throws error if rendered out of Stage', () => {
    const _error = console.error;
    console.error = noop;
    expect(() => mount(<Group />)).toThrow(ERROR_MESSAGE);
    console.error = _error;
  });

  it('throws error if children is Layer', () => {
    const _error = console.error;
    console.error = noop;
    expect(() =>
      mount(
        <App>
          <Layer />
        </App>,
      ),
    ).toThrow('Konva error: You may only add groups and shapes to groups.');
    console.error = _error;
  });
});
