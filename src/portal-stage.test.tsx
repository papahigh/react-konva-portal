import { mount } from 'enzyme';
import Konva from 'konva';
import noop from 'lodash/noop';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  Layer as ReactKonvaLayer,
  Rect,
  Stage as ReactKonvaStage,
  StageProps as ReactKonvaStageProps,
} from 'react-konva';

import Layer from './portal-layer';
import Stage from './portal-stage';
import { PORTAL_LAYER_ID } from './utils';

describe('portal-stage.tsx', () => {
  class App extends Component<ReactKonvaStageProps> {
    public stageRef: ReactKonvaStage | null = null;
    public render() {
      return <Stage {...this.props} ref={ref => (this.stageRef = ref)} />;
    }
  }

  it('should forward ref', () => {
    const wrapper = mount<App>(<App />);
    const stageRef = wrapper.instance().stageRef;

    expect(typeof stageRef?.getStage).toEqual('function');
    expect(stageRef?.getStage()).toBeInstanceOf(Konva.Stage);
  });

  it('should pass-down props', () => {
    const wrapper = mount<App>(<App id="stage-1" x={-100} width={100} height={200} listening={false} />);
    const stage = wrapper.instance().stageRef?.getStage();

    expect(stage?.id()).toEqual('stage-1');
    expect(stage?.x()).toEqual(-100);
    expect(stage?.y()).toEqual(0);
    expect(stage?.width()).toEqual(100);
    expect(stage?.height()).toEqual(200);
    expect(stage?.listening()).toEqual(false);
  });

  it('should render portal layer', () => {
    const wrapper = mount<App>(<App />);
    const stage = wrapper.instance().stageRef?.getStage();
    const layers = stage?.getLayers() || [];

    expect(layers?.length).toEqual(1);
    expect(layers[0]?.id()).toEqual(PORTAL_LAYER_ID);
  });

  it('should handle layer components', () => {
    const wrapper = mount<App>(
      <App>
        <Layer id="host-layer" />
        <ReactKonvaLayer id="regular-layer" />
      </App>,
    );

    const stage = wrapper.instance().stageRef?.getStage();
    const layers = stage?.getLayers() || [];

    expect(layers.length).toEqual(3);
    expect(layers[0].id()).toEqual('host-layer');
    expect(layers[1].id()).toEqual('regular-layer');
    expect(layers[2].id()).toEqual(PORTAL_LAYER_ID);
  });

  it('throws error if children is not a Layer', () => {
    const _error = console.error;
    console.error = noop;
    expect(() =>
      mount(
        <App>
          <Rect fill="red" width={100} height={100} />
        </App>,
      ),
    ).toThrow('Konva error: You may only add layers to the stage.');
    console.error = _error;
  });

  it('should match snapshot', () => {
    const domElement = document.createElement('div');
    ReactDOM.render(<Stage />, domElement);
    expect(domElement).toMatchSnapshot();
  });
});
