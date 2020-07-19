import React, { useState } from 'react';
import { Group, Layer, Portal, Stage } from 'react-konva-portal';

import './App.css';

import { Element } from './components/Element';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { useWindowSize } from './hooks/useWindowSize';

export const CANVAS_SIZE = 340;
export const MAX_ELEMENTS = 3;
export const ELEMENT_SIZE = 140;
export const ELEMENT_SPACING = -20;

export function App() {
  const { width } = useWindowSize();
  const [destination, setDestination] = useState<string | undefined>();

  const xOffset = width == null ? 0 : width / 2 - (MAX_ELEMENTS * (ELEMENT_SIZE + ELEMENT_SPACING)) / 2;
  const elementSize = ELEMENT_SIZE + ELEMENT_SPACING;
  const y = CANVAS_SIZE / 2 - ELEMENT_SIZE / 2;
  const canMoveA = destination !== 'groupB' && destination !== 'groupC';
  const size = ELEMENT_SIZE;

  return (
    <div className="container">
      <Header />
      <Stage width={width} height={CANVAS_SIZE} className="stage-example">
        <Layer id="layer1" />
        <Layer id="layer2">
          <Portal containerId={destination}>
            <Group id="groupA" draggable={canMoveA}>
              <Element label="A" size={size} y={y} x={xOffset} />
            </Group>
          </Portal>
          <Group id="groupB" draggable={true}>
            <Element label="B" size={size} y={y} x={xOffset + elementSize} />
          </Group>
        </Layer>
        <Layer id="layer3">
          <Group id="groupC" draggable={true}>
            <Element label="C" size={size} y={y} x={xOffset + 2 * elementSize} />
          </Group>
        </Layer>
      </Stage>
      <Footer
        moveToB={() => setDestination('groupB')}
        moveToC={() => setDestination('groupC')}
        moveTo1={() => setDestination('layer1')}
        moveTo2={() => setDestination('layer2')}
        moveTo3={() => setDestination('layer3')}
      />
    </div>
  );
}

export default App;
