/**
 * MAIN APPLICATION TEMPLATE
 * 
 * This is the visual blueprint for our Scenario Viewer application.
 * It organizes all UI elements into a cohesive workspace where teams can
 * visualize and connect their scenarios.
 * 
 * Product Layout:
 * - Header with controls (save, load, reset, host management)
 * - SVG layer for connection lines (shows relationships)
 * - Card workspace (scenario cards with drag-and-drop)
 */

import { html } from 'lit-html';
import { $allCards, $allConnections } from '../state';
import { renderHeader } from './header';
import { renderCard } from './card';
import { renderAllConnections } from './connection';

/**
 * Renders the complete application UI.
 * Product Purpose: Combines all visual elements into a unified workspace
 * for scenario visualization and organization.
 */
export function renderApp() {
  const cards = $allCards.get();
  const connections = $allConnections.get();
  
  return html`
    ${renderHeader()}
    
    <!-- Connection visualization layer - sits below cards but above background -->
    <svg 
      id="connections-svg" 
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;"
    >
      <!-- Connection visual definitions -->
      <defs>
        <marker
          id="arrow-head"
          markerWidth="10"
          markerHeight="7"
          refX="7"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#444" />
        </marker>
      </defs>
      
      ${renderAllConnections(connections)}
    </svg>
    
    <!-- Scenario cards workspace -->
    <div class="workspace-content">
      ${cards.map(card => renderCard(card))}
    </div>
  `;
}