import { mount } from 'enzyme';
import Konva from 'konva';
import noop from 'lodash/noop';
import React, { Component } from 'react';

import Layer from './portal-layer';
import Stage from './portal-stage';
import { ERROR_MESSAGE } from './utils';

describe('portal-layer.tsx', () => {
  class App extends Component<Konva.LayerConfig> {
    public layerRef: Konva.Group | null = null;
    public render() {
      return (
        <Stage>
          <Layer {...this.props} ref={ref => (this.layerRef = ref)} />
        </Stage>
      );
    }
  }

  it('should forward ref', () => {
    const wrapper = mount<App>(<App />);
    const layerRef = wrapper.instance().layerRef;

    expect(layerRef).toBeInstanceOf(Konva.Layer);
  });

  it('should pass-down props', () => {
    const wrapper = mount<App>(<App id="layer-1" y={-100} listening={false} />);
    const layerRef = wrapper.instance().layerRef;

    expect(layerRef?.id()).toEqual('layer-1');
    expect(layerRef?.x()).toEqual(0);
    expect(layerRef?.y()).toEqual(-100);
    expect(layerRef?.listening()).toEqual(false);
  });

  it('throws error if rendered out of Stage', () => {
    const _error = console.error;
    console.error = noop;
    expect(() => mount(<Layer />)).toThrow(ERROR_MESSAGE);
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
    ).toThrow('Konva error: You may only add groups and shapes to a layer.');
    console.error = _error;
  });
});
