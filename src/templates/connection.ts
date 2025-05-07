// src/templates/connection.ts
/**
 * CONNECTION LINE VISUALIZATION
 */

import { html, nothing } from 'lit-html'; // Import nothing
import { Connection, CardLayout } from '../state';
import { log, error } from '../utils/logger';

/**
 * Renders all connection lines in the workspace.
 */
export function renderAllConnections(connections: Connection[], cardsData?: CardLayout[]) {
  if (!connections || connections.length === 0) return nothing;
  return connections.map(conn => renderSingleConnection(conn, cardsData));
}

/**
 * Renders a single connection line between two cards.
 */
function renderSingleConnection(connection: Connection, allCardsData?: CardLayout[]) {
  const fromCardElement = getCardElement(connection.fromCardId);
  const toCardElement = getCardElement(connection.toCardId);
  
  if (!fromCardElement || !toCardElement) {
    // log('Could not render connection, card element(s) not found', { connectionId: connection.id, fromFound: !!fromCardElement, toFound: !!toCardElement });
    return nothing; 
  }
  
  const fromPoint = getConnectionPointOnCard(fromCardElement, connection.fromSide, connection.fromPosition);
  const toPoint = getConnectionPointOnCard(toCardElement, connection.toSide, connection.toPosition);
  
  if (isNaN(fromPoint.x) || isNaN(fromPoint.y) || isNaN(toPoint.x) || isNaN(toPoint.y)) {
    error('Failed to render connection due to NaN coordinates', {connectionId: connection.id, fromPoint, toPoint });
    return nothing;
  }
  // log('Rendering connection', { id: connection.id, from: fromPoint, to: toPoint });

  return html`
    <line
      class="connection-line"
      x1="${fromPoint.x}"
      y1="${fromPoint.y}"
      x2="${toPoint.x}"
      y2="${toPoint.y}"
      marker-end="url(#arrow-head)"
      data-connection-id="${connection.id}"
      @dblclick=${(e: MouseEvent) => {
          e.stopPropagation(); 
          handleConnectionDoubleClick(connection.id);
      }}
      title="Double-click to remove this connection"
    />
  `;
}

/**
 * Gets the DOM element for a card by its ID.
 */
function getCardElement(cardId: number): HTMLElement | null {
  // Query within the specific workspace content area if possible, though global query should also work for unique IDs
  const workspaceContent = document.getElementById('workspace-content');
  if (workspaceContent) {
      return workspaceContent.querySelector(`.card[data-card-id="${cardId}"]`);
  }
  return document.querySelector(`.card[data-card-id="${cardId}"]`);
}

/**
 * Calculates the exact viewport pixel coordinates for a connection point on a card's edge.
 */
export function getConnectionPointOnCard(cardElement: HTMLElement, side: number, positionRatio: number) {
  if (!cardElement) {
    error('getConnectionPointOnCard: cardElement is null');
    return { x: NaN, y: NaN };
  }
  const rect = cardElement.getBoundingClientRect(); // Viewport-relative coordinates
  
  let x = 0, y = 0;

  switch (side) {
    case 0: // Top
      x = rect.left + rect.width * positionRatio;
      y = rect.top;
      break;
    case 1: // Right
      x = rect.right;
      y = rect.top + rect.height * positionRatio;
      break;
    case 2: // Bottom
      x = rect.left + rect.width * positionRatio;
      y = rect.bottom;
      break;
    case 3: // Left
      x = rect.left;
      y = rect.top + rect.height * positionRatio;
      break;
    default: 
      error('Invalid side provided to getConnectionPointOnCard', { side, cardId: cardElement.dataset.cardId });
      return { x: rect.left, y: rect.top }; // Fallback, but ideally should not happen
  }
  return { x, y };
}

/**
 * Handles connection deletion when double-clicked.
 */
function handleConnectionDoubleClick(connectionId: string) {
  log('Connection double-clicked for removal', { connectionId });
  // Dynamic import for state modification functions
  import('../state').then(({ removeConnection }) => {
    removeConnection(connectionId);
  }).catch(err => {
    error('Failed to dynamically import removeConnection for double click', err);
  });
}