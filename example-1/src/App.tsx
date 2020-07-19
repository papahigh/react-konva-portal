import React, { useState } from 'react';
import { Layer } from 'react-konva';
import { Stage } from 'react-konva-portal';

import './App.css';

import { Element } from './components/Element';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Overlay } from './components/Overlay';
import { useWindowSize } from './hooks/useWindowSize';

const CANVAS_SIZE = 340;
const MAX_ELEMENTS = 4;
const ELEMENT_SIZE = 140;
const ELEMENT_SPACING = -20;

export function App() {
  const [usePortal, setUsePortal] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  const togglePortal = () => setUsePortal(value => !value);
  const toggleOverlay = () => setShowOverlay(value => !value);

  const { width } = useWindowSize();
  const xOffset = width == null ? 0 : width / 2 - (MAX_ELEMENTS * (ELEMENT_SIZE + ELEMENT_SPACING)) / 2;
  const viewport = { width, height: CANVAS_SIZE };

  return (
    <div className="container">
      <Header />
      <Stage {...viewport} className="stage-example">
        <Layer name="layer-example">
          {Array(MAX_ELEMENTS)
            .fill(0)
            .map((_, i) => (
              <Element
                key={i}
                x={xOffset + i * (ELEMENT_SIZE + ELEMENT_SPACING)}
                y={CANVAS_SIZE / 2 - ELEMENT_SIZE / 2}
                size={ELEMENT_SIZE}
                usePortal={usePortal}
                zIndex={MAX_ELEMENTS - i}
              />
            ))}
        </Layer>
        <Layer name="layer-overlay">
          <Overlay {...viewport} showOverlay={showOverlay} />
        </Layer>
      </Stage>
      <Footer
        portalEnabled={usePortal}
        overlayEnabled={showOverlay}
        toggleOverlayEnabled={toggleOverlay}
        togglePortalEnabled={togglePortal}
      />
    </div>
  );
}

export default App;
