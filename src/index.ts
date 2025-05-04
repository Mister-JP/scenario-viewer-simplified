/**
 * SCENARIO VIEWER APPLICATION INITIALIZER
 * 
 * This is the entry point for our "Scenario Viewer" product - an interactive tool 
 * that helps teams visualize and connect different scenario views through a 
 * drag-and-drop interface. Think of it as a digital whiteboard where each card 
 * represents a scenario that can be moved and connected to show relationships.
 * 
 * Product Features Orchestrated Here:
 * - Card-based scenario display with iframe previews
 * - Drag-and-drop repositioning of scenario cards
 * - Visual connection lines between related scenarios
 * - Save/load layouts for team collaboration
 * - Host URL management for content source
 */

import { html, render } from 'lit-html';
import { mount } from 'motion';
import { renderApp } from './templates/app';
import { setupDragAndDrop } from './interactions/card-drag';
import { setupConnectionSystem } from './interactions/connections';
import { initializeLayoutPersistence } from './interactions/layout';
import { loadDefaultCards } from './state/loading';
import { atom } from 'nanostores';

// Create a dirty flag to track state changes
const $isDirty = atom<boolean>(false);

// Track all state atoms for change detection
const stateAtoms = new Set<any>();

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const appRoot = document.getElementById('workspace');
  if (!appRoot) {
    throw new Error('Cannot initialize: workspace element not found');
  }

  // Subscribe to state changes
  subscribeToStateChanges();
  
  // Set up layout persistence first
  initializeLayoutPersistence();
  
  // Load default cards before rendering
  loadDefaultCards();
  
  // Initial render
  render(renderApp(), appRoot);
  
  // Set up interactions AFTER initial render
  requestAnimationFrame(() => {
    setupDragAndDrop();
    setupConnectionSystem();
  });
  
  // Start render loop
  runRenderLoop();
});

/**
 * Renders the app only when state has changed
 * Product Impact: Optimizes performance by only updating UI when necessary
 */
function runRenderLoop() {
  function renderLoop() {
    if ($isDirty.get()) {
      const appRoot = document.getElementById('workspace');
      if (appRoot) {
        render(renderApp(), appRoot);
        $isDirty.set(false);
      }
    }
    requestAnimationFrame(renderLoop);
  }
  
  requestAnimationFrame(renderLoop);
}

/**
 * Sets up subscriptions to all state atoms to mark dirty when changed
 * Product Purpose: Ensures UI always reflects latest user changes
 */
function subscribeToStateChanges() {
  import('./state').then(state => {
    const { $allCards, $allConnections, $activeDraggedCard, $pendingConnection, $hostUrl } = state;
    
    // Add all state atoms to tracking set
    [
      $allCards,
      $allConnections, 
      $activeDraggedCard,
      $pendingConnection,
      $hostUrl
    ].forEach(atom => {
      stateAtoms.add(atom);
      atom.subscribe(() => $isDirty.set(true));
    });
  });
}