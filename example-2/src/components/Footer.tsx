import React from 'react';

export interface FooterProps {
  moveToB(): void;
  moveToC(): void;
  moveTo1(): void;
  moveTo2(): void;
  moveTo3(): void;
}

export function Footer({ moveToB, moveToC, moveTo1, moveTo2, moveTo3 }: FooterProps) {
  return (
    <footer>
      <p>
        Instructions: Drag and drop the groups and observe that the&nbsp;A&nbsp;circle is&nbsp;bound to&nbsp;either
        the&nbsp;B&nbsp;group or&nbsp;C&nbsp;group.
      </p>
      <ul>
        <li>
          <FeatureControl label="Move A to B" onClick={moveToB} />
        </li>
        <li>
          <FeatureControl label="Move A to C" onClick={moveToC} />
        </li>
        <li>
          <FeatureControl label="Move A to Layer1" onClick={moveTo1} />
        </li>
        <li>
          <FeatureControl label="Move A to Layer2" onClick={moveTo2} />
        </li>
        <li>
          <FeatureControl label="Move A to Layer3" onClick={moveTo3} />
        </li>
      </ul>
    </footer>
  );
}

interface FeatureControlProps {
  label: string;
  onClick(): void;
}

function FeatureControl({ label, onClick }: FeatureControlProps) {
  return (
    <p>
      <button type="button" onClick={onClick}>
        <span role="img" aria-label={label}>
          👉
        </span>
        &nbsp; {label}
      </button>
    </p>
  );
}
