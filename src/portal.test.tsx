import { mount } from 'enzyme';
import Konva from 'konva';
import noop from 'lodash/noop';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Stage as ReactKonvaStage, Text } from 'react-konva';

import Portal from './portal';
import Group from './portal-group';
import Layer from './portal-layer';
import Stage from './portal-stage';
import { PortalProps } from './types';
import { ERROR_MESSAGE, PORTAL_LAYER_ID } from './utils';

describe('portal.tsx', () => {
  describe('content movement', () => {
    class App extends Component<PortalProps, PortalProps> {
      public state = { containerId: this.props.containerId, zIndex: this.props.zIndex };
      public stageRef: ReactKonvaStage | null = null;

      public set containerId(containerId: string | undefined) {
        this.setState({ containerId });
      }

      public render() {
        return (
          <Stage ref={ref => (this.stageRef = ref)}>
            <Layer id="layer-slot-1">
              <Group id="group-slot-1">
                <Group id="group-slot-2" />
              </Group>
            </Layer>
            <Layer id="layer-origin">
              <Portal containerId={this.state.containerId} zIndex={this.state.zIndex}>
                <Text name="x-content" />
              </Portal>
            </Layer>
            <Layer id="layer-slot-2" />
          </Stage>
        );
      }
    }

    function findFirst<Node extends Konva.Node>(stage?: Konva.Stage, query?: string) {
      return stage?.find(query)?.toArray()[0] as Node;
    }

    function assertNotFound(stage?: Konva.Stage, ...ids: string[]) {
      for (const id of ids) {
        const container = findFirst<Konva.Container>(stage, '#' + id);
        const textNodes = container?.children.toArray().filter(node => node.nodeType === 'Text');
        expect(textNodes.length).toEqual(0);
      }
    }

    function assertContains(stage?: Konva.Stage, id?: string) {
      const container = findFirst<Konva.Container>(stage, '#' + id);
      const textNodes = container?.find('Text');
      expect(textNodes.length).toEqual(1);
      expect(textNodes[0].name()).toEqual('x-content');
    }

    it('should render content', async () => {
      const wrapper = mount<App>(<App />);
      const stage = wrapper.instance().stageRef?.getStage();

      // origin is empty
      assertNotFound(stage, 'layer-origin');
      // slots are empty
      assertNotFound(stage, 'layer-slot-1', 'layer-slot-2', 'group-slot-1', 'group-slot-2');
      // by default content is rendered in portal layer of a Stage
      assertContains(stage, PORTAL_LAYER_ID);
    });

    it('should teleport into origin', () => {
      const wrapper = mount<App>(<App containerId="layer-origin" />);
      const stage = wrapper.instance().stageRef?.getStage();

      assertNotFound(stage, 'layer-slot-1', 'layer-slot-2', 'group-slot-1', 'group-slot-2');
      assertNotFound(stage, PORTAL_LAYER_ID);

      assertContains(stage, 'layer-origin');
    });

    it('should teleport into layer', () => {
      const wrapper = mount<App>(<App containerId="layer-slot-2" />);
      const stage = wrapper.instance().stageRef?.getStage();

      assertNotFound(stage, 'layer-origin');
      assertNotFound(stage, 'layer-slot-1', 'group-slot-1', 'group-slot-2');
      assertNotFound(stage, PORTAL_LAYER_ID);

      assertContains(stage, 'layer-slot-2');
    });

    it('should teleport into group', () => {
      const wrapper = mount<App>(<App containerId="group-slot-1" />);
      const stage = wrapper.instance().stageRef?.getStage();

      assertNotFound(stage, 'layer-origin');
      assertNotFound(stage, 'layer-slot-1', 'layer-slot-2', 'group-slot-2');
      assertNotFound(stage, PORTAL_LAYER_ID);

      assertContains(stage, 'group-slot-1');
    });

    it('should teleport into nested group', () => {
      const wrapper = mount<App>(<App containerId="group-slot-2" />);
      const stage = wrapper.instance().stageRef?.getStage();

      assertNotFound(stage, 'layer-origin');
      assertNotFound(stage, 'layer-slot-1', 'layer-slot-2', 'group-slot-1');
      assertNotFound(stage, PORTAL_LAYER_ID);

      assertContains(stage, 'group-slot-2');
    });

    it('should handle contentId change', () => {
      const wrapper = mount<App>(<App containerId="group-slot-2" />);
      const instance = wrapper.instance();
      const stage = instance.stageRef?.getStage();

      assertContains(stage, 'group-slot-2');

      instance.containerId = 'layer-slot-1'; // move to 'layer-slot-1'

      assertContains(stage, 'layer-slot-1'); // found

      assertNotFound(stage, 'layer-origin');
      assertNotFound(stage, 'layer-slot-1', 'group-slot-1', 'group-slot-2');
      assertNotFound(stage, PORTAL_LAYER_ID);

      instance.containerId = undefined; // move to default portals layer

      assertNotFound(stage, 'layer-origin');
      assertNotFound(stage, 'layer-slot-1', 'layer-slot-2', 'group-slot-1', 'group-slot-2');

      assertContains(stage, PORTAL_LAYER_ID); // found
    });
  });

  describe('content ordering', () => {
    class App extends Component<{ a: PortalProps; b: PortalProps }, { a: PortalProps; b: PortalProps }> {
      public state = { a: this.props.a, b: this.props.b };
      public stageRef: ReactKonvaStage | null = null;

      public moveA = (to: PortalProps) => this.setState(from => ({ ...from, a: { ...from.a, ...to } }));
      public moveB = (to: PortalProps) => this.setState(from => ({ ...from, b: { ...from.b, ...to } }));

      public render() {
        return (
          <Stage ref={ref => (this.stageRef = ref)}>
            <Layer id="layer-slot" />
            <Layer id="layer-origin">
              <Portal {...this.state.a}>
                <Text name="A" />
              </Portal>
              <Portal {...this.state.b}>
                <Text name="B" />
              </Portal>
            </Layer>
          </Stage>
        );
      }
    }

    function assertEmpty(stage: Konva.Stage, id: string) {
      const container = stage.find('#' + id)[0];
      expect(container?.children.length).toEqual(0);
    }

    function assertOrder(stage: Konva.Stage, id: string, ...ordered: string[]) {
      const container = stage?.find('#' + id)[0] as Konva.Container;
      const children = container?.children;
      expect(children.length).toEqual(ordered.length);
      ordered.forEach((content, index) => expect(children[index].name()).toEqual(content));
    }

    function portalProps(zIndex?: number) {
      return { zIndex, containerId: 'layer-slot' };
    }

    it('when mounted in natural order', () => {
      const wrapper = mount<App>(<App a={portalProps()} b={portalProps()} />);

      const instance = wrapper.instance();
      const stage = instance.stageRef?.getStage() as Konva.Stage;

      assertOrder(stage, 'layer-slot', 'A', 'B'); // natural order
      assertEmpty(stage, 'layer-origin');

      instance.moveA({ zIndex: 4 });

      assertOrder(stage, 'layer-slot', 'B', 'A');
      assertEmpty(stage, 'layer-origin');

      instance.moveA({ zIndex: -10 });

      assertOrder(stage, 'layer-slot', 'A', 'B');
      assertEmpty(stage, 'layer-origin');

      instance.moveB({ zIndex: -1000 });

      assertOrder(stage, 'layer-slot', 'B', 'A');
      assertEmpty(stage, 'layer-origin');
    });

    it('when mounted in specific order', () => {
      const wrapper = mount<App>(<App a={portalProps(555)} b={portalProps(111)} />);

      const instance = wrapper.instance();
      const stage = instance.stageRef?.getStage() as Konva.Stage;

      assertOrder(stage, 'layer-slot', 'B', 'A'); // mount order
      assertEmpty(stage, 'layer-origin');

      instance.moveB({ zIndex: 54 });

      assertOrder(stage, 'layer-slot', 'B', 'A');
      assertEmpty(stage, 'layer-origin');
    });
  });

  it('throws error if rendered out of Stage', () => {
    const _error = console.error;
    console.error = noop;
    expect(() =>
      mount(
        <Portal>
          <Text name="x-content" />
        </Portal>,
      ),
    ).toThrow(ERROR_MESSAGE);
    console.error = _error;
  });

  it('should match snapshot', () => {
    const domElement = document.createElement('div');
    ReactDOM.render(
      <Stage>
        <Layer>
          <Portal>
            <Text text="Hello from Portal" />
          </Portal>
          <Text text="Hello world" />
        </Layer>
      </Stage>,
      domElement,
    );
    expect(domElement).toMatchSnapshot();
  });
});
