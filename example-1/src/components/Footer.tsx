import React, { MouseEvent } from 'react';

export interface FooterProps {
  portalEnabled: boolean;
  overlayEnabled: boolean;
  togglePortalEnabled(): void;
  toggleOverlayEnabled(): void;
}

export function Footer({ portalEnabled, overlayEnabled, togglePortalEnabled, toggleOverlayEnabled }: FooterProps) {
  return (
    <footer>
      <ul>
        <li>
          <FeatureControl
            enabled={portalEnabled}
            enabledLabel="Portals are used"
            disabledLabel="Portals are disabled"
            enableButtonLabel="enable"
            disableButtonLabel="disable"
            toggleEnabled={togglePortalEnabled}
          />
        </li>
        <li>
          <FeatureControl
            enabled={overlayEnabled}
            enabledLabel="Overlay is shown"
            disabledLabel="Overlay is hidden"
            enableButtonLabel="show"
            disableButtonLabel="hide"
            toggleEnabled={toggleOverlayEnabled}
          />
        </li>
      </ul>
    </footer>
  );
}

export interface FeatureControlProps {
  enabled: boolean;
  enableButtonLabel: string;
  enabledLabel: string;
  disabledLabel: string;
  disableButtonLabel: string;
  toggleEnabled(): void;
}

function FeatureControl({
  enabled,
  enableButtonLabel,
  enabledLabel,
  disableButtonLabel,
  disabledLabel,
  toggleEnabled,
}: FeatureControlProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toggleEnabled();
  };
  return (
    <p>
      {enabled ? '✅' : '⛔️'}
      &nbsp;
      <b>{enabled ? enabledLabel : disabledLabel}</b>
      &nbsp;
      <a href="#?" onClick={handleClick}>
        {!enabled ? enableButtonLabel : disableButtonLabel}
      </a>
    </p>
  );
}
