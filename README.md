# react-konva-portal

> Portals support for [react-konva](https://github.com/konvajs/react-konva)

Teleport your `canvas` components across groups, layers and canvas elements regardless your component hierarchy. This
library provides portals support for `react-konva` components and may
facilitate in&nbsp;a&nbsp;complex canvas scene compositions.

<img src="https://i.imgur.com/XKOPPBN.gif[420,420]" width="420px" alt="react-konva-portal first example" />
<br/>

Example projects [link1](https://github.com/papahigh/react-konva-portal/tree/master/example-1),
[link2](https://github.com/papahigh/react-konva-portal/tree/master/example-2).

## Install

```bash
yarn add react-konva-portal
```

IMPORTANT: Please note, this package depends on `konva` and `react-konva` packages.

## Usage

Replace `react-konva` root component with `Stage` from `react-konva-portal`. Please use it as a drop-in replacement of
the original one. It is required in order for portals to work.

> Any React content inside `<Portal />` will be&nbsp;rendered outside of&nbsp;its tree hierarchy.

## Example

```javascript
import React, { Component } from 'react';
import { Rect, Text, Layer } from 'react-konva';
import { Stage, Portal } from 'react-konva-portal';

class PortalExample extends Component {
  render() {
    return (
      <Stage width={400} height={400}>
        <Layer id="example-layer">
          <Portal>
            <Text text="This content will be rendered in a Portal (above overlay-layer)." width={400} height={400} />
          </Portal>
        </Layer>
        <Layer id="overlay-layer">
          <Rect fill="#c1f7ff" width={400} height={400} />
        </Layer>
      </Stage>
    );
  }
}
```

Optionally, You may refine desired render destination with `containerId` and `zIndex`.

> With `containerId` pointing to&nbsp;`Layer`/`Group` component from `react-konva-portal`
> in&nbsp;your app&nbsp;tree.
>
> You may also provide stacking order in&nbsp;container with `zIndex` property.

```javascript
import React, { Component } from 'react';
import { Rect, Text } from 'react-konva';
import { Group, Stage, Portal, Layer } from 'react-konva-portal';

function Content({ text }) {
  return <Text text={text} width={400} height={400} />;
}

class TeleportExample extends Component {
  render() {
    return (
      <Stage width={400} height={400}>
        <Layer id="content-layer">
          <Portal containerId="another-layer">
            <Content text="Will be rendered as a children of <Layer id={'another-layer'} />" />
          </Portal>
          <Portal>
            <Content text="Will be rendered as a children of default portals layer in `Stage`" />
          </Portal>
          <Portal containerId="some-group" zIndex={100}>
            <Content text="Will be rendered as a children of <Group id={'some-group'} /> with specified stacking order" />
          </Portal>
          <Portal containerId="some-group">
            <Content text="Will be rendered as a children of <Group id={'some-group'} />" />
          </Portal>
        </Layer>
        <Layer id="another-layer">
          <Group id="some-group" />
        </Layer>
      </Stage>
    );
  }
}
```

---

## API

This package exposes `Stage`, `Portal`, `Layer` and `Group` React components.

```javascript
import { Group, Stage, Portal, Layer } from 'react-konva-portal';
```

### Stage

Root component for working with canvas scene composition. It accepts all `Konva.Stage` props and forwards the original
`ref`.

| Prop               | Note                                                                                                                                |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| portalLayerProps | Optional. Accepts `Konva.LayerConfig` and forwards it&nbsp;to&nbsp;portals containing `Layer` instance from `react-konva`. |

### Portal

Special, own children teleporting component.

| Prop          | Note                                                                                                                   |
| :------------ | :--------------------------------------------------------------------------------------------------------------------- |
| containerId   | Optional. Accepts `string` value and should match id prop of `Group` or `Layer` in order for content to be rendered.   |
| zIndex        | Optional. Specifies stacking order in container.                                                                       |
| children      | Required. This property holds "travelling" content.                                                                    |

### Layer

Container component with portals' content hosting capabilities. It&nbsp;accepts all `Konva.Layer` props and forwards the original
`ref`.

| Prop | Note                                                   |
| :--- | :----------------------------------------------------- |
| id   | Required. Accepts `string` value and should be unique. |

### Group

Container component with portals' content hosting capabilities. It&nbsp;accept all `Konva.Node` props and forwards the original `ref`.

| Prop | Note                                                   |
| :--- | :----------------------------------------------------- |
| id   | Required. Accepts `string` value and should be unique. |

## Contribute

Use the [issue tracker](https://github.com/papahigh/react-konva-portal/issues) and/or open
[pull requests](https://github.com/papahigh/react-konva-portal/pulls).

## License

MIT © [papahigh](https://github.com/papahigh)
