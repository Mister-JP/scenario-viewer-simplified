/**
 * CONNECTION LINE VISUALIZATION
 * 
 * This template renders the visual connections between scenario cards.
 * Connections are drawn as SVG lines with arrowheads, showing the
 * direction and relationship between different scenarios.
 * 
 * Product Purpose: Makes relationships between scenarios visible,
 * helping teams understand dependencies and flows.
 */

import { html } from 'lit-html';
import { Connection } from '../state';

/**
 * Renders all connection lines in the workspace.
 * Product Context: Visual representation of scenario relationships.
 */
export function renderAllConnections(connections: Connection[]) {
  return connections.map(conn => renderSingleConnection(conn));
}

/**
 * Renders a single connection line between two cards.
 * The line connects specific points on each card's edge.
 */
function renderSingleConnection(connection: Connection) {
  const fromCard = getCardElement(connection.fromCardId);
  const toCard = getCardElement(connection.toCardId);
  
  if (!fromCard || !toCard) {
    return html``;
  }
  
  const fromPoint = getConnectionPoint(fromCard, connection.fromSide, connection.fromPosition);
  const toPoint = getConnectionPoint(toCard, connection.toSide, connection.toPosition);
  
  return html`
    <line
      class="connection-line"
      x1="${fromPoint.x}"
      y1="${fromPoint.y}"
      x2="${toPoint.x}"
      y2="${toPoint.y}"
      marker-end="url(#arrow-head)"
      data-connection-id="${connection.id}"
      @dblclick=${() => handleConnectionClick(connection.id)}
      title="Double-click to remove this connection"
    />
  `;
}

/**
 * Gets the DOM element for a card by its ID.
 * Product Context: Locates visual card elements for connection drawing.
 */
function getCardElement(cardId: number): HTMLElement | null {
  return document.querySelector(`[data-card-id="${cardId}"]`);
}

/**
 * Calculates the exact pixel coordinates for a connection point.
 * Product Logic: Determines where to start/end connections on card edges.
 * 
 * Connection points:
 * - Side 0: Top edge
 * - Side 1: Right edge
 * - Side 2: Bottom edge  
 * - Side 3: Left edge
 * 
 * Position: 0-1 value indicating relative position along edge
 */
function getConnectionPoint(card: HTMLElement, side: number, position: number) {
  const rect = card.getBoundingClientRect();
  
  switch (side) {
    case 0: // Top
      return { x: rect.left + rect.width * position, y: rect.top };
    case 1: // Right
      return { x: rect.right, y: rect.top + rect.height * position };
    case 2: // Bottom
      return { x: rect.left + rect.width * position, y: rect.bottom };
    case 3: // Left
      return { x: rect.left, y: rect.top + rect.height * position };
    default:
      return { x: rect.left, y: rect.top };
  }
}

/**
 * Handles connection deletion when double-clicked.
 * Product Flow: User wants to remove a relationship → double-clicks line → connection deleted
 */
function handleConnectionClick(connectionId: string) {
  import('../state').then(({ removeConnection }) => {
    removeConnection(connectionId);
  });
}