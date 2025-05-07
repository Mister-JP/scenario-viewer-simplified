// src/templates/app.ts
/**
 * MAIN APPLICATION TEMPLATE
 */

import { html, nothing } from 'lit-html'; // Import nothing
import { $allCards, $allConnections, $pendingConnection } from '../state';
import { renderHeader } from './header';
import { renderCard } from './card';
import { renderAllConnections, getConnectionPointOnCard } from './connection'; 
import { log, error } from '../utils/logger'; // Import logger

/**
 * Renders the complete application UI.
 */
export function renderApp() {
  const cards = $allCards.get();
  const connections = $allConnections.get();
  const pending = $pendingConnection.get();
  
  let pendingLineHtml = nothing; // Use 'nothing' for no output

  if (pending) {
    log('RenderApp: Pending connection detected', pending);
    const fromCardElement = document.querySelector(`[data-card-id="${pending.fromCardId}"]`) as HTMLElement;
    
    if (fromCardElement) {
      log('RenderApp: Found fromCardElement for pending line', { id: fromCardElement.dataset.cardId });
      const startPoint = getConnectionPointOnCard(fromCardElement, pending.fromSide, 0.5); // Assuming 0.5 for midpoint for now
      
      if (startPoint && !isNaN(startPoint.x) && !isNaN(startPoint.y)) {
        log('RenderApp: Drawing pending line', { 
            fromX: startPoint.x, fromY: startPoint.y, 
            toX: pending.currentX, toY: pending.currentY 
        });
        pendingLineHtml = html`
          <line
            class="connection-line pending"
            x1="${startPoint.x}"
            y1="${startPoint.y}"
            x2="${pending.currentX}" 
            y2="${pending.currentY}"
            stroke-dasharray="5,5"
            marker-end="url(#arrow-head-pending)"
          />
        `;
      } else {
        error('RenderApp: Failed to get valid startPoint for pending line', { startPoint, cardId: pending.fromCardId });
      }
    } else {
      log('RenderApp: Could not find fromCardElement for pending line.', { fromCardId: pending.fromCardId });
      // This can happen briefly if the card is removed while dragging, or if state updates out of sync.
      // To be safe, don't draw if the source card element isn't there.
    }
  }

  return html`
    ${renderHeader()}
    
    <svg 
      id="connections-svg" 
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;"
    >
      <defs>
        <marker
          id="arrow-head"
          viewBox="0 0 10 10"
          refX="8" 
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#444" />
        </marker>
        <marker
            id="arrow-head-pending"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
        >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(100,100,100,0.7)" />
        </marker>
      </defs>
      
      ${renderAllConnections(connections, cards)}
      ${pendingLineHtml}
    </svg>
    
    <div id="workspace-content" class="workspace-content">
      ${cards.map(card => renderCard(card))}
    </div>
  `;
}