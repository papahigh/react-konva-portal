# react-konva-portal

> Portal API support for react-konva

[![NPM](https://img.shields.io/npm/v/react-konva-portal.svg)](https://www.npmjs.com/package/react-konva-portal)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

`react-konva-portal` provides [react portal](https://reactjs.org/docs/portals.html) support to `react-konva`. If you
want to have some `KonvaNode` components rendered outside your component hierarchy you can use `Stage` and `Portal`
components exposed by this library.

## Install

```bash
yarn add react-konva-portal
```

Please note that this package depends on `react`, `konva` and `konva-konva` packages.

## Usage

You should define your stage using `Stage` component from 'react-konva-portal'. `Stage` supports all original props; In
order to make `KonvaNode` component rendered outside your current react tree wrap target content with `Portal` component
from 'react-konva-portal'.

```jsx
import React, { Component } from 'react';
import { Rect, Text, Layer } from 'react-konva';
import { Stage, Portal } from 'react-konva-portal';

class ExampleStage extends Component {
  render() {
    return (
      <Stage>
        <Layer name="example-layer">
          <Portal>
            <Text text="This content will be rendered in a Portal (above overlay-layer)." />
          </Portal>
        </Layer>
        <Layer name="overlay-layer">
          <Rect />
        </Layer>
      </Stage>
    );
  }
}
```

## License

MIT © [papahigh](https://github.com/papahigh)
