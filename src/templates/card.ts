/**
 * SCENARIO CARD COMPONENT
 * 
 * This template represents a single scenario view - the core building block
 * of our visualization tool. Each card displays a specific scenario through
 * an iframe and can be moved, connected, and resized by users.
 * 
 * Product Features:
 * - Draggable handle for repositioning
 * - Connection points (dots) for creating relationships
 * - Iframe display for scenario content
 * - Visual stacking order
 */

import { html } from 'lit-html';
import { CardLayout } from '../state';
import { $hostUrl, $activeDraggedCard } from '../state';

/**
 * Renders a single scenario card with all interactive elements.
 * Product Purpose: Displays a scenario view that users can organize and connect.
 */
export function renderCard(card: CardLayout) {
  const hostUrl = $hostUrl.get();
  const isBeingDragged = $activeDraggedCard.get() === card.id;
  const isDraggingOther = $activeDraggedCard.get() !== null && !isBeingDragged;
  
  return html`
    <div 
      class="card ${isBeingDragged ? 'dragging' : ''} ${isDraggingOther ? 'other-dragging' : ''}"
      style="
        left: ${card.x}px;
        top: ${card.y}px;
        width: ${card.width}px;
        height: ${card.height}px;
        z-index: ${card.zIndex};
        position: absolute;
      "
      data-card-id="${card.id}"
    >
      <!-- Card header with drag handle -->
      <div class="card-header">
        <div 
          class="drag-handle" 
          data-drag-handle
          title="Drag to reposition this scenario card"
        ></div>
        <h2>Scenario ${card.id}</h2>
      </div>
      
      <!-- Scenario content display -->
      <div class="card-content">
        <iframe 
          src="${hostUrl}?scenario=${card.id}"
          frameborder="0"
          title="Scenario ${card.id} preview"
        ></iframe>
      </div>
      
      <!-- Connection points for linking cards -->
      <div class="connection-points">
        ${renderConnectionDots(card.id)}
      </div>
    </div>
  `;
}

/**
 * Renders the connection dots on each side of the card.
 * Product Purpose: Provides attachment points for creating visual relationships
 * between scenario cards.
 * 
 * Dot Positions:
 * - 0: Top center
 * - 1: Right center  
 * - 2: Bottom center
 * - 3: Left center
 */
function renderConnectionDots(cardId: number) {
  const positions = [
    { side: 0, style: 'top: 0; left: 50%; transform: translate(-50%, -50%);' },
    { side: 1, style: 'top: 50%; left: 100%; transform: translate(-50%, -50%);' },
    { side: 2, style: 'top: 100%; left: 50%; transform: translate(-50%, -50%);' },
    { side: 3, style: 'top: 50%; left: 0; transform: translate(-50%, -50%);' }
  ];
  
  return positions.map(pos => html`
    <div 
      class="connection-dot"
      style="${pos.style}"
      data-card-id="${cardId}"
      data-side="${pos.side}"
      title="Click and drag to create a connection to another card"
    ></div>
  `);
}